# Configuration

This guide covers all environment variables and configuration options for the AREA application.

## Environment Variables

The application is configured through environment variables. Create a `.env` file in the `server/` directory with the following variables:

---

## Database Configuration

### `DATABASE_URL`

**Description:** PostgreSQL database connection string

**Required:** No

**Default:** `postgresql://area_user:area_password@localhost:5432/area_db`

**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`

**Example:**
```bash
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/area_db
```

---

## Authentication & Security

### `JWT_SECRET_KEY`

**Description:** Secret key for signing JWT tokens. Also used for Flask session management.

**Required:** Yes

**Default:** None

**Security Note:** Use a strong, random string. Never commit this to version control.

**Example:**
```bash
JWT_SECRET_KEY=your-super-secret-key-here-change-this-in-production
```

**Generate a secure key:**
```bash
openssl rand -hex 32"
```

---

## CORS Configuration

### `CORS_ORIGINS`

**Description:** Comma-separated list of allowed origins for CORS requests

**Required:** No

**Default:** `*` (allows all origins)

**Example:**
```bash
# Allow all origins (development only)
CORS_ORIGINS=*

# Allow specific origins (production)
CORS_ORIGINS=http://localhost:3000,https://myapp.com
```

---

## Google OAuth2 Configuration

These credentials are required for Google OAuth login and Gmail integration.

### `GOOGLE_CLIENT_ID`

**Description:** OAuth 2.0 Client ID from Google Cloud Console

**Required:** Yes (for OAuth features)

**Default:** None

**Example:**
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### `GOOGLE_CLIENT_SECRET`

**Description:** OAuth 2.0 Client Secret from Google Cloud Console

**Required:** Yes (for OAuth features)

**Default:** None

**Example:**
```bash
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### Setting up Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google+ API (for OAuth login)
   - Gmail API (for email monitoring)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:8080/api/auth/google/callback` (for login)
   - `http://localhost:8080/api/connections/gmail/callback` (for Gmail)
7. Copy the Client ID and Client Secret to your `.env` file

---

## SMTP Email Configuration

Configure SMTP settings to enable the application to send emails (for the `send_email` reaction).

### `SMTP_HOST`

**Description:** SMTP server hostname

**Required:** No

**Default:** `smtp.gmail.com`

**Example:**
```bash
SMTP_HOST=smtp.gmail.com
```

### `SMTP_PORT`

**Description:** SMTP server port

**Required:** No

**Default:** `587`

**Common ports:**
- `587` - TLS (recommended)
- `465` - SSL
- `25` - Unencrypted (not recommended)

**Example:**
```bash
SMTP_PORT=587
```

### `SMTP_USERNAME`

**Description:** SMTP authentication username (usually your email address)

**Required:** Yes (for email sending)

**Default:** None

**Example:**
```bash
SMTP_USERNAME=your-email@gmail.com
```

### `SMTP_PASSWORD`

**Description:** SMTP authentication password

**Required:** Yes (for email sending)

**Default:** None

**Security Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

**Example:**
```bash
SMTP_PASSWORD=your-app-password-here
```

### `SMTP_FROM_EMAIL`

**Description:** Email address to use in the "From" field

**Required:** No

**Default:** Same as `SMTP_USERNAME`

**Example:**
```bash
SMTP_FROM_EMAIL=noreply@myapp.com
```

### `SMTP_USE_TLS`

**Description:** Whether to use TLS encryption

**Required:** No

**Default:** `true`

**Values:** `true` or `false`

**Example:**
```bash
SMTP_USE_TLS=true
```

### Gmail SMTP Setup:

1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use this app password as `SMTP_PASSWORD`

---

## Scheduler Configuration

The scheduler automatically checks and executes workflows at regular intervals.

### `SCHEDULER_ENABLED`

**Description:** Enable or disable the background scheduler

**Required:** No

**Default:** `true`

**Values:** `true` or `false`

**Example:**
```bash
SCHEDULER_ENABLED=true
```

### `SCHEDULER_CHECK_INTERVAL_MINUTES`

**Description:** How often (in minutes) the scheduler checks for workflows to execute

**Required:** No

**Default:** `1`

**Recommended:** `1` for testing, `5` or more for production

**Example:**
```bash
SCHEDULER_CHECK_INTERVAL_MINUTES=1
```

### `SCHEDULER_TIMEZONE`

**Description:** Timezone for the scheduler (affects time-based triggers)

**Required:** No

**Default:** `UTC`

**Format:** [IANA timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

**Example:**
```bash
# UTC
SCHEDULER_TIMEZONE=UTC

# Paris time
SCHEDULER_TIMEZONE=Europe/Paris

# New York time
SCHEDULER_TIMEZONE=America/New_York
```

---

## Flask Configuration

### `FLASK_APP`

**Description:** Entry point for Flask application

**Required:** No (for development)

**Default:** `app.py`

**Example:**
```bash
FLASK_APP=app.py
```

### `FLASK_ENV`

**Description:** Flask environment mode

**Required:** No

**Default:** `development`

**Values:**
- `development` - Debug mode enabled, auto-reload on code changes
- `production` - Debug mode disabled, optimized for performance

**Example:**
```bash
FLASK_ENV=development
```

---

## Complete Example `.env` File

Here's a complete example with all variables:

```bash
# Database Configuration
POSTGRES_DB=area_db
POSTGRES_USER=area_user
POSTGRES_PASSWORD=change_me

# Application Configuration
DATABASE_URL=postgresql://area_user:change_me@database:5432/area_db

# JWT Configuration (generate with: openssl rand -hex 32)
JWT_SECRET_KEY=change_me

# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development

# CORS Configuration
CORS_ORIGINS=*

# Google OAuth2 Configuration (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# SMTP Email Configuration
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=generated-app-password # w/ google you can generate one after 2fa
SMTP_FROM_EMAIL=your-email@outlook.com
SMTP_USE_TLS=true

# Scheduler Configuration
SCHEDULER_ENABLED=true
SCHEDULER_CHECK_INTERVAL_MINUTES=1
SCHEDULER_TIMEZONE=UTC
```

---

## Docker Environment

When using Docker Compose, environment variables are automatically loaded from the `.env` file in the project root. Make sure to create this file before running:

```bash
docker-compose up --build
```
