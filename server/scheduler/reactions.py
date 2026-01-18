from database.models import Reaction, UserServiceConnection, Service
from utils.email_sender import send_email
from utils.drive_client import create_drive_service, get_folder_id_by_name, create_file, create_folder, share_file
from utils.facebook_client import create_post
from utils.github_client import create_issue
from utils.spotify_client import (
    get_user_profile, add_track_to_playlist,
    create_playlist as spotify_create_playlist, start_playback
)


def execute_send_email(area) -> dict:
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


def execute_drive_create_file(area) -> dict:
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


def execute_drive_create_folder(area) -> dict:
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


def execute_drive_share_file(area) -> dict:
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


def execute_facebook_create_post(area) -> dict:
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


def execute_github_create_issue(area) -> dict:
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


def execute_spotify_add_to_playlist(area) -> dict:
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


def execute_spotify_create_playlist(area) -> dict:
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


def execute_spotify_start_playback(area) -> dict:
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


def execute_reaction(area) -> dict:
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
