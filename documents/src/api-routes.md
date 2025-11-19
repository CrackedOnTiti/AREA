# API Routes

This document describes all available API endpoints in the AREA application server.

## Base URL

```
http://localhost:8080
```

---

## `/about.json`

**Method:** `GET`

**Description:**
Returns information about the server, client, and all available services with their actions and reactions.

**Authentication:** Not required

**Request:**
```bash
curl http://localhost:8080/about.json
```

**Response:**
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
