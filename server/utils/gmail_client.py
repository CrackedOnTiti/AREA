from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timezone
import base64


def create_gmail_service(access_token, refresh_token=None):
    """Create Gmail API service with user's OAuth token"""
    try:
        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=None,  # Not needed for API calls
            client_secret=None
        )

        service = build('gmail', 'v1', credentials=credentials)
        return service
    except Exception as e:
        print(f"Error creating Gmail service: {str(e)}")
        return None


def fetch_new_emails(service, since_timestamp=None, max_results=10):
    """Fetch new emails from Gmail"""
    try:
        # Build query
        query_parts = []
        if since_timestamp:
            query_parts.append(f'after:{int(since_timestamp)}')

        query = ' '.join(query_parts) if query_parts else None

        # List messages
        results = service.users().messages().list(
            userId='me',
            q=query,
            maxResults=max_results
        ).execute()

        messages = results.get('messages', [])

        if not messages:
            return []

        # Fetch full message details
        emails = []
        for msg in messages:
            email_data = get_email_details(service, msg['id'])
            if email_data:
                emails.append(email_data)

        return emails

    except HttpError as error:
        print(f"Gmail API error: {error}")
        return []
    except Exception as e:
        print(f"Error fetching emails: {str(e)}")
        return []


def get_email_details(service, message_id):
    """Get detailed information about a specific email"""
    try:
        message = service.users().messages().get(
            userId='me',
            id=message_id,
            format='full'
        ).execute()

        # Extract headers
        headers = message['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
        sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown')
        date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), None)

        # Extract body
        body = extract_message_body(message['payload'])

        # Parse timestamp
        timestamp = message['internalDate']  # Milliseconds since epoch
        timestamp_seconds = int(timestamp) / 1000
        email_datetime = datetime.fromtimestamp(timestamp_seconds, tz=timezone.utc)

        return {
            'id': message_id,
            'sender': sender,
            'subject': subject,
            'body': body,
            'timestamp': email_datetime,
            'snippet': message.get('snippet', '')
        }

    except Exception as e:
        print(f"Error getting email details: {str(e)}")
        return None


def extract_message_body(payload):
    """Extract plain text body from email payload"""
    try:
        # Check if body is directly available
        if 'body' in payload and 'data' in payload['body']:
            return decode_base64(payload['body']['data'])

        # Check parts for multipart messages
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        return decode_base64(part['body']['data'])

                # Recursively check nested parts
                if 'parts' in part:
                    body = extract_message_body(part)
                    if body:
                        return body

        return ""

    except Exception as e:
        print(f"Error extracting body: {str(e)}")
        return ""


def decode_base64(data):
    """Decode base64url encoded string"""
    try:
        # Gmail uses base64url encoding
        decoded_bytes = base64.urlsafe_b64decode(data)
        return decoded_bytes.decode('utf-8')
    except Exception as e:
        print(f"Error decoding base64: {str(e)}")
        return ""


def check_sender_match(email, target_sender):
    """Check if email sender matches target"""
    # Extract email address from "Name <email@example.com>" format
    sender = email['sender'].lower()
    target = target_sender.lower()

    if target in sender:
        return True

    # Try to extract just the email address
    if '<' in sender and '>' in sender:
        email_part = sender.split('<')[1].split('>')[0]
        if email_part == target:
            return True

    return False


def check_subject_contains(email, keyword):
    """Check if email subject contains keyword"""
    subject = email['subject'].lower()
    keyword_lower = keyword.lower()
    return keyword_lower in subject
