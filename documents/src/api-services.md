# API Routes - Services & Workflows

This document describes service discovery and workflow (AREA) management endpoints.

## Base URL

```
http://localhost:8080
```

---

## System Endpoints

### `GET /`

**Description:**
Root endpoint for the application server.

**Authentication:** Not required

**Success Response (200 OK):**
```
Nibba
```

**Example:**
```bash
curl http://localhost:8080/
```

---

### `GET /health`

**Description:**
Health check endpoint for monitoring and deployment. Returns the status of the server, database, and scheduler.

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "scheduler": "enabled",
  "services": {
    "scheduler_interval": "1 minutes",
    "active_count": 8
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall health status ("healthy" or "unhealthy") |
| `database` | string | Database connection status ("connected" or error message) |
| `scheduler` | string | Scheduler status ("enabled", "disabled", or error message) |
| `services.scheduler_interval` | string | How often the scheduler checks for workflow triggers |
| `services.active_count` | integer | Number of active services in the database |

**Error Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "database": "error: connection refused",
  "scheduler": "enabled",
  "services": {}
}
```

**Example:**
```bash
curl http://localhost:8080/health
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

---

## Services Endpoints

### `GET /api/services`

**Description:**
List all available services with their actions and reactions.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "services": [
    {
      "name": "string",
      "display_name": "string",
      "description": "string",
      "requires_oauth": boolean,
      "icon_url": "string | null",
      "actions": [
        {
          "id": integer,
          "name": "string",
          "display_name": "string",
          "description": "string",
          "config_schema": {
            "type": "object",
            "properties": {}
          }
        }
      ],
      "reactions": [
        {
          "id": integer,
          "name": "string",
          "display_name": "string",
          "description": "string",
          "config_schema": {
            "type": "object",
            "properties": {}
          }
        }
      ]
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `services` | array | List of all active services |
| `services[].name` | string | Internal identifier for the service |
| `services[].display_name` | string | Human-readable service name |
| `services[].description` | string | Brief description of the service |
| `services[].requires_oauth` | boolean | Whether OAuth2 authentication is required |
| `services[].icon_url` | string/null | URL to service icon |
| `services[].actions` | array | Available action triggers for this service |
| `services[].actions[].id` | integer | Database ID of the action |
| `services[].actions[].name` | string | Internal action identifier |
| `services[].actions[].display_name` | string | Human-readable action name |
| `services[].actions[].description` | string | Description of when this action triggers |
| `services[].actions[].config_schema` | object | JSON schema for action configuration |
| `services[].reactions` | array | Available reactions for this service |
| `services[].reactions[].id` | integer | Database ID of the reaction |
| `services[].reactions[].name` | string | Internal reaction identifier |
| `services[].reactions[].display_name` | string | Human-readable reaction name |
| `services[].reactions[].description` | string | Description of what this reaction does |
| `services[].reactions[].config_schema` | object | JSON schema for reaction configuration |

**Example Response:**
```json
{
  "services": [
    {
      "name": "timer",
      "display_name": "Timer",
      "description": "Time-based triggers and actions",
      "requires_oauth": false,
      "icon_url": null,
      "actions": [
        {
          "id": 1,
          "name": "time_matches",
          "display_name": "Time Matches",
          "description": "Triggers when current time matches HH:MM pattern",
          "config_schema": {
            "type": "object",
            "properties": {
              "time": {
                "type": "string",
                "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
                "description": "Time in HH:MM format (e.g., 14:30)"
              }
            },
            "required": ["time"]
          }
        }
      ],
      "reactions": []
    },
    {
      "name": "gmail",
      "display_name": "Gmail",
      "description": "Email detection and monitoring",
      "requires_oauth": true,
      "icon_url": null,
      "actions": [
        {
          "id": 3,
          "name": "email_received_from",
          "display_name": "Email Received From",
          "description": "Triggers when an email is received from a specific sender",
          "config_schema": {
            "type": "object",
            "properties": {
              "sender": {
                "type": "string",
                "description": "Email address of the sender"
              }
            },
            "required": ["sender"]
          }
        }
      ],
      "reactions": []
    }
  ]
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |

**Example:**
```bash
curl -X GET http://localhost:8080/api/services \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### `GET /api/connections`

**Description:**
List all available services that require OAuth and their connection status for the current user.

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
      "description": "Email detection and monitoring",
      "is_connected": true,
      "connected_at": "2025-12-15T10:00:00Z"
    },
    {
      "service_id": 3,
      "service_name": "google_drive",
      "display_name": "Google Drive",
      "description": "Cloud storage integration",
      "is_connected": false,
      "connected_at": null
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `connections` | array | List of all OAuth-enabled services with connection status |
| `connections[].service_id` | integer | Database ID of the service |
| `connections[].service_name` | string | Internal service identifier |
| `connections[].display_name` | string | Human-readable service name |
| `connections[].description` | string | Brief service description |
| `connections[].is_connected` | boolean | Whether user has connected this service |
| `connections[].connected_at` | string/null | ISO 8601 timestamp of when service was connected, null if not connected |

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

## AREA (Workflow) Endpoints

### `POST /api/areas`

**Description:**
Create a new workflow (AREA) that links an Action to a REAction.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "action_id": integer,
  "reaction_id": integer,
  "action_config": {
    "key": "value"
  },
  "reaction_config": {
    "key": "value"
  },
  "is_active": boolean
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the workflow |
| `action_id` | integer | Yes | ID of the action trigger |
| `reaction_id` | integer | Yes | ID of the reaction to execute |
| `action_config` | object | Yes | Configuration for the action (varies by action type) |
| `reaction_config` | object | Yes | Configuration for the reaction (varies by reaction type) |
| `is_active` | boolean | No | Whether the workflow is active (default: true) |

**Success Response (201 Created):**
```json
{
  "message": "Workflow created successfully",
  "area": {
    "id": 1,
    "user_id": 1,
    "name": "Daily Email Reminder",
    "description": null,
    "action": {
      "id": 1,
      "name": "time_matches",
      "display_name": "Time Matches",
      "service": "Timer"
    },
    "reaction": {
      "id": 1,
      "name": "send_email",
      "display_name": "Send Email",
      "service": "Email"
    },
    "action_config": {
      "time": "14:00"
    },
    "reaction_config": {
      "to": "user@example.com",
      "subject": "Daily Reminder",
      "body": "This is your daily reminder!"
    },
    "is_active": true,
    "last_triggered": null,
    "created_at": "2025-12-15T10:30:00Z",
    "updated_at": "2025-12-15T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required field: `<field>` | Required field not provided |
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 404 | Action not found | action_id doesn't exist |
| 404 | Reaction not found | reaction_id doesn't exist |

**Example:**
```bash
curl -X POST http://localhost:8080/api/areas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Email Reminder",
    "action_id": 1,
    "reaction_id": 1,
    "action_config": {
      "time": "14:00"
    },
    "reaction_config": {
      "to": "user@example.com",
      "subject": "Daily Reminder",
      "body": "This is your daily reminder!"
    },
    "is_active": true
  }'
```

---

### `GET /api/areas`

**Description:**
List all workflows for the current authenticated user with pagination and filtering options.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 20 | Number of items per page |
| `is_active` | string | No | - | Filter by active status ("true" or "false") |

**Success Response (200 OK):**
```json
{
  "areas": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Daily Email Reminder",
      "description": null,
      "action": {
        "id": 1,
        "name": "time_matches",
        "display_name": "Time Matches",
        "service": "Timer"
      },
      "reaction": {
        "id": 1,
        "name": "send_email",
        "display_name": "Send Email",
        "service": "Email"
      },
      "action_config": {
        "time": "14:00"
      },
      "reaction_config": {
        "to": "user@example.com",
        "subject": "Daily Reminder",
        "body": "This is your daily reminder!"
      },
      "is_active": true,
      "last_triggered": "2025-12-15T14:00:05Z",
      "created_at": "2025-12-15T10:30:00Z",
      "updated_at": "2025-12-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `areas` | array | List of workflows for the current page |
| `total` | integer | Total number of workflows |
| `page` | integer | Current page number |
| `per_page` | integer | Number of items per page |
| `total_pages` | integer | Total number of pages |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |

**Example:**
```bash
# Get first page with default pagination
curl -X GET http://localhost:8080/api/areas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get active workflows only
curl -X GET "http://localhost:8080/api/areas?is_active=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get page 2 with 10 items per page
curl -X GET "http://localhost:8080/api/areas?page=2&per_page=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### `GET /api/areas/<area_id>`

**Description:**
Get a specific workflow by its ID.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `area_id` | integer | Yes | ID of the workflow to retrieve |

**Success Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Daily Email Reminder",
  "description": null,
  "action": {
    "id": 1,
    "name": "time_matches",
    "display_name": "Time Matches",
    "service": "Timer"
  },
  "reaction": {
    "id": 1,
    "name": "send_email",
    "display_name": "Send Email",
    "service": "Email"
  },
  "action_config": {
    "time": "14:00"
  },
  "reaction_config": {
    "to": "user@example.com",
    "subject": "Daily Reminder",
    "body": "This is your daily reminder!"
  },
  "is_active": true,
  "last_triggered": "2025-12-15T14:00:05Z",
  "created_at": "2025-12-15T10:30:00Z",
  "updated_at": "2025-12-15T10:30:00Z"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 403 | Unauthorized access to this workflow | User doesn't own this workflow |
| 404 | Workflow not found | Workflow with given ID doesn't exist |

**Example:**
```bash
curl -X GET http://localhost:8080/api/areas/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### `PUT /api/areas/<area_id>`

**Description:**
Update an existing workflow. Only the workflow owner can update it.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `area_id` | integer | Yes | ID of the workflow to update |

**Request Body:**
```json
{
  "name": "string",
  "action_config": {
    "key": "value"
  },
  "reaction_config": {
    "key": "value"
  },
  "is_active": boolean
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | New name for the workflow |
| `action_config` | object | No | New configuration for the action |
| `reaction_config` | object | No | New configuration for the reaction |
| `is_active` | boolean | No | Whether the workflow is active |

**Success Response (200 OK):**
```json
{
  "message": "Workflow updated successfully",
  "area": {
    "id": 1,
    "user_id": 1,
    "name": "Updated Email Reminder",
    "description": null,
    "action": {
      "id": 1,
      "name": "time_matches",
      "display_name": "Time Matches",
      "service": "Timer"
    },
    "reaction": {
      "id": 1,
      "name": "send_email",
      "display_name": "Send Email",
      "service": "Email"
    },
    "action_config": {
      "time": "15:00"
    },
    "reaction_config": {
      "to": "newemail@example.com",
      "subject": "Updated Reminder",
      "body": "This is an updated reminder!"
    },
    "is_active": true,
    "last_triggered": "2025-12-15T14:00:05Z",
    "created_at": "2025-12-15T10:30:00Z",
    "updated_at": "2025-12-15T15:45:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 403 | Unauthorized access to this workflow | User doesn't own this workflow |
| 404 | Workflow not found | Workflow with given ID doesn't exist |

**Example:**
```bash
curl -X PUT http://localhost:8080/api/areas/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Email Reminder",
    "action_config": {
      "time": "15:00"
    },
    "reaction_config": {
      "to": "newemail@example.com",
      "subject": "Updated Reminder",
      "body": "This is an updated reminder!"
    }
  }'
```

---

### `PATCH /api/areas/<area_id>`

**Description:**
Partial update a workflow. Only updates the fields provided in the request body. Admins can update any workflow.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `area_id` | integer | Yes | ID of the workflow to update |

**Request Body:**
```json
{
  "name": "string",
  "is_active": boolean,
  "action_config": {
    "key": "value"
  },
  "reaction_config": {
    "key": "value"
  }
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | New name for the workflow |
| `is_active` | boolean | No | Whether the workflow is active |
| `action_config` | object | No | New configuration for the action |
| `reaction_config` | object | No | New configuration for the reaction |

**Success Response (200 OK):**
```json
{
  "message": "Workflow updated successfully",
  "area": {
    "id": 1,
    "user_id": 1,
    "name": "Updated Workflow Name",
    "action": {
      "id": 1,
      "name": "time_matches",
      "display_name": "Time Matches",
      "service": "Timer"
    },
    "reaction": {
      "id": 1,
      "name": "send_email",
      "display_name": "Send Email",
      "service": "Email"
    },
    "action_config": {
      "time": "14:00"
    },
    "reaction_config": {
      "to": "user@example.com",
      "subject": "Reminder",
      "body": "This is a reminder!"
    },
    "is_active": true,
    "last_triggered": null,
    "created_at": "2025-12-15T10:30:00Z",
    "updated_at": "2025-12-15T15:45:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 403 | Unauthorized access to this workflow | User doesn't own this workflow (and is not admin) |
| 404 | Workflow not found | Workflow with given ID doesn't exist |

**Example:**
```bash
curl -X PATCH http://localhost:8080/api/areas/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Workflow Name",
    "is_active": false
  }'
```

---

### `PATCH /api/areas/<area_id>/toggle`

**Description:**
Toggle the active status of a workflow (enable/disable). Only the workflow owner can toggle it.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `area_id` | integer | Yes | ID of the workflow to toggle |

**Request Body:**
None required

**Success Response (200 OK):**
```json
{
  "message": "Workflow enabled successfully",
  "area": {
    "id": 1,
    "user_id": 1,
    "name": "Daily Email Reminder",
    "description": null,
    "action": {
      "id": 1,
      "name": "time_matches",
      "display_name": "Time Matches",
      "service": "Timer"
    },
    "reaction": {
      "id": 1,
      "name": "send_email",
      "display_name": "Send Email",
      "service": "Email"
    },
    "action_config": {
      "time": "14:00"
    },
    "reaction_config": {
      "to": "user@example.com",
      "subject": "Daily Reminder",
      "body": "This is your daily reminder!"
    },
    "is_active": true,
    "last_triggered": "2025-12-15T14:00:05Z",
    "created_at": "2025-12-15T10:30:00Z",
    "updated_at": "2025-12-15T16:00:00Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message indicating if workflow was enabled or disabled |
| `area` | object | Complete updated workflow object with toggled is_active status |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 403 | Unauthorized access to this workflow | User doesn't own this workflow |
| 404 | Workflow not found | Workflow with given ID doesn't exist |

**Example:**
```bash
curl -X PATCH http://localhost:8080/api/areas/1/toggle \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### `DELETE /api/areas/<area_id>`

**Description:**
Delete a workflow permanently. Only the workflow owner can delete it.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `area_id` | integer | Yes | ID of the workflow to delete |

**Request Body:**
None required

**Success Response (200 OK):**
```json
{
  "message": "Workflow deleted successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 403 | Unauthorized access to this workflow | User doesn't own this workflow |
| 404 | Workflow not found | Workflow with given ID doesn't exist |

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/areas/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### `DELETE /api/areas/reset`

**Description:**
Delete all workflows for the current user. This also deletes all associated workflow logs.

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
  "message": "Successfully deleted 5 workflow(s)",
  "deleted_count": 5
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message with count of deleted workflows |
| `deleted_count` | integer | Number of workflows that were deleted |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/areas/reset \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### `GET /api/areas/<area_id>/logs`

**Description:**
Get execution logs for a specific workflow with pagination. Shows history of when the workflow was triggered and execution results.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `area_id` | integer | Yes | ID of the workflow to get logs for |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 50 | Number of log entries per page |

**Success Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 1,
      "area_id": 1,
      "area_name": "Daily Email Reminder",
      "status": "success",
      "message": "Email sent successfully",
      "triggered_at": "2025-12-15T14:00:05Z",
      "execution_time_ms": 245
    },
    {
      "id": 2,
      "area_id": 1,
      "area_name": "Daily Email Reminder",
      "status": "failed",
      "message": "SMTP connection failed",
      "triggered_at": "2025-12-14T14:00:03Z",
      "execution_time_ms": 1520
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 50,
  "total_pages": 1
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `logs` | array | List of execution logs for the current page |
| `logs[].id` | integer | Log entry ID |
| `logs[].area_id` | integer | Workflow ID |
| `logs[].area_name` | string | Name of the workflow |
| `logs[].status` | string | Execution status: "success", "failed", or "error" |
| `logs[].message` | string | Execution message or error description |
| `logs[].triggered_at` | string | ISO 8601 timestamp of when workflow was triggered |
| `logs[].execution_time_ms` | integer | Execution time in milliseconds |
| `total` | integer | Total number of log entries |
| `page` | integer | Current page number |
| `per_page` | integer | Number of items per page |
| `total_pages` | integer | Total number of pages |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 403 | Unauthorized access to this workflow | User doesn't own this workflow |
| 404 | Workflow not found | Workflow with given ID doesn't exist |

**Example:**
```bash
# Get first page with default pagination
curl -X GET http://localhost:8080/api/areas/1/logs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get page 2 with 20 logs per page
curl -X GET "http://localhost:8080/api/areas/1/logs?page=2&per_page=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Admin Endpoints

### `GET /api/admin/users`

**Description:**
Get all users with their workflows. Only accessible by the admin user (user ID 1).

**Authentication:** Required (Bearer token - Admin only)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "oauth_provider": null,
      "created_at": "2025-11-27T17:54:14.738713",
      "workflow_count": 3,
      "workflows": [
        {
          "id": 1,
          "name": "Daily Reminder",
          "action": {
            "id": 1,
            "name": "time_matches",
            "display_name": "Time Matches",
            "service": "Timer"
          },
          "reaction": {
            "id": 1,
            "name": "send_email",
            "display_name": "Send Email",
            "service": "Email"
          },
          "is_active": true,
          "last_triggered": "2025-12-15T14:00:05Z",
          "created_at": "2025-12-15T10:30:00Z"
        }
      ]
    },
    {
      "id": 2,
      "username": "alice",
      "email": "alice@example.com",
      "oauth_provider": "google",
      "created_at": "2025-12-01T09:00:00.000000",
      "workflow_count": 2,
      "workflows": []
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `users` | array | List of all users in the system |
| `users[].id` | integer | User database ID |
| `users[].username` | string | User's username |
| `users[].email` | string | User's email address |
| `users[].oauth_provider` | string/null | OAuth provider if user registered via OAuth ("google", "facebook", or null) |
| `users[].created_at` | string | ISO 8601 timestamp of account creation |
| `users[].workflow_count` | integer | Number of workflows this user has |
| `users[].workflows` | array | List of user's workflows with full details |

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Authorization token is missing | No Authorization header provided |
| 401 | Invalid or expired token | Token is invalid or has expired |
| 403 | Admin access required | User is not the admin |

**Example:**
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Related Documentation

- [Authentication](./api-authentication.md)
- [OAuth Connections](./api-oauth-connections.md)
- [Service Documentation](./google-service.md)
