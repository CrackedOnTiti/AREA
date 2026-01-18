# SMTP Setup

## Overview

AREA can send emails as a reaction in workflows using SMTP. This guide covers how to configure your SMTP server to enable the "Send Email" reaction.

---

## Configuration

SMTP settings are configured via environment variables. See [Configuration](./configuration.md) for full details.

### Required Environment Variables

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_USE_TLS=true
```

### Common SMTP Providers

| Provider | Host | Port | Notes |
|----------|------|------|-------|
| Gmail | `smtp.gmail.com` | 587 | Requires App Password |
| Outlook | `smtp-mail.outlook.com` | 587 | Use account password |
| Yahoo | `smtp.mail.yahoo.com` | 587 | Requires App Password |
| SendGrid | `smtp.sendgrid.net` | 587 | Use API key as password |

---

## Gmail SMTP Setup

Gmail requires an App Password (not your regular password):

1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and your device
4. Click "Generate"
5. Use the 16-character password as `SMTP_PASSWORD`

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=yourname@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App Password
SMTP_FROM_EMAIL=yourname@gmail.com
SMTP_USE_TLS=true
```

---

## Reactions

### Send Email

**Name:** `send_email`

**Description:** Sends an email to a specified recipient.

**Configuration:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email body content"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Recipient email address |
| `subject` | string | Yes | Email subject line (max 200 chars) |
| `body` | string | Yes | Email body content (max 5000 chars) |

---

## Example Workflows

### 1. Daily Reminder Email

Send yourself a reminder every day at 9 AM:

```json
{
  "name": "Daily Reminder",
  "action_id": 1,
  "reaction_id": 1,
  "action_config": {
    "time": "09:00"
  },
  "reaction_config": {
    "to": "me@example.com",
    "subject": "Daily Reminder",
    "body": "Don't forget to check your tasks!"
  }
}
```

### 2. GitHub Star Notification

Get emailed when someone stars your repository:

```json
{
  "name": "Star Alert",
  "action_id": "<new_star_on_repo_id>",
  "reaction_id": "<send_email_id>",
  "action_config": {
    "repo_name": "username/my-project"
  },
  "reaction_config": {
    "to": "me@example.com",
    "subject": "New GitHub Star!",
    "body": "Someone starred your repository!"
  }
}
```

### 3. Gmail to Personal Email Forward

Forward emails from a specific sender to another address:

```json
{
  "name": "Forward Boss Emails",
  "action_id": "<email_received_from_id>",
  "reaction_id": "<send_email_id>",
  "action_config": {
    "sender": "boss@company.com"
  },
  "reaction_config": {
    "to": "personal@email.com",
    "subject": "Work Email Alert",
    "body": "You received an email from your boss!"
  }
}
```

---

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials:**
   ```bash
   # Verify environment variables are set
   docker-compose exec server env | grep SMTP
   ```

2. **Test SMTP connection:**
   ```python
   import smtplib
   server = smtplib.SMTP('smtp.gmail.com', 587)
   server.starttls()
   server.login('user@gmail.com', 'app-password')
   ```

3. **Check workflow logs:**
   ```bash
   curl http://localhost:8080/api/areas/1/logs \
     -H "Authorization: Bearer <token>"
   ```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Authentication failed | Wrong password | Use App Password for Gmail |
| Connection refused | Wrong host/port | Verify SMTP settings |
| TLS required | Missing TLS config | Set `SMTP_USE_TLS=true` |
| Recipient rejected | Invalid email | Check recipient address |

### Gmail-Specific Issues

- **"Less secure app" error:** Gmail no longer supports this. Use App Passwords instead.
- **"Sign-in attempt blocked":** Enable 2FA and use App Password.
- **Daily limit reached:** Gmail limits to ~500 emails/day for personal accounts.

---

## Related Documentation

- [Configuration](./configuration.md) - Full SMTP configuration options
- [Services & Workflows](./api-services.md) - API endpoints for workflows
