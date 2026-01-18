# Web Client API Integration

This document describes how the web client integrates with the Flask REST API backend.

## API Configuration

### Base URL

The API base URL is configured via environment variable:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

### Request Headers

All authenticated requests include:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## Service Modules

### authService.js

**Location**: `src/services/authService.js`

Handles all authentication-related API calls and token management.

**Functions**:

```javascript
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const getStoredUser = () => JSON.parse(localStorage.getItem('user'));
export const setStoredUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const removeToken = () => localStorage.removeItem('token');
export const removeStoredUser = () => localStorage.removeItem('user');
export const logout = () => {
  removeToken();
  removeStoredUser();
};

export const login = async (usernameOrEmail, password) => {
  const body = usernameOrEmail.includes('@')
    ? { email: usernameOrEmail, password }
    : { username: usernameOrEmail, password };

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
};

export const register = async (username, email, password) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
};

export const getCurrentUser = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

---

### servicesService.js

**Location**: `src/services/servicesService.js`

Handles service listing and OAuth connections.

**Helper Function**:
```javascript
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
```

**Functions**:

```javascript
export const getServices = async () => {
  const response = await fetch(`${API_URL}/api/services`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

export const getUserConnections = async () => {
  const response = await fetch(`${API_URL}/api/connections`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

export const connectService = (serviceName) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  window.location.href = `${API_URL}/api/connections/${serviceName.toLowerCase()}?token=${encodeURIComponent(token)}`;
};

export const disconnectService = async (serviceName) => {
  const endpoint = serviceName.toLowerCase() === 'drive' ? 'gmail' : serviceName.toLowerCase();
  const response = await fetch(`${API_URL}/api/connections/${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
};
```

---

### areasService.js

**Location**: `src/services/areasService.js`

Handles AREA (workflow) CRUD operations.

**Helper Function**:
```javascript
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
```

**Functions**:

```javascript
export const getAreas = async () => {
  const response = await fetch(`${API_URL}/api/areas`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

export const createArea = async (areaData) => {
  const response = await fetch(`${API_URL}/api/areas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(areaData)
  });
};

export const deleteArea = async (areaId) => {
  const response = await fetch(`${API_URL}/api/areas/${areaId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
};

export const toggleArea = async (areaId) => {
  const response = await fetch(`${API_URL}/api/areas/${areaId}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
};
```

---

## API Endpoints Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Authenticate user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Services

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/services` | List all services | Yes |
| GET | `/api/connections` | List user connections | Yes |
| GET | `/api/connections/{service}` | Initiate OAuth | Yes |
| DELETE | `/api/connections/{service}` | Disconnect service | Yes |

### AREAs (Workflows)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/areas` | List user AREAs | Yes |
| POST | `/api/areas` | Create new AREA | Yes |
| GET | `/api/areas/{id}` | Get AREA details | Yes |
| PUT | `/api/areas/{id}` | Update AREA | Yes |
| DELETE | `/api/areas/{id}` | Delete AREA | Yes |
| PATCH | `/api/areas/{id}/toggle` | Toggle active status | Yes |
| GET | `/api/areas/{id}/logs` | Get execution logs | Yes |

### Public

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/about.json` | Server info | No |

---

## Error Handling Pattern

All service functions follow this error handling pattern:

```javascript
export const apiFunction = async (params) => {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_URL}/api/endpoint`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    // Re-throw with meaningful message
    throw new Error(error.message || 'An unexpected error occurred');
  }
};
```

### HTTP Status Code Handling

| Status | Meaning | Frontend Action |
|--------|---------|-----------------|
| 200 | Success | Process response |
| 201 | Created | Process response |
| 400 | Bad Request | Show validation error |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show not found message |
| 500 | Server Error | Show generic error |

---

## OAuth Integration

### Connection Flow

1. **Frontend initiates**: Call `connectService(serviceName)`
2. **Browser redirects**: To `${API_URL}/api/connections/${service}?token=${jwt}`
3. **Backend handles OAuth**: Redirects to provider, handles callback
4. **Backend redirects back**: To `${FRONTEND_URL}/oauth/callback?token=${jwt}` (success) or `?error=message` (failure)
5. **Frontend processes**: OAuthCallbackPage stores token if present, shows result, redirects to /dashboard or /login

### Supported OAuth Services

| Service | Endpoint | Scopes |
|---------|----------|--------|
| Gmail | `/api/connections/gmail` | email, profile, gmail.readonly |
| Drive | `/api/connections/drive` | email, profile, drive |
| GitHub | `/api/connections/github` | user, repo |
| Facebook | `/api/connections/facebook` | email, public_profile |
| Spotify | `/api/connections/spotify` | user-read-email, user-library-read |

---

## Custom Hooks

### useServices

**Location**: `src/hooks/useServices.js`

Provides cached access to services and connections data.

```javascript
import { useServices } from '../hooks/useServices';

const MyComponent = () => {
  const { services, connections, loading, error, refetch } = useServices();
};
```

**Implementation**:
```javascript
export const useServices = () => {
  const [services, setServices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesData, connectionsData] = await Promise.all([
        getServices(),
        getUserConnections()
      ]);
      setServices(servicesData.services || []);
      setConnections(connectionsData.connections || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { services, connections, loading, error, refetch: fetchData };
};
```

### useWorkflows

**Location**: `src/hooks/useWorkflows.js`

Provides cached access to user's workflows (AREAs).

```javascript
import { useWorkflows } from '../hooks/useWorkflows';

const MyComponent = () => {
  const { workflows, loading, error, refetch } = useWorkflows();
};
```

**Implementation**:
```javascript
export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAreas();
      setWorkflows(data.areas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { workflows, loading, error, refetch: fetchWorkflows };
};
```

---

## Response Data Structures

### Service Object

```json
{
  "id": 1,
  "name": "gmail",
  "description": "Google Gmail",
  "icon": "gmail.png",
  "actions": [
    {
      "id": 1,
      "name": "new_email",
      "description": "When a new email is received",
      "config_schema": {
        "type": "object",
        "properties": {
          "from_filter": {
            "type": "string",
            "description": "Filter by sender email"
          }
        }
      }
    }
  ],
  "reactions": [
    {
      "id": 1,
      "name": "send_email",
      "description": "Send an email",
      "config_schema": {
        "type": "object",
        "properties": {
          "to": { "type": "string" },
          "subject": { "type": "string" },
          "body": { "type": "string" }
        },
        "required": ["to", "subject"]
      }
    }
  ]
}
```

### AREA Object

```json
{
  "id": 1,
  "name": "My Workflow",
  "description": "Workflow description",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "action": {
    "id": 1,
    "name": "new_email",
    "service": "gmail"
  },
  "action_config": {
    "from_filter": "boss@company.com"
  },
  "reaction": {
    "id": 2,
    "name": "create_file",
    "service": "drive"
  },
  "reaction_config": {
    "folder": "Work Emails"
  }
}
```
