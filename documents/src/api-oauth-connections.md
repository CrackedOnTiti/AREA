# API Routes - OAuth Service Connections

This document describes OAuth connection endpoints for integrating external services (Gmail, Drive, Facebook, GitHub, Spotify).

## Base URL

```
http://localhost:8080
```

---

## General Endpoints

### `GET /api/connections`

**Description:**
List all services and their connection status for the current user.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "connections": [
    {
      "service_id": 2,
      "service_name": "gmail",
      "display_name": "Gmail",
      "description": "Email automation service",
      "is_connected": true,
      "connected_at": "2025-12-15T10:00:00Z"
    },
    {
      "service_id": 3,
      "service_name": "facebook",
      "display_name": "Facebook",
      "description": "Social media automation",
      "is_connected": false,
      "connected_at": null
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `connections` | array | List of all OAuth-enabled services |
| `service_id` | integer | Service database ID |
| `service_name` | string | Internal service name |
| `display_name` | string | Display name of the service |
| `description` | string | Service description |
| `is_connected` | boolean | Whether user has connected this service |
| `connected_at` | string | ISO 8601 timestamp of connection (null if not connected) |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |

**Example:**
```bash
curl -X GET http://localhost:8080/api/connections \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### `DELETE /api/connections/reset`

**Description:**
Disconnect all OAuth services for the current user. This removes all stored access tokens and service connections.

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
  "message": "Successfully disconnected 4 service(s)",
  "disconnected_count": 4
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message with count of disconnected services |
| `disconnected_count` | integer | Number of services that were disconnected |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/connections/reset \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Gmail OAuth Connections

### `GET/POST /api/connections/gmail`

**Description:**
Initiate the Gmail OAuth2 authentication flow. Redirects the user to Google's consent screen to authorize Gmail access.

**Authentication:** Required (Bearer token or URL parameter)

**Request Headers:**
```
Authorization: Bearer <token>
```

**OR Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|---------|
| `token` | string | Yes (if no header) | JWT authentication token |

**Success Response (302 Redirect):**
Redirects user to Google OAuth consent screen where they can authorize Gmail access.

**OAuth Scopes Requested:**
- `openid` - Basic OpenID authentication
- `email` - User's email address
- `profile` - User's basic profile information
- `https://www.googleapis.com/auth/gmail.readonly` - Read-only access to Gmail
- `https://www.googleapis.com/auth/drive` - Access to Google Drive

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authentication required | No token provided in header or URL |
| 401 | Invalid token | Token is malformed or invalid |
| 401 | Invalid token payload | Token doesn't contain user_id |

**Example:**
```bash
# Using Authorization header
curl -X GET http://localhost:8080/api/connections/gmail \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using URL parameter (useful for browser redirects)
# In browser, navigate to:
http://localhost:8080/api/connections/gmail?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### `GET /api/connections/gmail/callback`

**Description:**
Handles the OAuth2 callback from Google after user authorization. This endpoint is called automatically by Google and should not be called directly.

**Authentication:** Not required (callback from Google, uses session data)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|---------|
| `code` | string | Yes | Authorization code from Google |
| `state` | string | Yes | CSRF protection token |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Gmail and Drive connected successfully",
  "connections": {
    "gmail": {
      "id": 1,
      "user_id": 1,
      "service_id": 2,
      "service_name": "gmail",
      "service_display_name": "Gmail",
      "connected_at": "2025-12-15T10:00:00Z",
      "updated_at": "2025-12-15T10:00:00Z",
      "token_expires_at": "2025-12-15T11:00:00Z"
    },
    "drive": {
      "id": 2,
      "user_id": 1,
      "service_id": 3,
      "service_name": "drive",
      "service_display_name": "Google Drive",
      "connected_at": "2025-12-15T10:00:00Z",
      "updated_at": "2025-12-15T10:00:00Z",
      "token_expires_at": "2025-12-15T11:00:00Z"
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always true on successful connection |
| `message` | string | Success message |
| `connections.gmail` | object | Gmail connection details |
| `connections.drive` | object | Drive connection details (same OAuth token) |
| `*.id` | integer | Connection database ID |
| `*.user_id` | integer | User ID |
| `*.service_id` | integer | Service ID |
| `*.service_name` | string | Internal service name |
| `*.service_display_name` | string | Display name of the service |
| `*.connected_at` | string | ISO 8601 timestamp of initial connection |
| `*.updated_at` | string | ISO 8601 timestamp of last token update |
| `*.token_expires_at` | string | ISO 8601 timestamp of when access token expires |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid session | Session expired or user_id not found in session |
| 404 | Gmail service not found | Gmail service not configured in database |
| 500 | OAuth failed: `<details>` | OAuth token exchange failed or other error |

**Example:**
```bash
# This endpoint is called automatically by Google after user consent
# You cannot call it directly - it requires valid OAuth state and code from Google
```

---

### `DELETE /api/connections/gmail`

**Description:**
Disconnect Gmail service by removing the stored OAuth connection. This revokes the application's access to the user's Gmail account.

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
  "message": "Gmail disconnected successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 404 | Gmail service not found | Gmail service not configured in database |
| 404 | Gmail not connected | User hasn't connected Gmail yet |

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/connections/gmail \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Facebook OAuth Connections

### `GET/POST /api/connections/facebook`

**Description:**
Initiate the Facebook OAuth2 authentication flow. Redirects the user to Facebook's consent screen to authorize Facebook access.

**Authentication:** Required (Bearer token or URL parameter)

**Request Headers:**
```
Authorization: Bearer <token>
```

**OR Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|---------|
| `token` | string | Yes (if no header) | JWT authentication token |

**Success Response (302 Redirect):**
Redirects user to Facebook OAuth consent screen where they can authorize Facebook access.

**OAuth Scopes Requested:**
- `email` - User's email address
- `public_profile` - User's basic profile information (name, picture)
- `user_posts` - Access to user's posts

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authentication required | No token provided in header or URL |
| 401 | Invalid token | Token is malformed or invalid |
| 401 | Invalid token payload | Token doesn't contain user_id |

**Example:**
```bash
# Using Authorization header
curl -X GET http://localhost:8080/api/connections/facebook \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using URL parameter (useful for browser redirects)
# In browser, navigate to:
http://localhost:8080/api/connections/facebook?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### `GET /api/connections/facebook/callback`

**Description:**
Handles the OAuth2 callback from Facebook after user authorization. This endpoint is called automatically by Facebook and should not be called directly.

**Authentication:** Not required (callback from Facebook, uses session data)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|---------|
| `code` | string | Yes | Authorization code from Facebook |
| `state` | string | Yes | CSRF protection token |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Facebook connected successfully",
  "connection": {
    "id": 1,
    "user_id": 1,
    "service_id": 4,
    "service_name": "facebook",
    "service_display_name": "Facebook",
    "connected_at": "2025-12-15T10:00:00Z",
    "updated_at": "2025-12-15T10:00:00Z",
    "token_expires_at": "2026-02-12T10:00:00Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always true on successful connection |
| `message` | string | Success message |
| `connection` | object | Connection details |
| `connection.id` | integer | Connection database ID |
| `connection.user_id` | integer | User ID |
| `connection.service_id` | integer | Service ID |
| `connection.service_name` | string | Internal service name |
| `connection.service_display_name` | string | Display name of the service |
| `connection.connected_at` | string | ISO 8601 timestamp of initial connection |
| `connection.updated_at` | string | ISO 8601 timestamp of last token update |
| `connection.token_expires_at` | string | ISO 8601 timestamp (typically ~60 days) |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid session | Session expired or user_id not found in session |
| 404 | Facebook service not found | Facebook service not configured in database |
| 500 | OAuth failed: `<details>` | OAuth token exchange failed or other error |

**Example:**
```bash
# This endpoint is called automatically by Facebook after user consent
# You cannot call it directly - it requires valid OAuth state and code from Facebook
```

---

### `DELETE /api/connections/facebook`

**Description:**
Disconnect Facebook service by removing the stored OAuth connection. This revokes the application's access to the user's Facebook account.

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
  "message": "Facebook disconnected successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 404 | Facebook service not found | Facebook service not configured in database |
| 404 | Facebook not connected | User hasn't connected Facebook yet |

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/connections/facebook \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## GitHub OAuth Connections

### `GET/POST /api/connections/github`

**Description:**
Initiate the GitHub OAuth2 authentication flow. Redirects the user to GitHub's consent screen to authorize GitHub access.

**Authentication:** Required (Bearer token or URL parameter)

**Request Headers:**
```
Authorization: Bearer <token>
```

**OR Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|---------|
| `token` | string | Yes (if no header) | JWT authentication token |

**Success Response (302 Redirect):**
Redirects user to GitHub OAuth consent screen where they can authorize GitHub access.

**OAuth Scopes Requested:**
- `repo` - Full control of private and public repositories
- `read:user` - Read user profile data
- `user:email` - Access to user's email addresses

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authentication required | No token provided in header or URL |
| 401 | Invalid token | Token is malformed or invalid |
| 401 | Invalid token payload | Token doesn't contain user_id |

**Example:**
```bash
# Using Authorization header
curl -X GET http://localhost:8080/api/connections/github \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using URL parameter (useful for browser redirects)
# In browser, navigate to:
http://localhost:8080/api/connections/github?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### `GET /api/connections/github/callback`

**Description:**
Handles the OAuth2 callback from GitHub after user authorization. This endpoint is called automatically by GitHub and should not be called directly.

**Authentication:** Not required (callback from GitHub, uses session data)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|---------|
| `code` | string | Yes | Authorization code from GitHub |
| `state` | string | Yes | CSRF protection token |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "GitHub connected successfully",
  "connection": {
    "id": 1,
    "user_id": 1,
    "service_id": 5,
    "service_name": "github",
    "service_display_name": "GitHub",
    "connected_at": "2025-12-15T10:00:00Z",
    "updated_at": "2025-12-15T10:00:00Z",
    "token_expires_at": "2026-12-15T10:00:00Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always true on successful connection |
| `message` | string | Success message |
| `connection` | object | Connection details |
| `connection.id` | integer | Connection database ID |
| `connection.user_id` | integer | User ID |
| `connection.service_id` | integer | Service ID |
| `connection.service_name` | string | Internal service name |
| `connection.service_display_name` | string | Display name of the service |
| `connection.connected_at` | string | ISO 8601 timestamp of initial connection |
| `connection.updated_at` | string | ISO 8601 timestamp of last token update |
| `connection.token_expires_at` | string | ISO 8601 timestamp (GitHub tokens typically don't expire) |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid session | Session expired or user_id not found in session |
| 404 | GitHub service not found | GitHub service not configured in database |
| 500 | OAuth failed: `<details>` | OAuth token exchange failed or other error |

**Example:**
```bash
# This endpoint is called automatically by GitHub after user consent
# You cannot call it directly - it requires valid OAuth state and code from GitHub
```

---

### `DELETE /api/connections/github`

**Description:**
Disconnect GitHub service by removing the stored OAuth connection. This revokes the application's access to the user's GitHub account.

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
  "message": "GitHub disconnected successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 404 | GitHub service not found | GitHub service not configured in database |
| 404 | GitHub not connected | User hasn't connected GitHub yet |

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/connections/github \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Spotify OAuth Connections

### `GET/POST /api/connections/spotify`

**Description:**
Initiate the Spotify OAuth2 authentication flow. Redirects the user to Spotify's consent screen to authorize Spotify access.

**Authentication:** Required (Bearer token or URL parameter)

**Request Headers:**
```
Authorization: Bearer <token>
```

**OR Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|---------|
| `token` | string | Yes (if no header) | JWT authentication token |

**Success Response (302 Redirect):**
Redirects user to Spotify OAuth consent screen where they can authorize Spotify access.

**OAuth Scopes Requested:**
- `user-read-playback-state` - Read playback state
- `user-modify-playback-state` - Control playback
- `playlist-read-private` - Read private playlists
- `playlist-modify-public` - Modify public playlists
- `playlist-modify-private` - Modify private playlists
- `user-library-read` - Read saved tracks
- `user-library-modify` - Modify saved tracks

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authentication required | No token provided in header or URL |
| 401 | Invalid token | Token is malformed or invalid |
| 401 | Invalid token payload | Token doesn't contain user_id |

**Example:**
```bash
# Using Authorization header
curl -X GET http://localhost:8080/api/connections/spotify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using URL parameter (useful for browser redirects)
# In browser, navigate to:
http://localhost:8080/api/connections/spotify?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### `GET /api/connections/spotify/callback`

**Description:**
Handles the OAuth2 callback from Spotify after user authorization. This endpoint is called automatically by Spotify and should not be called directly.

**Authentication:** Not required (callback from Spotify, uses custom state storage)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|---------|
| `code` | string | Yes | Authorization code from Spotify |
| `state` | string | Yes | CSRF protection token |
| `error` | string | No | Error code if authorization failed |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Spotify connected successfully",
  "connection": {
    "id": 1,
    "user_id": 1,
    "service_id": 6,
    "service_name": "spotify",
    "service_display_name": "Spotify",
    "connected_at": "2025-12-15T10:00:00Z",
    "updated_at": "2025-12-15T10:00:00Z",
    "token_expires_at": "2025-12-15T11:00:00Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always true on successful connection |
| `message` | string | Success message |
| `connection` | object | Connection details |
| `connection.id` | integer | Connection database ID |
| `connection.user_id` | integer | User ID |
| `connection.service_id` | integer | Service ID |
| `connection.service_name` | string | Internal service name |
| `connection.service_display_name` | string | Display name of the service |
| `connection.connected_at` | string | ISO 8601 timestamp of initial connection |
| `connection.updated_at` | string | ISO 8601 timestamp of last token update |
| `connection.token_expires_at` | string | ISO 8601 timestamp (typically 1 hour) |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | OAuth error: `<error>` | User denied authorization or other OAuth error |
| 400 | Missing authorization code or state | Required parameters not provided |
| 400 | Invalid or expired OAuth state | State token is invalid or expired |
| 404 | Spotify service not found | Spotify service not configured in database |
| 500 | Token exchange failed: `<details>` | Failed to exchange code for access token |
| 500 | OAuth failed: `<details>` | Other OAuth-related error |

**Example:**
```bash
# This endpoint is called automatically by Spotify after user consent
# You cannot call it directly - it requires valid OAuth state and code from Spotify
```

---

### `DELETE /api/connections/spotify`

**Description:**
Disconnect Spotify service by removing the stored OAuth connection. This revokes the application's access to the user's Spotify account.

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
  "message": "Spotify disconnected successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 404 | Spotify service not found | Spotify service not configured in database |
| 404 | Spotify not connected | User hasn't connected Spotify yet |

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/connections/spotify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Related Documentation

- [Authentication Endpoints](./api-authentication.md)
- [Services & Workflows](./api-services.md)
- [OAuth2 Implementation](./oauth-implementation.md)
