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


def check_gmail_email_received(area: UserArea) -> dict:
    """Check Gmail for new emails matching criteria"""
    # Get user's Gmail connection
    action = Action.query.get(area.action_id)
    gmail_service = Service.query.filter_by(name='gmail').first()

    if not gmail_service:
        return {'triggered': False, 'error': 'Gmail service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=gmail_service.id
    ).first()

    if not connection:
        return {'triggered': False, 'error': 'Gmail not connected for this user'}

    # Create Gmail API service
    gmail_api = create_gmail_service(connection.access_token, connection.refresh_token)
    if not gmail_api:
        return {'triggered': False, 'error': 'Failed to create Gmail service'}

    # Calculate "since" timestamp (check emails from last 5 minutes)
    since = datetime.now(timezone.utc) - timedelta(minutes=5)
    since_timestamp = int(since.timestamp())

    # Fetch new emails
    emails = fetch_new_emails(gmail_api, since_timestamp=since_timestamp, max_results=10)

    if not emails:
        return {'triggered': False}

    # Check each email against action criteria
    for email in emails:
        # Check if we've already processed this email
        existing_log = WorkflowLog.query.filter_by(
            area_id=area.id,
            message=f"Email from {email['sender']}: {email['subject']}"
        ).first()

        if existing_log:
            continue  # Already processed

        # Check action type
        if action.name == 'email_received_from':
            target_sender = area.action_config.get('sender')
            if target_sender and check_sender_match(email, target_sender):
                return {'triggered': True, 'email_data': email}

        elif action.name == 'email_subject_contains':
            keyword = area.action_config.get('keyword')
            if keyword and check_subject_contains(email, keyword):
                return {'triggered': True, 'email_data': email}

    return {'triggered': False}


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

                    elif action.name in ['email_received_from', 'email_subject_contains']:
                        result = check_gmail_email_received(area)
                        should_trigger = result.get('triggered', False)
                        if should_trigger:
                            email_data = result.get('email_data')
                            trigger_metadata = f"Email from {email_data['sender']}: {email_data['subject']}"

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
