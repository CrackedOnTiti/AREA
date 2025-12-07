import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config


def send_email(to: str, subject: str, body: str, html: bool = False) -> dict:
    """Send an email via SMTP using configured credentials."""
    # Validate configuration
    if not Config.SMTP_USERNAME or not Config.SMTP_PASSWORD:
        return {
            'success': False,
            'message': 'Email sending failed',
            'error': 'SMTP credentials not configured (missing SMTP_USERNAME or SMTP_PASSWORD)'
        }

    if not to:
        return {
            'success': False,
            'message': 'Email sending failed',
            'error': 'Recipient email address is required'
        }

    try:
        # Create message
        message = MIMEMultipart('alternative') # Alternative basically removes the html for older emails
        message['From'] = Config.SMTP_FROM_EMAIL or Config.SMTP_USERNAME
        message['To'] = to
        message['Subject'] = subject

        # Attach body as plain text or HTML
        if html:
            message.attach(MIMEText(body, 'html'))
        else:
            message.attach(MIMEText(body, 'plain'))

        # Connect to SMTP server
        with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=10) as server:
            # Start TLS encryption
            if Config.SMTP_USE_TLS:
                server.starttls()

            # Login to SMTP server
            server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)

            # Send email
            server.send_message(message)

        return {
            'success': True,
            'message': f'Email sent successfully to {to}'
        }

    except smtplib.SMTPAuthenticationError as e:
        return {
            'success': False,
            'message': 'Email sending failed',
            'error': f'SMTP authentication failed: {str(e)} (check SMTP_USERNAME and SMTP_PASSWORD)'
        }

    except smtplib.SMTPConnectError as e:
        return {
            'success': False,
            'message': 'Email sending failed',
            'error': f'Failed to connect to SMTP server: {str(e)} (check SMTP_HOST and SMTP_PORT)'
        }

    except smtplib.SMTPException as e:
        return {
            'success': False,
            'message': 'Email sending failed',
            'error': f'SMTP error: {str(e)}'
        }

    except Exception as e:
        return {
            'success': False,
            'message': 'Email sending failed',
            'error': f'Unexpected error: {str(e)}'
        }


# def send_workflow_email(to: str, subject: str, body: str, workflow_name: str = None) -> dict:
#     """Send a workflow-triggered email with standardized formatting."""
#     # Add workflow branding to email body
#     formatted_body = body
#     if workflow_name:
#         formatted_body = f"[Workflow: {workflow_name}]\n\n{body}"
#
#     formatted_body += "\n\n---\nThis email was sent automatically by your AREA workflow."
#
#     return send_email(to, subject, formatted_body, html=False)
