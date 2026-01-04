# Google Services (Gmail & Drive)

## Overview

Google services integration provides automation for Gmail email monitoring and Google Drive file management. Both services share the same OAuth connection, allowing seamless integration across Google's ecosystem.

## Connection Setup

1. Navigate to `/api/connections/gmail` or use the frontend connection interface
2. Authorize AREA to access your Google account
3. OAuth scopes granted:
   - `openid`, `email`, `profile` - Basic authentication
   - `https://www.googleapis.com/auth/gmail.readonly` - Read Gmail
   - `https://www.googleapis.com/auth/drive` - Manage Google Drive files

**Note:** One OAuth connection enables both Gmail and Drive services.

---

## Gmail Service

### Service Details

- **Service Name:** `gmail`
- **Display Name:** Gmail
- **Description:** Email detection and monitoring
- **Requires OAuth:** Yes
- **Actions:** 2
- **Reactions:** 0

### Actions

#### 1. Email Received From

**Name:** `email_received_from`

**Description:** Triggers when an email is received from a specific sender.

**Configuration:**
```json
{
  "sender": "example@domain.com"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sender` | string | Yes | Email address of the sender (must be valid email format) |

**Example Workflow:**
```json
{
  "name": "Alert on Boss Emails",
  "action_id": <email_received_from_id>,
  "reaction_id": <send_email_id>,
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

#### 2. Email Subject Contains

**Name:** `email_subject_contains`

**Description:** Triggers when an email subject line contains a specific keyword.

**Configuration:**
```json
{
  "keyword": "urgent"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | Yes | Keyword to search for in email subject (case-insensitive) |

**Example Workflow:**
```json
{
  "name": "Flag Urgent Emails",
  "action_id": <email_subject_contains_id>,
  "reaction_id": <log_message_id>,
  "action_config": {
    "keyword": "URGENT"
  },
  "reaction_config": {
    "message": "Urgent email detected!"
  }
}
```

---

## Google Drive Service

### Service Details

- **Service Name:** `drive`
- **Display Name:** Google Drive
- **Description:** Cloud storage and file management
- **Requires OAuth:** Yes
- **Actions:** 2
- **Reactions:** 3

### Actions

#### 1. New File in Folder

**Name:** `new_file_in_folder`

**Description:** Triggers when a new file is added to a specific folder in Google Drive.

**Configuration:**
```json
{
  "folder_name": "Work Documents"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `folder_name` | string | Yes | Name of the folder to monitor |

**Example Workflow:**
```json
{
  "name": "Backup Work Docs",
  "action_id": <new_file_in_folder_id>,
  "reaction_id": <send_email_id>,
  "action_config": {
    "folder_name": "Important Projects"
  },
  "reaction_config": {
    "to": "backup@service.com",
    "subject": "New file added",
    "body": "A new file was added to Important Projects folder"
  }
}
```

---

#### 2. New File Uploaded

**Name:** `new_file_uploaded`

**Description:** Triggers when any new file is uploaded to Google Drive (monitors all folders).

**Configuration:**
```json
{}
```

**Parameters:** None

**Example Workflow:**
```json
{
  "name": "Track All Uploads",
  "action_id": <new_file_uploaded_id>,
  "reaction_id": <log_message_id>,
  "action_config": {},
  "reaction_config": {
    "message": "New file uploaded to Drive"
  }
}
```

---

### Reactions

#### 1. Create File

**Name:** `create_file`

**Description:** Creates a new text file in Google Drive.

**Configuration:**
```json
{
  "file_name": "notes.txt",
  "content": "File content here",
  "folder_name": "My Folder"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file_name` | string | Yes | Name of the file to create |
| `content` | string | Yes | Text content of the file |
| `folder_name` | string | No | Folder name (omit for root directory) |

**Example Workflow:**
```json
{
  "name": "Daily Note Creation",
  "action_id": <time_matches_id>,
  "reaction_id": <create_file_id>,
  "action_config": {
    "time": "09:00"
  },
  "reaction_config": {
    "file_name": "daily-log.txt",
    "content": "Daily log entry",
    "folder_name": "Logs"
  }
}
```

---

#### 2. Create Folder

**Name:** `create_folder`

**Description:** Creates a new folder in Google Drive.

**Configuration:**
```json
{
  "folder_name": "Project Files"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `folder_name` | string | Yes | Name of the folder to create |

**Example Workflow:**
```json
{
  "name": "Monthly Folder Setup",
  "action_id": <date_matches_id>,
  "reaction_id": <create_folder_id>,
  "action_config": {
    "date": "01/01"
  },
  "reaction_config": {
    "folder_name": "January 2025"
  }
}
```

---

#### 3. Share File

**Name:** `share_file`

**Description:** Shares an existing file in Google Drive with another user.

**Configuration:**
```json
{
  "file_name": "report.pdf",
  "email": "colleague@company.com",
  "role": "reader"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file_name` | string | Yes | Name of the file to share |
| `email` | string | Yes | Email address to share with (valid email format) |
| `role` | string | Yes | Permission level: `reader` or `writer` |

**Example Workflow:**
```json
{
  "name": "Auto-Share Reports",
  "action_id": <new_file_in_folder_id>,
  "reaction_id": <share_file_id>,
  "action_config": {
    "folder_name": "Reports"
  },
  "reaction_config": {
    "file_name": "weekly-report.pdf",
    "email": "manager@company.com",
    "role": "reader"
  }
}
```

---

## Common Use Cases

### 1. Email Notification on Important Messages
- **Trigger:** Email received from specific sender
- **Action:** Send notification email to personal account

### 2. Auto-Organize Drive Files
- **Trigger:** New file uploaded to Drive
- **Action:** Create folder structure based on date

### 3. Collaborative File Sharing
- **Trigger:** New file in shared folder
- **Action:** Automatically share with team members

### 4. Backup Important Emails
- **Trigger:** Email subject contains "backup"
- **Action:** Create Drive file with email details

---

## API Endpoints

See [OAuth Connections](./api-oauth-connections.md#gmail-oauth-connections) for connection endpoints.

## Troubleshooting

**Gmail Not Detecting Emails:**
- Check OAuth connection is active
- Verify sender email address is exact match
- Scheduler runs every 1 minute - there may be a delay

**Drive File Creation Fails:**
- Ensure OAuth permissions include Drive scope
- Check folder name exists (if specified)
- Verify file name doesn't contain invalid characters

**Sharing Fails:**
- Verify email address format is valid
- Check that file exists in Drive
- Ensure `role` is either `reader` or `writer`
