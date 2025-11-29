# API Routes

This document describes all available API endpoints in the AREA application server.

## Base URL

```
http://localhost:8080
```

---

## Authentication Endpoints

### `POST /api/auth/register`

**Description:**
Register a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Password Requirements:**
- Minimum 8 characters
- Maximum 128 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain special character

**Success Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "created_at": "2025-11-27T17:54:14.738713",
    "updated_at": "2025-11-27T17:54:14.738718"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required fields | username, email, or password not provided |
| 400 | Password must be at least 8 characters | Password too short |
| 400 | Password is too long | Password exceeds 128 characters |
| 400 | Password requires a lowercase, uppercase and special character | Password doesn't meet complexity requirements |
| 409 | Username already exists | Username is taken |
| 409 | Email already exists | Email is already registered |

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
```

---

### `POST /api/auth/login`

**Description:**
Login with username/email and password to receive a JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

OR

```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "created_at": "2025-11-27T17:54:14.738713",
    "updated_at": "2025-11-27T17:54:14.738718"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required fields | Password not provided |
| 400 | Must provide username or email | Neither username nor email provided |
| 401 | Invalid credentials | Username/email or password incorrect |
| 401 | This account uses OAuth login | Account registered via OAuth, use social login |

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "SecurePass123!"
  }'
```

---

### `GET /api/auth/me`

**Description:**
Get current authenticated user information.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "created_at": "2025-11-27T17:54:14.738713",
    "updated_at": "2025-11-27T17:54:14.738718"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid authorization header format | Authorization header malformed |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 401 | User not found | User associated with token doesn't exist |

**Example:**
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### `GET /api/auth/google/login`

**Description:**
Initiates Google OAuth2 authentication flow by redirecting to Google's consent screen.

**Authentication:** Not required

**Success Response (302 Redirect):**
Redirects user to Google OAuth consent screen where they can authorize the application.

**OAuth Scopes Requested:**
- `openid` - Basic OpenID authentication
- `email` - User's email address
- `profile` - User's basic profile information (name, picture)

**Example:**
```bash
# In browser, navigate to:
http://localhost:8080/api/auth/google/login
```

---

### `GET /api/auth/google/callback`

**Description:**
Handles the OAuth2 callback from Google after user authentication.

**Authentication:** Not required (callback from Google)

**Query Parameters:**
```
code=<authorization_code>
state=<csrf_token>
```

**Success Response (200 OK):**
```json
{
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "oauth_provider": "google",
    "created_at": "2025-11-29T18:30:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Failed to get user info from Google | OAuth token exchange failed |
| 400 | Missing required user information from Google | Google didn't provide email or user ID |
| 400 | OAuth authentication failed: <details> | General OAuth error (network, invalid code, etc.) |

**Example:**
```bash
# This endpoint is called automatically by Google after user consent
# You cannot call it directly - it requires valid OAuth state and code
```

---

## General Endpoints

### `GET /about.json`

**Description:**
Returns information about the server, client, and all available services with their actions and reactions.

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "client": {
    "host": "string"
  },
  "server": {
    "current_time": 1234567890,
    "services": [
      {
        "name": "string",
        "display_name": "string",
        "description": "string",
        "requires_oauth": boolean,
        "icon_url": "string | null",
        "actions": [
          {
            "name": "string",
            "description": "string"
          }
        ],
        "reactions": [
          {
            "name": "string",
            "description": "string"
          }
        ]
      }
    ]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `client.host` | string | IP address of the client making the request |
| `server.current_time` | integer | Current server time in Unix epoch timestamp format |
| `server.services` | array | List of all active services available on the server |
| `server.services[].name` | string | Internal identifier for the service (e.g., "timer", "gmail") |
| `server.services[].display_name` | string | Human-readable service name (e.g., "Timer", "Gmail") |
| `server.services[].description` | string | Brief description of what the service does |
| `server.services[].requires_oauth` | boolean | Whether the service requires OAuth2 authentication |
| `server.services[].icon_url` | string/null | URL to the service icon image |
| `server.services[].actions` | array | List of action triggers available for this service |
| `server.services[].actions[].name` | string | Internal identifier for the action |
| `server.services[].actions[].description` | string | Description of when this action triggers |
| `server.services[].reactions` | array | List of reactions available for this service |
| `server.services[].reactions[].name` | string | Internal identifier for the reaction |
| `server.services[].reactions[].description` | string | Description of what this reaction does |

**Example Response:**
```json
{
  "client": {
    "host": "172.20.0.1"
  },
  "server": {
    "current_time": 1763556518,
    "services": [
      {
        "name": "timer",
        "display_name": "Timer",
        "description": "Time-based triggers and actions",
        "requires_oauth": false,
        "icon_url": null,
        "actions": [
          {
            "name": "time_matches",
            "description": "Triggers when current time matches HH:MM pattern"
          },
          {
            "name": "date_matches",
            "description": "Triggers when current date matches DD/MM pattern"
          }
        ],
        "reactions": [
          {
            "name": "send_notification",
            "description": "Sends a notification message"
          },
          {
            "name": "log_message",
            "description": "Logs a message to the console"
          }
        ]
      }
    ]
  }
}
```

**Example:**
```bash
curl http://localhost:8080/about.json
```
