from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from database.models import db, UserArea, WorkflowLog, Action, Reaction, UserServiceConnection, Service
from utils.email_sender import send_email
from utils.gmail_client import create_gmail_service, fetch_new_emails, check_sender_match, check_subject_contains
from utils.drive_client import create_drive_service, fetch_recent_files, get_folder_id_by_name, create_file, create_folder, share_file
from utils.facebook_client import fetch_user_posts, check_post_contains_keyword, create_post
from utils.github_client import fetch_repo_stargazers, fetch_repo_issues, fetch_repo_pull_requests, create_issue
from utils.spotify_client import (
    get_playlist_tracks, get_user_saved_tracks, get_current_playback, get_user_profile,
    add_track_to_playlist, create_playlist as spotify_create_playlist, start_playback
)
from config import Config

scheduler = None


def check_time_matches(area: UserArea) -> bool:
    """Check if current time matches the configured time in area.action_config"""
    config_time = area.action_config.get('time')
    if not config_time:
        print(f"Warning: Area {area.id} missing time config")
        return False

    # Get current time in configured timezone (defaults to UTC)
    tz = ZoneInfo(Config.SCHEDULER_TIMEZONE)
    now = datetime.now(tz)
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


def check_drive_new_file(area: UserArea) -> dict:
    """Check Google Drive for new files"""
    # Get user's Drive connection
    action = Action.query.get(area.action_id)
    drive_service = Service.query.filter_by(name='drive').first()

    if not drive_service:
        return {'triggered': False, 'error': 'Drive service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=drive_service.id
    ).first()

    if not connection:
        return {'triggered': False, 'error': 'Drive not connected for this user'}

    # Create Drive API service
    drive_api = create_drive_service(connection.access_token, connection.refresh_token)
    if not drive_api:
        return {'triggered': False, 'error': 'Failed to create Drive service'}

    # Calculate "since" timestamp (check files from last 5 minutes)
    since = datetime.now(timezone.utc) - timedelta(minutes=5)
    since_timestamp = int(since.timestamp())

    # Check action type
    if action.name == 'new_file_in_folder':
        folder_name = area.action_config.get('folder_name')
        if not folder_name:
            return {'triggered': False, 'error': 'No folder_name specified'}

        # Get folder ID
        folder_id = get_folder_id_by_name(drive_api, folder_name)
        if not folder_id:
            return {'triggered': False, 'error': f'Folder "{folder_name}" not found'}

        # Fetch recent files in folder
        files = fetch_recent_files(drive_api, folder_id=folder_id, since_timestamp=since_timestamp)

    elif action.name == 'new_file_uploaded':
        # Fetch any recent files
        files = fetch_recent_files(drive_api, since_timestamp=since_timestamp)

    else:
        return {'triggered': False, 'error': f'Unknown action: {action.name}'}

    if not files:
        return {'triggered': False}

    # Check each file
    for file in files:
        # Check if we've already processed this file (otherwise multiple files in a folder cause email spamming)
        # Use LIKE query to match the file ID anywhere in the message
        existing_log = WorkflowLog.query.filter(
            WorkflowLog.area_id == area.id,
            WorkflowLog.message.contains(file['id'])
        ).first()

        if existing_log:
            continue

        return {'triggered': True, 'file_data': file}

    return {'triggered': False}


def check_facebook_new_post(area: UserArea) -> dict:
    """Check Facebook for new posts"""
    # Get user's Facebook connection
    action = Action.query.get(area.action_id)
    facebook_service = Service.query.filter_by(name='facebook').first()

    if not facebook_service:
        return {'triggered': False, 'error': 'Facebook service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=facebook_service.id
    ).first()

    if not connection:
        return {'triggered': False, 'error': 'Facebook not connected for this user'}

    # Calculate "since" timestamp (check posts from last 5 minutes)
    since = datetime.now(timezone.utc) - timedelta(minutes=5)
    since_timestamp = int(since.timestamp())

    # Fetch recent posts
    posts = fetch_user_posts(connection.access_token, since_timestamp=since_timestamp, limit=10)

    if not posts:
        return {'triggered': False}

    # Check each post against action criteria
    for post in posts:
        # Check if we've already processed this post
        existing_log = WorkflowLog.query.filter_by(
            area_id=area.id,
            message=f"Facebook post: {post['message'][:50]}"
        ).first()

        if existing_log:
            continue  # Already processed

        # Check action type
        if action.name == 'new_post_created':
            return {'triggered': True, 'post_data': post}

        elif action.name == 'post_contains_keyword':
            keyword = area.action_config.get('keyword')
            if keyword and check_post_contains_keyword(post, keyword):
                return {'triggered': True, 'post_data': post}

    return {'triggered': False}


def check_github_repo_activity(area: UserArea) -> dict:
    """Check GitHub for repository activity"""
    # Get user's GitHub connection
    action = Action.query.get(area.action_id)
    github_service = Service.query.filter_by(name='github').first()

    if not github_service:
        return {'triggered': False, 'error': 'GitHub service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=github_service.id
    ).first()

    if not connection:
        return {'triggered': False, 'error': 'GitHub not connected for this user'}

    # Get repo name from config
    repo_name = area.action_config.get('repo_name')
    if not repo_name:
        return {'triggered': False, 'error': 'No repo_name specified'}

    # Calculate "since" timestamp (check activity from last 5 minutes)
    since = datetime.now(timezone.utc) - timedelta(minutes=5)
    since_timestamp = int(since.timestamp())

    # Check action type
    if action.name == 'new_star_on_repo':
        stars = fetch_repo_stargazers(connection.access_token, repo_name, since_timestamp=since_timestamp, limit=10)

        for star in stars:
            # Check if we've already processed this star
            existing_log = WorkflowLog.query.filter_by(
                area_id=area.id,
                message=f"New star from {star['user']}"
            ).first()

            if existing_log:
                continue

            return {'triggered': True, 'star_data': star}

    elif action.name == 'new_issue_created':
        issues = fetch_repo_issues(connection.access_token, repo_name, since_timestamp=since_timestamp, limit=10)

        for issue in issues:
            # Check if we've already processed this issue
            existing_log = WorkflowLog.query.filter_by(
                area_id=area.id,
                message=f"Issue #{issue['number']}: {issue['title']}"
            ).first()

            if existing_log:
                continue

            return {'triggered': True, 'issue_data': issue}

    elif action.name == 'new_pr_opened':
        prs = fetch_repo_pull_requests(connection.access_token, repo_name, since_timestamp=since_timestamp, limit=10)

        for pr in prs:
            # Check if we've already processed this PR
            existing_log = WorkflowLog.query.filter_by(
                area_id=area.id,
                message=f"PR #{pr['number']}: {pr['title']}"
            ).first()

            if existing_log:
                continue

            return {'triggered': True, 'pr_data': pr}

    return {'triggered': False}


def check_spotify_activity(area: UserArea) -> dict:
    """Check Spotify for new activity (tracks added, saved, playback)"""
    # Get user's Spotify connection
    action = Action.query.get(area.action_id)
    spotify_service = Service.query.filter_by(name='spotify').first()

    if not spotify_service:
        return {'triggered': False, 'error': 'Spotify service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=spotify_service.id
    ).first()

    if not connection:
        return {'triggered': False, 'error': 'Spotify not connected for this user'}

    # Calculate "since" timestamp (check activity from last 5 minutes)
    since = datetime.now(timezone.utc) - timedelta(minutes=5)
    since_timestamp = int(since.timestamp())

    if action.name == 'track_added_to_playlist':
        playlist_id = area.action_config.get('playlist_id')
        if not playlist_id:
            return {'triggered': False, 'error': 'Missing playlist_id in config'}

        tracks = get_playlist_tracks(connection.access_token, playlist_id, since_timestamp=since_timestamp, limit=10)

        for track in tracks:
            # Check if we've already processed this track
            existing_log = WorkflowLog.query.filter_by(
                area_id=area.id,
                message=f"Track added: {track['name']} by {track['artists']}"
            ).first()

            if existing_log:
                continue

            return {'triggered': True, 'track_data': track}

    elif action.name == 'track_saved':
        tracks = get_user_saved_tracks(connection.access_token, since_timestamp=since_timestamp, limit=10)

        for track in tracks:
            # Check if we've already processed this track
            existing_log = WorkflowLog.query.filter_by(
                area_id=area.id,
                message=f"Track saved: {track['name']} by {track['artists']}"
            ).first()

            if existing_log:
                continue

            return {'triggered': True, 'track_data': track}

    elif action.name == 'playback_started':
        playback = get_current_playback(connection.access_token)

        if playback and playback.get('is_playing'):
            # Check if we've already logged this playback session recently
            existing_log = WorkflowLog.query.filter_by(
                area_id=area.id,
                message=f"Now playing: {playback['track_name']} by {playback['artists']}"
            ).first()

            if existing_log:
                # Check if it was logged recently (within last 5 minutes)
                log_time = existing_log.triggered_at
                if log_time.tzinfo is None:
                    log_time = log_time.replace(tzinfo=timezone.utc)

                time_since_log = (datetime.now(timezone.utc) - log_time).total_seconds()
                if time_since_log < 300:  # 5 minutes
                    return {'triggered': False}

            return {'triggered': True, 'playback_data': playback}

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


def execute_drive_create_file(area: UserArea) -> dict:
    """Execute the create_file reaction for Google Drive"""
    # Get user's Drive connection
    drive_service = Service.query.filter_by(name='drive').first()
    if not drive_service:
        return {'success': False, 'error': 'Drive service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=drive_service.id
    ).first()

    if not connection:
        return {'success': False, 'error': 'Drive not connected'}

    # Create Drive API service
    drive_api = create_drive_service(connection.access_token, connection.refresh_token)
    if not drive_api:
        return {'success': False, 'error': 'Failed to create Drive service'}

    # Get config
    config = area.reaction_config
    file_name = config.get('file_name')
    content = config.get('content', '')
    folder_name = config.get('folder_name')

    if not file_name:
        return {'success': False, 'error': 'No file_name specified'}

    # Get folder ID if specified
    folder_id = None
    if folder_name:
        folder_id = get_folder_id_by_name(drive_api, folder_name)
        if not folder_id:
            return {'success': False, 'error': f'Folder "{folder_name}" not found'}

    # Create file
    result = create_file(drive_api, file_name, content, folder_id=folder_id)
    if result.get('success'):
        result['message'] = f"Created file: {file_name}"

    return result


def execute_drive_create_folder(area: UserArea) -> dict:
    """Execute the create_folder reaction for Google Drive"""
    # Get user's Drive connection
    drive_service = Service.query.filter_by(name='drive').first()
    if not drive_service:
        return {'success': False, 'error': 'Drive service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=drive_service.id
    ).first()

    if not connection:
        return {'success': False, 'error': 'Drive not connected'}

    # Create Drive API service
    drive_api = create_drive_service(connection.access_token, connection.refresh_token)
    if not drive_api:
        return {'success': False, 'error': 'Failed to create Drive service'}

    # Get config
    config = area.reaction_config
    folder_name = config.get('folder_name')

    if not folder_name:
        return {'success': False, 'error': 'No folder_name specified'}

    # Create folder
    result = create_folder(drive_api, folder_name)
    if result.get('success'):
        result['message'] = f"Created folder: {folder_name}"

    return result


def execute_drive_share_file(area: UserArea) -> dict:
    """Execute the share_file reaction for Google Drive"""
    # Get user's Drive connection
    drive_service = Service.query.filter_by(name='drive').first()
    if not drive_service:
        return {'success': False, 'error': 'Drive service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=drive_service.id
    ).first()

    if not connection:
        return {'success': False, 'error': 'Drive not connected'}

    # Create Drive API service
    drive_api = create_drive_service(connection.access_token, connection.refresh_token)
    if not drive_api:
        return {'success': False, 'error': 'Failed to create Drive service'}

    # Get config
    config = area.reaction_config
    file_name = config.get('file_name')
    email = config.get('email')
    role = config.get('role', 'reader')

    if not file_name or not email:
        return {'success': False, 'error': 'Missing file_name or email'}

    # Find file by name
    try:
        results = drive_api.files().list(
            q=f"name='{file_name}' and trashed=false",
            pageSize=1,
            fields='files(id, name)'
        ).execute()

        files = results.get('files', [])
        if not files:
            return {'success': False, 'error': f'File "{file_name}" not found'}

        file_id = files[0]['id']

        # Share file
        result = share_file(drive_api, file_id, email, role)
        if result.get('success'):
            result['message'] = f"Shared {file_name} with {email}"

        return result

    except Exception as e:
        return {'success': False, 'error': str(e)}


def execute_facebook_create_post(area: UserArea) -> dict:
    """Execute the create_post reaction for Facebook"""
    # Get user's Facebook connection
    facebook_service = Service.query.filter_by(name='facebook').first()
    if not facebook_service:
        return {'success': False, 'error': 'Facebook service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=facebook_service.id
    ).first()

    if not connection:
        return {'success': False, 'error': 'Facebook not connected'}

    # Get config
    config = area.reaction_config
    message = config.get('message')

    if not message:
        return {'success': False, 'error': 'Missing message'}

    # Create post
    result = create_post(connection.access_token, message)
    return result


def execute_github_create_issue(area: UserArea) -> dict:
    """Execute the create_issue reaction for GitHub"""
    # Get user's GitHub connection
    github_service = Service.query.filter_by(name='github').first()
    if not github_service:
        return {'success': False, 'error': 'GitHub service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=github_service.id
    ).first()

    if not connection:
        return {'success': False, 'error': 'GitHub not connected'}

    # Get config
    config = area.reaction_config
    repo_name = config.get('repo_name')
    title = config.get('title')
    body = config.get('body', '')

    if not repo_name or not title:
        return {'success': False, 'error': 'Missing repo_name or title'}

    # Create issue
    result = create_issue(connection.access_token, repo_name, title, body)
    return result


def execute_spotify_add_to_playlist(area: UserArea) -> dict:
    """Execute the add_to_playlist reaction for Spotify"""
    # Get user's Spotify connection
    spotify_service = Service.query.filter_by(name='spotify').first()
    if not spotify_service:
        return {'success': False, 'error': 'Spotify service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=spotify_service.id
    ).first()

    if not connection:
        return {'success': False, 'error': 'Spotify not connected'}

    # Get config
    config = area.reaction_config
    playlist_id = config.get('playlist_id')
    track_uri = config.get('track_uri')

    if not playlist_id or not track_uri:
        return {'success': False, 'error': 'Missing playlist_id or track_uri'}

    # Add track to playlist
    result = add_track_to_playlist(connection.access_token, playlist_id, track_uri)
    return result


def execute_spotify_create_playlist(area: UserArea) -> dict:
    """Execute the create_playlist reaction for Spotify"""
    # Get user's Spotify connection
    spotify_service = Service.query.filter_by(name='spotify').first()
    if not spotify_service:
        return {'success': False, 'error': 'Spotify service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=spotify_service.id
    ).first()

    if not connection:
        return {'success': False, 'error': 'Spotify not connected'}

    # Get user profile to get user ID
    user_profile = get_user_profile(connection.access_token)
    if not user_profile:
        return {'success': False, 'error': 'Failed to get Spotify user profile'}

    # Get config
    config = area.reaction_config
    name = config.get('name')
    description = config.get('description', '')
    public = config.get('public', True)

    if not name:
        return {'success': False, 'error': 'Missing playlist name'}

    # Create playlist
    result = spotify_create_playlist(connection.access_token, user_profile['id'], name, description, public)
    return result


def execute_spotify_start_playback(area: UserArea) -> dict:
    """Execute the start_playback reaction for Spotify"""
    # Get user's Spotify connection
    spotify_service = Service.query.filter_by(name='spotify').first()
    if not spotify_service:
        return {'success': False, 'error': 'Spotify service not found'}

    connection = UserServiceConnection.query.filter_by(
        user_id=area.user_id,
        service_id=spotify_service.id
    ).first()

    if not connection:
        return {'success': False, 'error': 'Spotify not connected'}

    # Get config
    config = area.reaction_config
    track_uri = config.get('track_uri')
    context_uri = config.get('context_uri')

    # Start playback
    result = start_playback(connection.access_token, track_uri=track_uri, context_uri=context_uri)
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
    elif reaction.name == 'create_file':
        return execute_drive_create_file(area)
    elif reaction.name == 'create_folder':
        return execute_drive_create_folder(area)
    elif reaction.name == 'share_file':
        return execute_drive_share_file(area)
    elif reaction.name == 'create_post':
        return execute_facebook_create_post(area)
    elif reaction.name == 'create_issue':
        return execute_github_create_issue(area)
    elif reaction.name == 'add_to_playlist':
        return execute_spotify_add_to_playlist(area)
    elif reaction.name == 'create_playlist':
        return execute_spotify_create_playlist(area)
    elif reaction.name == 'start_playback':
        return execute_spotify_start_playback(area)
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
