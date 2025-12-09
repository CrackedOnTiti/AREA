from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from database.models import db, UserArea, WorkflowLog, Action, Reaction, UserServiceConnection, Service
from utils.email_sender import send_email
from utils.gmail_client import create_gmail_service, fetch_new_emails, check_sender_match, check_subject_contains
from config import Config

scheduler = None


def check_time_matches(area: UserArea) -> bool:
    """Check if current time matches the configured time in area.action_config"""
    config_time = area.action_config.get('time')
    if not config_time:
        print(f"Warning: Area {area.id} missing time config")
        return False

    # Get current time in format HH:MM
    now = datetime.now(timezone.utc)
    current_time = now.strftime('%H:%M')

    # Check if times match
    if current_time == config_time:
        # Prevent duplicate triggers within the same minute
        if area.last_triggered:
            # Ensure last_triggered is timezone-aware for comparison
            last_triggered = area.last_triggered
            if last_triggered.tzinfo is None:
                last_triggered = last_triggered.replace(tzinfo=timezone.utc)

            # If we already triggered in the last 60 seconds, skip
            seconds_since_last = (now - last_triggered).total_seconds()
            if seconds_since_last < 60:
                return False
        return True
    return False


def execute_send_email(area: UserArea) -> dict:
    """Execute the send_email reaction"""
    config = area.reaction_config
    to_email = config.get('to')
    subject = config.get('subject', 'AREA Notification')
    body = config.get('body', 'This is an automated message from AREA')

    if not to_email:
        return {
            'success': False,
            'error': 'No recipient email specified in reaction_config'
        }

    # Send the email
    result = send_email(to_email, subject, body, html=False)
    return result


def execute_reaction(area: UserArea) -> dict:
    """Execute the appropriate reaction based on the reaction type"""
    reaction = Reaction.query.get(area.reaction_id)

    if not reaction:
        return {
            'success': False,
            'error': f'Reaction {area.reaction_id} not found'
        }

    # Route to appropriate executor based on reaction name
    if reaction.name == 'send_email':
        return execute_send_email(area)
    else:
        return {
            'success': False,
            'error': f'Unknown reaction type: {reaction.name}'
        }


def check_and_execute_workflows(app):
    """Main scheduler function: check all active workflows and execute if triggered"""
    with app.app_context():
        executed_count = 0

        try:
            # Get all active workflows with timer actions
            timer_service_actions = Action.query.filter(
                Action.service_id.in_(
                    db.session.query(db.func.distinct(Action.service_id))
                    .filter(Action.name == 'time_matches')
                )
            ).all()

            timer_action_ids = [action.id for action in timer_service_actions]

            if not timer_action_ids:
                return

            # Query active areas with timer actions
            active_areas = UserArea.query.filter(
                UserArea.is_active == True,
                UserArea.action_id.in_(timer_action_ids)
            ).all()

            for area in active_areas:
                try:
                    # Check if the action should trigger
                    action = Action.query.get(area.action_id)

                    if not action:
                        continue

                    should_trigger = False

                    # Check action type
                    if action.name == 'time_matches':
                        should_trigger = check_time_matches(area)

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
                        log_entry = WorkflowLog(
                            area_id=area.id,
                            status='success' if result['success'] else 'failed',
                            message=result.get('message') or result.get('error', 'Unknown result'),
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

    if not Config.SCHEDULER_ENABLED:
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
