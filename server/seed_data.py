from database.models import db, Service, Action, Reaction


def seed_admin_user():
    """Create default admin account"""
    print("TODO: ADD ADMIN ACCOUNT CREATION LOGIC")


def seed_timer_service():
    """Seed Timer service with time-based actions"""
    # Check if already exists
    timer = Service.query.filter_by(name='timer').first()
    if timer:
        print("  Timer service already exists, skipping...")
        return timer

    # Create Timer service
    timer = Service(
        name='timer',
        display_name='Timer',
        description='Time-based triggers and scheduling',
        requires_oauth=False,
        is_active=True
    )
    db.session.add(timer)
    db.session.flush()  # Basically "commits" temporarily to create relationshipds, foreign keys...

    # Action: time_matches
    action_time_matches = Action(
        service_id=timer.id,
        name='time_matches',
        display_name='Time matches HH:MM',
        description='Triggers when current time matches specified time (checks every minute)',
        config_schema={
            'type': 'object',
            'properties': {
                'time': {
                    'type': 'string',
                    'pattern': '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
                    'description': 'Time in HH:MM format (24-hour)'
                }
            },
            'required': ['time']
        }
    )
    db.session.add(action_time_matches)

    # Action: interval_elapsed
    action_interval = Action(
        service_id=timer.id,
        name='interval_elapsed',
        display_name='Every X minutes',
        description='Triggers every specified number of minutes',
        config_schema={
            'type': 'object',
            'properties': {
                'interval_minutes': {
                    'type': 'integer',
                    'minimum': 1,
                    'description': 'Interval in minutes'
                }
            },
            'required': ['interval_minutes']
        }
    )
    db.session.add(action_interval)

    print(f"    Created Timer service with 2 actions")
    return timer


def seed_email_service():
    """Seed Email service with email sending reaction"""
    # Check if already exists
    email = Service.query.filter_by(name='email').first()
    if email:
        print("  Email service already exists, skipping...")
        return email

    # Create Email service
    email = Service(
        name='email',
        display_name='Email',
        description='Send emails via SMTP',
        requires_oauth=False,
        is_active=True
    )
    db.session.add(email)
    db.session.flush()

    # Reaction: send_email
    reaction_send_email = Reaction(
        service_id=email.id,
        name='send_email',
        display_name='Send an email',
        description='Sends an email to the specified recipient',
        config_schema={
            'type': 'object',
            'properties': {
                'to': {
                    'type': 'string',
                    'format': 'email',
                    'description': 'Recipient email address'
                },
                'subject': {
                    'type': 'string',
                    'maxLength': 200,
                    'description': 'Email subject line'
                },
                'body': {
                    'type': 'string',
                    'maxLength': 5000,
                    'description': 'Email body content'
                }
            },
            'required': ['to', 'subject', 'body']
        }
    )
    db.session.add(reaction_send_email)

    print(f"    Created Email service with 1 reaction")
    return email


def seed_system_service():
    """Seed System service with logging reactions"""
    # Check if already exists
    system = Service.query.filter_by(name='system').first()
    if system:
        print("  System service already exists, skipping...")
        return system

    # Create System service
    system = Service(
        name='system',
        display_name='System',
        description='System-level actions and reactions',
        requires_oauth=False,
        is_active=True
    )
    db.session.add(system)
    db.session.flush()  # Get system.id

    # Reaction: log_message
    reaction_log = Reaction(
        service_id=system.id,
        name='log_message',
        display_name='Log a message',
        description='Saves a message to workflow execution logs',
        config_schema={
            'type': 'object',
            'properties': {
                'message': {
                    'type': 'string',
                    'maxLength': 500,
                    'description': 'Message to log'
                }
            },
            'required': ['message']
        }
    )
    db.session.add(reaction_log)

    # Reaction: send_notification
    reaction_notify = Reaction(
        service_id=system.id,
        name='send_notification',
        display_name='Send notification',
        description='Logs notification to console (placeholder for real notifications)',
        config_schema={
            'type': 'object',
            'properties': {
                'title': {
                    'type': 'string',
                    'maxLength': 100,
                    'description': 'Notification title'
                },
                'body': {
                    'type': 'string',
                    'maxLength': 500,
                    'description': 'Notification body'
                }
            },
            'required': ['title', 'body']
        }
    )
    db.session.add(reaction_notify)

    print(f"    Created System service with 2 reactions")
    return system


def seed_all():
    """Seed all services for MVP"""
    print("\n=== Starting database seeding ===\n")

    seed_admin_user()
    seed_timer_service()
    seed_email_service()
    seed_system_service()

    db.session.commit()

    print("\n=== Seeding completed successfully ===")
    print(f"Total services: {Service.query.count()}")
    print(f"Total actions: {Action.query.count()}")
    print(f"Total reactions: {Reaction.query.count()}\n")


if __name__ == '__main__':
    from app import app

    with app.app_context():
        seed_all()
