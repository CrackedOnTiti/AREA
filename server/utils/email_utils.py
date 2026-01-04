import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config


def send_email(to_email, subject, html_body):
    """Send an email via SMTP"""
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = Config.SMTP_FROM_EMAIL
        msg['To'] = to_email

        # Attach HTML body
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)

        # Connect to SMTP server
        if Config.SMTP_USE_TLS:
            server = smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT)
            server.starttls()
        else:
            server = smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT)

        # Login and send
        if Config.SMTP_USERNAME and Config.SMTP_PASSWORD:
            server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)

        server.send_message(msg)
        server.quit()

        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False


def send_password_reset_email(to_email, reset_token):
    """Send password reset email"""
    reset_url = f"{Config.CORS_ORIGINS[0]}/reset-password?token={reset_token}"

    subject = "AREA - Password Reset Request"

    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #fff; background-color: #000; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000;">
                <h2 style="color: #fff;">Password Reset Request</h2>
                <p style="color: #fff;">You requested to reset your password for your AREA account.</p>
                <p style="color: #fff;">Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}"
                       style="background-color: #fff; color: #000; padding: 12px 30px;
                              text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #aaa; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="{reset_url}" style="color: #fff; text-decoration: underline;">{reset_url}</a>
                </p>
                <p style="color: #aaa; font-size: 14px;">
                    This link will expire in 1 hour.
                </p>
                <p style="color: #aaa; font-size: 14px;">
                    If you didn't request this password reset, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    AREA - Action REAction Automation Platform
                </p>
            </div>
        </body>
    </html>
    """

    return send_email(to_email, subject, html_body)
