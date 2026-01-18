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

### `PATCH /api/auth/me`

**Description:**
Update current authenticated user's profile information.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "string"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | No | New email address |

**Success Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "newemail@example.com",
    "created_at": "2025-11-27T17:54:14.738713",
    "updated_at": "2025-11-27T18:30:00.000000"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | No data provided | Request body is empty |
| 400 | Email cannot be empty | Email field is empty string |
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 409 | Email already in use | Email is already taken by another user |

**Example:**
```bash
curl -X PATCH http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com"
  }'
```

---

### `DELETE /api/auth/me`

**Description:**
Delete current user's account and all associated data (workflows, service connections, logs).

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
None required

**Success Response (200 OK):**
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 403 | Admin account cannot be deleted | Cannot delete the admin account |

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### `GET /api/auth/facebook/login`

**Description:**
Initiates Facebook OAuth2 authentication flow by redirecting to Facebook's consent screen. This endpoint is used to **sign in to AREA** using a Facebook account.

> **Note:** This is different from `/api/connections/facebook` which is used to connect Facebook as a service for workflow automation after you've already signed into AREA.

**Authentication:** Not required

**Success Response (302 Redirect):**
Redirects user to Facebook OAuth consent screen where they can authorize the application.

**OAuth Scopes Requested:**
- `email` - User's email address
- `public_profile` - User's basic profile information (name, picture)

**Example:**
```bash
# In browser, navigate to:
http://localhost:8080/api/auth/facebook/login
```

---

### `GET /api/auth/facebook/callback`

**Description:**
Handles the OAuth2 callback from Facebook after user authentication.

**Authentication:** Not required (callback from Facebook)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Authorization code from Facebook |
| `state` | string | Yes | CSRF protection token |

**Success Response (302 Redirect):**
Redirects to frontend with JWT token:
```
http://localhost:8081/oauth/callback?token=<jwt>&success=true&service=facebook
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | JWT authentication token (in URL parameter) |
| `success` | string | "true" on successful authentication |
| `service` | string | "facebook" |

> **Note:** Users created via OAuth login will have the `oauth_provider` field set. These accounts cannot use traditional password login and must use the OAuth flow.

**Error Response (302 Redirect):**
Redirects to frontend with error:
```
http://localhost:8081/oauth/callback?error=<error_message>
```

**Example:**
```bash
# This endpoint is called automatically by Facebook after user consent
# You cannot call it directly - it requires valid OAuth state and code
```

---

### `POST /api/auth/forgot-password`

**Description:**
Request a password reset email. For security, always returns success message regardless of whether the email exists.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string"
}
```

**Success Response (200 OK):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Email is required | No email provided in request |
| 500 | Failed to send reset email | SMTP error occurred |

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com"
  }'
```

---

### `POST /api/auth/reset-password`

**Description:**
Reset password using a token received via email.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "string",
  "password": "string"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Reset token from email |
| `password` | string | Yes | New password (min 8 chars, requires uppercase, lowercase, special char) |

**Success Response (200 OK):**
```json
{
  "message": "Password successfully reset. You can now log in with your new password."
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Token and password are required | Missing required fields |
| 400 | Password must be at least 8 characters | Password too short |
| 400 | Password is too long | Password exceeds 128 characters |
| 400 | Password requires a lowercase, uppercase and special character | Password doesn't meet complexity |
| 400 | Invalid or expired reset token | Token is invalid or has expired |

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456",
    "password": "NewSecurePass123!"
  }'
```

---

## Related Documentation

- [OAuth2 Implementation](./oauth-implementation.md)
- [OAuth Connections](./api-oauth-connections.md)
