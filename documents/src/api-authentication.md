# API Routes - Authentication

This document describes authentication and user management endpoints.

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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `token` | string | JWT authentication token (expires in 24 hours) |
| `user` | object | User information |
| `user.id` | integer | User ID |
| `user.username` | string | Username |
| `user.email` | string | Email address |
| `user.created_at` | string | ISO 8601 timestamp of account creation |
| `user.updated_at` | string | ISO 8601 timestamp of last update |

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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `token` | string | JWT authentication token (expires in 24 hours) |
| `user` | object | User information |
| `user.id` | integer | User ID |
| `user.username` | string | Username |
| `user.email` | string | Email address |
| `user.created_at` | string | ISO 8601 timestamp of account creation |
| `user.updated_at` | string | ISO 8601 timestamp of last update |

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
Initiates Google OAuth2 authentication flow by redirecting to Google's consent screen. This endpoint is used to **sign in to AREA** using a Google account.

> **Note:** This is different from `/api/connections/gmail` which is used to connect Gmail as a service for workflow automation after you've already signed into AREA.

**Authentication:** Not required

**Success Response (302 Redirect):**
Redirects user to Google OAuth consent screen where they can authorize the application.

**OAuth Scopes Requested:**
- `openid` - Basic OpenID authentication
- `email` - User's email address
- `profile` - User's basic profile information (name, picture)
- `https://www.googleapis.com/auth/gmail.readonly` - Read-only access to Gmail
- `https://www.googleapis.com/auth/drive` - Access to Google Drive

> **Note:** This endpoint requests Gmail and Drive scopes in addition to basic authentication scopes. This allows users to immediately use Gmail and Drive services in workflows without needing to reconnect through `/api/connections/gmail`.

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

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Authorization code from Google |
| `state` | string | Yes | CSRF protection token |

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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `token` | string | JWT authentication token (expires in 24 hours) |
| `user` | object | User information |
| `user.id` | integer | User ID |
| `user.username` | string | Username (auto-generated from Google profile) |
| `user.email` | string | Email address from Google account |
| `user.oauth_provider` | string | OAuth provider name ("google"). Only present for OAuth-created accounts. |
| `user.created_at` | string | ISO 8601 timestamp of account creation |

> **Note:** Users created via OAuth login will have the `oauth_provider` field set. These accounts cannot use traditional password login and must use the OAuth flow.

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

## Related Documentation

- [OAuth2 Implementation](./oauth-implementation.md)
- [OAuth Connections](./api-oauth-connections.md)
