from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseUpload
from datetime import datetime, timezone
import io


def create_drive_service(access_token, refresh_token=None):
    """Create Google Drive API service with user's OAuth token"""
    try:
        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=None,  # Not needed for API calls
            client_secret=None
        )

        service = build('drive', 'v3', credentials=credentials)
        return service
    except Exception as e:
        print(f"Error creating Drive service: {str(e)}")
        return None


def fetch_recent_files(service, folder_id=None, since_timestamp=None, max_results=10):
    """Fetch recent files from Google Drive"""
    try:
        # Build query
        query_parts = []

        if folder_id:
            query_parts.append(f"'{folder_id}' in parents")

        if since_timestamp:
            # Convert timestamp to RFC 3339 format
            dt = datetime.fromtimestamp(since_timestamp, tz=timezone.utc)
            time_str = dt.strftime('%Y-%m-%dT%H:%M:%S')
            query_parts.append(f"createdTime > '{time_str}'")

        # Exclude trashed files
        query_parts.append("trashed = false")

        query = ' and '.join(query_parts)

        # List files
        results = service.files().list(
            q=query,
            pageSize=max_results,
            fields='files(id, name, mimeType, createdTime, modifiedTime, owners, webViewLink)',
            orderBy='createdTime desc'
        ).execute()

        files = results.get('files', [])

        # Format file data
        formatted_files = []
        for file in files:
            formatted_files.append({
                'id': file['id'],
                'name': file['name'],
                'mimeType': file['mimeType'],
                'createdTime': file.get('createdTime'),
                'modifiedTime': file.get('modifiedTime'),
                'webViewLink': file.get('webViewLink', ''),
                'owner': file['owners'][0]['displayName'] if file.get('owners') else 'Unknown'
            })

        return formatted_files

    except HttpError as error:
        print(f"Drive API error: {error}")
        return []
    except Exception as e:
        print(f"Error fetching files: {str(e)}")
        return []


def get_folder_id_by_name(service, folder_name):
    """Get folder ID by name"""
    try:
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"

        results = service.files().list(
            q=query,
            pageSize=1,
            fields='files(id, name)'
        ).execute()

        files = results.get('files', [])
        return files[0]['id'] if files else None

    except Exception as e:
        print(f"Error finding folder: {str(e)}")
        return None


def create_file(service, file_name, content, mime_type='text/plain', folder_id=None):
    """Create a new file in Google Drive"""
    try:
        file_metadata = {
            'name': file_name
        }

        if folder_id:
            file_metadata['parents'] = [folder_id]

        # Convert string content to bytes
        if isinstance(content, str):
            content = content.encode('utf-8')

        media = MediaIoBaseUpload(
            io.BytesIO(content),
            mimetype=mime_type,
            resumable=True
        )

        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink'
        ).execute()

        return {
            'success': True,
            'file_id': file['id'],
            'file_name': file['name'],
            'webViewLink': file.get('webViewLink', '')
        }

    except HttpError as error:
        print(f"Drive API error: {error}")
        return {'success': False, 'error': str(error)}
    except Exception as e:
        print(f"Error creating file: {str(e)}")
        return {'success': False, 'error': str(e)}


def create_folder(service, folder_name, parent_folder_id=None):
    """Create a new folder in Google Drive"""
    try:
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }

        if parent_folder_id:
            file_metadata['parents'] = [parent_folder_id]

        folder = service.files().create(
            body=file_metadata,
            fields='id, name, webViewLink'
        ).execute()

        return {
            'success': True,
            'folder_id': folder['id'],
            'folder_name': folder['name'],
            'webViewLink': folder.get('webViewLink', '')
        }

    except HttpError as error:
        print(f"Drive API error: {error}")
        return {'success': False, 'error': str(error)}
    except Exception as e:
        print(f"Error creating folder: {str(e)}")
        return {'success': False, 'error': str(e)}


def share_file(service, file_id, email_address, role='reader'):
    """Share a file with a user"""
    try:
        permission = {
            'type': 'user',
            'role': role,
            'emailAddress': email_address
        }

        service.permissions().create(
            fileId=file_id,
            body=permission,
            sendNotificationEmail=True,
            fields='id'
        ).execute()

        return {
            'success': True,
            'message': f'File shared with {email_address} as {role}'
        }

    except HttpError as error:
        print(f"Drive API error: {error}")
        return {'success': False, 'error': str(error)}
    except Exception as e:
        print(f"Error sharing file: {str(e)}")
        return {'success': False, 'error': str(e)}
