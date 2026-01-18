from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from database.models import db, UserArea, WorkflowLog, Action
from config import Config
from .actions import (
    check_time_matches, check_interval_elapsed, check_gmail_email_received,
    check_drive_new_file, check_facebook_new_post, check_github_repo_activity,
    check_spotify_activity
)
from .reactions import execute_reaction

scheduler = None
_scheduler_lock_fd = None  # Keep lock file open to maintain lock


def check_and_execute_workflows(app):
    """Main scheduler function: check all active workflows and execute if triggered"""
    with app.app_context():
        executed_count = 0

        try:
            # Query all active workflows
            active_areas = UserArea.query.filter(UserArea.is_active == True).all()

            for area in active_areas:
                try:
                    # Check if the action should trigger
                    action = Action.query.get(area.action_id)

                    if not action:
                        continue

                    should_trigger = False
                    trigger_metadata = None

                    # Check action type
                    if action.name == 'time_matches':
                        should_trigger = check_time_matches(area)

                    elif action.name == 'interval_elapsed':
                        should_trigger = check_interval_elapsed(area)
                        if should_trigger:
                            interval_mins = area.action_config.get('interval_minutes', '?')
                            trigger_metadata = f"Interval elapsed ({interval_mins} min)"

                    elif action.name in ['email_received_from', 'email_subject_contains']:
                        result = check_gmail_email_received(area)
                        should_trigger = result.get('triggered', False)
                        if should_trigger:
                            email_data = result.get('email_data')
                            trigger_metadata = f"Email from {email_data['sender']}: {email_data['subject']}"

                    elif action.name in ['new_file_in_folder', 'new_file_uploaded']:
                        result = check_drive_new_file(area)
                        should_trigger = result.get('triggered', False)
                        if should_trigger:
                            file_data = result.get('file_data')
                            trigger_metadata = f"New file: {file_data['name']} (id:{file_data['id']})"

                    elif action.name in ['new_post_created', 'post_contains_keyword']:
                        result = check_facebook_new_post(area)
                        should_trigger = result.get('triggered', False)
                        if should_trigger:
                            post_data = result.get('post_data')
                            message_preview = post_data['message'][:50] if post_data['message'] else 'No message'
                            trigger_metadata = f"Facebook post: {message_preview}"

                    elif action.name in ['new_star_on_repo', 'new_issue_created', 'new_pr_opened']:
                        result = check_github_repo_activity(area)
                        should_trigger = result.get('triggered', False)
                        if should_trigger:
                            if action.name == 'new_star_on_repo':
                                star_data = result.get('star_data')
                                trigger_metadata = f"New star from {star_data['user']}"
                            elif action.name == 'new_issue_created':
                                issue_data = result.get('issue_data')
                                trigger_metadata = f"Issue #{issue_data['number']}: {issue_data['title']}"
                            elif action.name == 'new_pr_opened':
                                pr_data = result.get('pr_data')
                                trigger_metadata = f"PR #{pr_data['number']}: {pr_data['title']}"

                    elif action.name in ['track_added_to_playlist', 'track_saved', 'playback_started']:
                        result = check_spotify_activity(area)
                        should_trigger = result.get('triggered', False)
                        if should_trigger:
                            if action.name == 'track_added_to_playlist':
                                track_data = result.get('track_data')
                                trigger_metadata = f"Track added: {track_data['name']} by {track_data['artists']}"
                            elif action.name == 'track_saved':
                                track_data = result.get('track_data')
                                trigger_metadata = f"Track saved: {track_data['name']} by {track_data['artists']}"
                            elif action.name == 'playback_started':
                                playback_data = result.get('playback_data')
                                trigger_metadata = f"Now playing: {playback_data['track_name']} by {playback_data['artists']}"

                    if should_trigger:
                        # Execute the reaction
                        start_time = datetime.now(timezone.utc)
                        result = execute_reaction(area)
                        end_time = datetime.now(timezone.utc)

                        execution_time_ms = int((end_time - start_time).total_seconds() * 1000)

                        # Update last_triggered timestamp
                        area.last_triggered = start_time
                        db.session.commit()

                        # Log execution
                        log_message = trigger_metadata if trigger_metadata else (result.get('message') or result.get('error', 'Unknown result'))
                        log_entry = WorkflowLog(
                            area_id=area.id,
                            status='success' if result['success'] else 'failed',
                            message=log_message,
                            triggered_at=start_time,
                            execution_time_ms=execution_time_ms
                        )
                        db.session.add(log_entry)
                        db.session.commit()

                        if result['success']:
                            executed_count += 1
                        else:
                            print(f"Error: Workflow {area.id} failed - {result.get('error')}")

                except Exception as e:
                    print(f"Error: Workflow {area.id} - {str(e)}")
                    # Log the error
                    try:
                        log_entry = WorkflowLog(
                            area_id=area.id,
                            status='error',
                            message=f'Execution error: {str(e)}',
                            triggered_at=datetime.now(timezone.utc),
                            execution_time_ms=0
                        )
                        db.session.add(log_entry)
                        db.session.commit()
                    except:
                        pass

        except Exception as e:
            print(f"Scheduler error: {str(e)}")

        # Print summary only if workflows were executed
        if executed_count > 0:
            print(f"Scheduler: {executed_count} executed")


def init_scheduler(app):
    """
    Initialize and start the background scheduler
    """
    global scheduler
    import fcntl
    import os

    if not Config.SCHEDULER_ENABLED:
        return None

    # Prevent multiple scheduler instances (can happen with gunicorn workers)
    if scheduler is not None and scheduler.running:
        return scheduler

    # Use file lock to ensure only one scheduler across all workers
    global _scheduler_lock_fd
    lock_file = '/tmp/area_scheduler.lock'
    try:
        _scheduler_lock_fd = open(lock_file, 'w')
        fcntl.flock(_scheduler_lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except (IOError, OSError):
        # Another process has the lock, skip scheduler initialization
        return None

    scheduler = BackgroundScheduler(timezone=Config.SCHEDULER_TIMEZONE)

    # Add job to check workflows every minute
    scheduler.add_job(
        func=lambda: check_and_execute_workflows(app),
        trigger=IntervalTrigger(minutes=Config.SCHEDULER_CHECK_INTERVAL_MINUTES),
        id='check_workflows',
        name='Check and execute AREA workflows',
        replace_existing=True
    )
    scheduler.start()
    print(f"Scheduler started (checks every {Config.SCHEDULER_CHECK_INTERVAL_MINUTES} min)")
    return scheduler


def shutdown_scheduler():
    """Gracefully shutdown the scheduler"""
    global scheduler
    if scheduler:
        scheduler.shutdown()
