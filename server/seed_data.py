from database.models import db, Service, Action, Reaction, User
from utils.auth_utils import hash_password

# ANSI color codes for terminal output
GREEN = '\033[92m'
CYAN = '\033[96m'
RESET = '\033[0m'


def seed_admin_user():
    """Create default admin account"""
    # Check if admin already exists
    admin = User.query.filter_by(username='admin').first()
    if admin:
        print("  Admin user already exists, skipping...")
        return admin

    # Create admin user
    admin = User(
        username='admin',
        email='admin@area.local',
        password_hash=hash_password('Admin123!')
    )
    db.session.add(admin)
    db.session.flush()

    print(f"{GREEN}      Created admin user (admin / Admin123!){RESET}")
    return admin


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

    print(f"{GREEN}      Created Timer service with 2 actions{RESET}")
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

    print(f"{GREEN}      Created Email service with 1 reaction{RESET}")
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

    print(f"{GREEN}      Created System service with 2 reactions{RESET}")
    return system


def seed_gmail_service():
    """Seed Gmail service with email detection actions"""
    # Check if already exists
    gmail = Service.query.filter_by(name='gmail').first()
    if gmail:
        print("  Gmail service already exists, skipping...")
        return gmail

    # Create Gmail service
    gmail = Service(
        name='gmail',
        display_name='Gmail',
        description='Email detection and monitoring',
        requires_oauth=True,
        is_active=True
    )
    db.session.add(gmail)
    db.session.flush()

    # Action: email_received_from
    action1 = Action(
        service_id=gmail.id,
        name='email_received_from',
        display_name='Email Received From',
        description='Triggers when email is received from a specific sender',
        config_schema={
            'type': 'object',
            'properties': {
                'sender': {
                    'type': 'string',
                    'description': 'Email address of the sender',
                    'pattern': '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
                }
            },
            'required': ['sender']
        }
    )
    db.session.add(action1)

    # Action: email_subject_contains
    action2 = Action(
        service_id=gmail.id,
        name='email_subject_contains',
        display_name='Email Subject Contains',
        description='Triggers when email subject contains specific keyword',
        config_schema={
            'type': 'object',
            'properties': {
                'keyword': {
                    'type': 'string',
                    'description': 'Keyword to search for in subject'
                }
            },
            'required': ['keyword']
        }
    )
    db.session.add(action2)

    print(f"{GREEN}      Created Gmail service with 2 actions{RESET}")
    return gmail


def seed_drive_service():
    """Seed Google Drive service with file actions and reactions"""
    # Check if already exists
    drive = Service.query.filter_by(name='drive').first()
    if drive:
        print("  Drive service already exists, skipping...")
        return drive

    # Create Drive service
    drive = Service(
        name='drive',
        display_name='Google Drive',
        description='Cloud storage and file management',
        requires_oauth=True,
        is_active=True
    )
    db.session.add(drive)
    db.session.flush()

    # Action: new_file_in_folder
    action1 = Action(
        service_id=drive.id,
        name='new_file_in_folder',
        display_name='New File in Folder',
        description='Triggers when a new file is added to a specific folder',
        config_schema={
            'type': 'object',
            'properties': {
                'folder_name': {
                    'type': 'string',
                    'description': 'Name of the folder to monitor'
                }
            },
            'required': ['folder_name']
        }
    )
    db.session.add(action1)

    # Action: new_file_uploaded
    action2 = Action(
        service_id=drive.id,
        name='new_file_uploaded',
        display_name='New File Uploaded',
        description='Triggers when any new file is uploaded to Drive',
        config_schema={
            'type': 'object',
            'properties': {}
        }
    )
    db.session.add(action2)

    # Reaction: create_file
    reaction1 = Reaction(
        service_id=drive.id,
        name='create_file',
        display_name='Create a file',
        description='Creates a new text file in Google Drive',
        config_schema={
            'type': 'object',
            'properties': {
                'file_name': {
                    'type': 'string',
                    'description': 'Name of the file to create'
                },
                'content': {
                    'type': 'string',
                    'description': 'Content of the file'
                },
                'folder_name': {
                    'type': 'string',
                    'description': 'Optional folder name (leave empty for root)'
                }
            },
            'required': ['file_name', 'content']
        }
    )
    db.session.add(reaction1)

    # Reaction: create_folder
    reaction2 = Reaction(
        service_id=drive.id,
        name='create_folder',
        display_name='Create a folder',
        description='Creates a new folder in Google Drive',
        config_schema={
            'type': 'object',
            'properties': {
                'folder_name': {
                    'type': 'string',
                    'description': 'Name of the folder to create'
                }
            },
            'required': ['folder_name']
        }
    )
    db.session.add(reaction2)

    # Reaction: share_file
    reaction3 = Reaction(
        service_id=drive.id,
        name='share_file',
        display_name='Share a file',
        description='Shares a file with a user by email',
        config_schema={
            'type': 'object',
            'properties': {
                'file_name': {
                    'type': 'string',
                    'description': 'Name of the file to share'
                },
                'email': {
                    'type': 'string',
                    'format': 'email',
                    'description': 'Email address to share with'
                },
                'role': {
                    'type': 'string',
                    'enum': ['reader', 'writer'],
                    'description': 'Permission level'
                }
            },
            'required': ['file_name', 'email', 'role']
        }
    )
    db.session.add(reaction3)

    print(f"{GREEN}      Created Drive service with 2 actions and 3 reactions{RESET}")
    return drive


def seed_facebook_service():
    """Seed Facebook service with post monitoring actions"""
    # Check if already exists
    facebook = Service.query.filter_by(name='facebook').first()
    if facebook:
        print("  Facebook service already exists, skipping...")
        return facebook

    # Create Facebook service
    facebook = Service(
        name='facebook',
        display_name='Facebook',
        description='Personal timeline post monitoring',
        requires_oauth=True,
        is_active=True
    )
    db.session.add(facebook)
    db.session.flush()

    # Action: new_post_created
    action1 = Action(
        service_id=facebook.id,
        name='new_post_created',
        display_name='New Post Created',
        description='Triggers when you create a new post on your Facebook timeline',
        config_schema={
            'type': 'object',
            'properties': {}
        }
    )
    db.session.add(action1)

    # Action: post_contains_keyword
    action2 = Action(
        service_id=facebook.id,
        name='post_contains_keyword',
        display_name='Post Contains Keyword',
        description='Triggers when your Facebook post contains a specific keyword',
        config_schema={
            'type': 'object',
            'properties': {
                'keyword': {
                    'type': 'string',
                    'description': 'Keyword to search for in post'
                }
            },
            'required': ['keyword']
        }
    )
    db.session.add(action2)

    # Reaction: create_post
    reaction1 = Reaction(
        service_id=facebook.id,
        name='create_post',
        display_name='Create Post',
        description='Creates a new post on your Facebook timeline',
        config_schema={
            'type': 'object',
            'properties': {
                'message': {
                    'type': 'string',
                    'description': 'Content of the post to create',
                    'maxLength': 5000
                }
            },
            'required': ['message']
        }
    )
    db.session.add(reaction1)

    print(f"{GREEN}      Created Facebook service with 2 actions and 1 reaction{RESET}")
    return facebook


def seed_github_service():
    """Seed GitHub service with repository monitoring"""
    # Check if already exists
    github = Service.query.filter_by(name='github').first()
    if github:
        print("  GitHub service already exists, skipping...")
        return github

    # Create GitHub service
    github = Service(
        name='github',
        display_name='GitHub',
        description='Repository monitoring and automation',
        requires_oauth=True,
        is_active=True
    )
    db.session.add(github)
    db.session.flush()

    # Action: new_star_on_repo
    action1 = Action(
        service_id=github.id,
        name='new_star_on_repo',
        display_name='New Star on Repository',
        description='Triggers when someone stars your repository',
        config_schema={
            'type': 'object',
            'properties': {
                'repo_name': {
                    'type': 'string',
                    'description': 'Repository name (e.g., username/repo)'
                }
            },
            'required': ['repo_name']
        }
    )
    db.session.add(action1)

    # Action: new_issue_created
    action2 = Action(
        service_id=github.id,
        name='new_issue_created',
        display_name='New Issue Created',
        description='Triggers when a new issue is created in your repository',
        config_schema={
            'type': 'object',
            'properties': {
                'repo_name': {
                    'type': 'string',
                    'description': 'Repository name (e.g., username/repo)'
                }
            },
            'required': ['repo_name']
        }
    )
    db.session.add(action2)

    # Action: new_pr_opened
    action3 = Action(
        service_id=github.id,
        name='new_pr_opened',
        display_name='New Pull Request Opened',
        description='Triggers when a new PR is opened in your repository',
        config_schema={
            'type': 'object',
            'properties': {
                'repo_name': {
                    'type': 'string',
                    'description': 'Repository name (e.g., username/repo)'
                }
            },
            'required': ['repo_name']
        }
    )
    db.session.add(action3)

    # Reaction: create_issue
    reaction1 = Reaction(
        service_id=github.id,
        name='create_issue',
        display_name='Create Issue',
        description='Creates a new issue in a repository',
        config_schema={
            'type': 'object',
            'properties': {
                'repo_name': {
                    'type': 'string',
                    'description': 'Repository name (e.g., username/repo)'
                },
                'title': {
                    'type': 'string',
                    'maxLength': 200,
                    'description': 'Issue title'
                },
                'body': {
                    'type': 'string',
                    'maxLength': 5000,
                    'description': 'Issue description'
                }
            },
            'required': ['repo_name', 'title', 'body']
        }
    )
    db.session.add(reaction1)

    print(f"{GREEN}      Created GitHub service with 3 actions and 1 reaction{RESET}")
    return github


def seed_spotify_service():
    """Seed Spotify service with music playback actions and reactions"""
    # Check if already exists
    spotify = Service.query.filter_by(name='spotify').first()
    if spotify:
        print("  Spotify service already exists, skipping...")
        return spotify

    # Create Spotify service
    spotify = Service(
        name='spotify',
        display_name='Spotify',
        description='Music playback control and playlist management',
        requires_oauth=True,
        is_active=True
    )
    db.session.add(spotify)
    db.session.flush()

    # Action: track_added_to_playlist
    action1 = Action(
        service_id=spotify.id,
        name='track_added_to_playlist',
        display_name='Track Added to Playlist',
        description='Triggers when a new track is added to a specific playlist',
        config_schema={
            'type': 'object',
            'properties': {
                'playlist_id': {
                    'type': 'string',
                    'description': 'Spotify playlist ID'
                }
            },
            'required': ['playlist_id']
        }
    )
    db.session.add(action1)

    # Action: track_saved
    action2 = Action(
        service_id=spotify.id,
        name='track_saved',
        display_name='Track Saved to Library',
        description='Triggers when you save (like) a new track to your library',
        config_schema={
            'type': 'object',
            'properties': {}
        }
    )
    db.session.add(action2)

    # Action: playback_started
    action3 = Action(
        service_id=spotify.id,
        name='playback_started',
        display_name='Playback Started',
        description='Triggers when you start playing music on Spotify',
        config_schema={
            'type': 'object',
            'properties': {}
        }
    )
    db.session.add(action3)

    # Reaction: add_to_playlist
    reaction1 = Reaction(
        service_id=spotify.id,
        name='add_to_playlist',
        display_name='Add Track to Playlist',
        description='Add a track to a specific playlist',
        config_schema={
            'type': 'object',
            'properties': {
                'playlist_id': {
                    'type': 'string',
                    'description': 'Spotify playlist ID'
                },
                'track_uri': {
                    'type': 'string',
                    'description': 'Spotify track URI (e.g., spotify:track:xxxxx or just track ID)'
                }
            },
            'required': ['playlist_id', 'track_uri']
        }
    )
    db.session.add(reaction1)

    # Reaction: create_playlist
    reaction2 = Reaction(
        service_id=spotify.id,
        name='create_playlist',
        display_name='Create Playlist',
        description='Create a new playlist in your Spotify account',
        config_schema={
            'type': 'object',
            'properties': {
                'name': {
                    'type': 'string',
                    'maxLength': 100,
                    'description': 'Playlist name'
                },
                'description': {
                    'type': 'string',
                    'maxLength': 300,
                    'description': 'Playlist description (optional)'
                },
                'public': {
                    'type': 'boolean',
                    'description': 'Make playlist public (default: true)'
                }
            },
            'required': ['name']
        }
    )
    db.session.add(reaction2)

    # Reaction: start_playback
    reaction3 = Reaction(
        service_id=spotify.id,
        name='start_playback',
        display_name='Start Playback',
        description='Start playing a specific track or playlist',
        config_schema={
            'type': 'object',
            'properties': {
                'track_uri': {
                    'type': 'string',
                    'description': 'Spotify track URI (optional)'
                },
                'context_uri': {
                    'type': 'string',
                    'description': 'Spotify playlist/album URI (optional)'
                }
            }
        }
    )
    db.session.add(reaction3)

    print(f"{GREEN}      Created Spotify service with 3 actions and 3 reactions{RESET}")
    return spotify


def seed_all():
    """Seed all services"""
    print(f"\n{CYAN}=== Starting database seeding ==={RESET}\n")

    seed_admin_user()
    seed_timer_service()
    seed_email_service()
    seed_system_service()
    seed_gmail_service()
    seed_drive_service()
    seed_facebook_service()
    seed_github_service()
    seed_spotify_service()

    db.session.commit()

    print(f"\n{GREEN}=== Seeding completed successfully ==={RESET}")
    print(f"{CYAN}Total services: {Service.query.count()}{RESET}")
    print(f"{CYAN}Total actions: {Action.query.count()}{RESET}")
    print(f"{CYAN}Total reactions: {Reaction.query.count()}{RESET}\n")


if __name__ == '__main__':
    from app import app

    with app.app_context():
        seed_all()
