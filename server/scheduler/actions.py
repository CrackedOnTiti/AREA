from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from database.models import WorkflowLog, Action, UserServiceConnection, Service
from utils.gmail_client import create_gmail_service, fetch_new_emails, check_sender_match, check_subject_contains
from utils.drive_client import create_drive_service, fetch_recent_files, get_folder_id_by_name
from utils.facebook_client import fetch_user_posts, check_post_contains_keyword
from utils.github_client import fetch_repo_stargazers, fetch_repo_issues, fetch_repo_pull_requests
from utils.spotify_client import get_playlist_tracks, get_user_saved_tracks, get_current_playback
from config import Config


def check_interval_elapsed(area) -> bool:
    """Check if the specified interval has elapsed since last trigger"""
    interval_minutes = area.action_config.get('interval_minutes')
    if not interval_minutes:
        print(f"Warning: Area {area.id} missing interval_minutes config")
        return False

    try:
        interval_minutes = int(interval_minutes)
    except (ValueError, TypeError):
        print(f"Warning: Area {area.id} has invalid interval_minutes: {interval_minutes}")
        return False

    now = datetime.now(timezone.utc)

    # If never triggered, trigger now
    if not area.last_triggered:
        return True

    # Ensure last_triggered is timezone-aware
    last_triggered = area.last_triggered
    if last_triggered.tzinfo is None:
        last_triggered = last_triggered.replace(tzinfo=timezone.utc)

    # Check if enough time has elapsed
    minutes_since_last = (now - last_triggered).total_seconds() / 60
    return minutes_since_last >= interval_minutes


def check_time_matches(area) -> bool:
    """Check if current time matches the configured time in area.action_config"""
    config_time = area.action_config.get('time')
    if not config_time:
        print(f"Warning: Area {area.id} missing time config")
        return False

    # Get user's timezone from config, fallback to server default
    user_timezone = area.action_config.get('timezone', Config.SCHEDULER_TIMEZONE)
    try:
        tz = ZoneInfo(user_timezone)
    except Exception:
        tz = ZoneInfo(Config.SCHEDULER_TIMEZONE)

    # Get current time in user's timezone
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


def check_gmail_email_received(area) -> dict:
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


def check_drive_new_file(area) -> dict:
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


def check_facebook_new_post(area) -> dict:
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


def check_github_repo_activity(area) -> dict:
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


def check_spotify_activity(area) -> dict:
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
