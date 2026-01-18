# Web Client Architecture

This document describes the architectural patterns and design decisions used in the AREA web client.

## Component Architecture

The web client follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                       Pages Layer                           │
│  (LoginPage, DashboardPage, ServicesPage, WorkflowsPage)    │
├─────────────────────────────────────────────────────────────┤
│                     Components Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Layout    │  │   Features  │  │        UI           │  │
│  │ Components  │  │ Components  │  │    Components       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                       Hooks Layer                           │
│              (useServices, useAuth, etc.)                   │
├─────────────────────────────────────────────────────────────┤
│                     Services Layer                          │
│     (authService, servicesService, areasService)            │
├─────────────────────────────────────────────────────────────┤
│                     Context Layer                           │
│                    (AuthContext)                            │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Global State (Context API)

The application uses React Context for global state management:

**AuthContext** - Manages authentication state:
- Current user information
- JWT token
- Login/logout functions
- Authentication status

```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, token, login, logout, isAuthenticated } = useAuth();
};
```

### Local State

Component-level state is managed with `useState` for:
- Form data
- Loading states
- Error messages
- UI state (modals, dropdowns)

### Custom Hooks

Reusable stateful logic is extracted into custom hooks:

**useServices** - Fetches and caches services data:
```javascript
import { useServices } from '../hooks/useServices';

const { services, connections, loading, error, refetch } = useServices();
```

## Routing Architecture

### Route Structure

```
/                     → Redirect to /login
/login                → LoginPage (public)
/register             → RegisterPage (public)
/dashboard            → DashboardPage (protected)
/services             → ServicesPage (protected)
/workflows            → WorkflowsPage (protected)
/workflows/create     → CreateWorkflowPage (protected)
/oauth/callback       → OAuthCallbackPage (handles OAuth redirects)
```

### Route Protection

Routes are protected using wrapper components:

```javascript
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};
```

## Data Flow

### Authentication Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────────┐
│  User    │───>│  LoginPage   │───>│ authSvc  │───>│  Backend     │
│  Input   │    │  (form)      │    │ .login() │    │  /api/auth   │
└──────────┘    └──────────────┘    └──────────┘    └──────────────┘
                       │                                    │
                       │                                    │
                       v                                    v
              ┌──────────────┐                     ┌──────────────┐
              │ AuthContext  │<────────────────────│  JWT Token   │
              │   .login()   │                     │  + User Data │
              └──────────────┘                     └──────────────┘
                       │
                       v
              ┌──────────────┐
              │ localStorage │
              │ (persist)    │
              └──────────────┘
```

### OAuth Flow (Frontend Perspective)

```
┌──────────┐    ┌──────────────┐    ┌──────────────────────────────┐
│  User    │───>│  Services    │───>│ window.location.href =       │
│  Click   │    │  Page        │    │ /api/connections/{service}   │
│ Connect  │    │              │    │ ?token={jwt}                 │
└──────────┘    └──────────────┘    └──────────────────────────────┘
                                                   │
                                                   v
                                    ┌──────────────────────────────┐
                                    │  Backend handles OAuth       │
                                    │  with service provider       │
                                    └──────────────────────────────┘
                                                   │
                                                   v
                                    ┌──────────────────────────────┐
                                    │  Redirect to /oauth/callback │
                                    │  ?success=true               │
                                    └──────────────────────────────┘
                                                   │
                                                   v
                                    ┌──────────────────────────────┐
                                    │  OAuthCallbackPage           │
                                    │  redirects to /services      │
                                    └──────────────────────────────┘
```

### Workflow Creation Flow

```
Step 1: Select Action
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Select    │────>│   Select    │────>│  Configure  │
│   Service   │     │   Action    │     │   Action    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
Step 2: Select Reaction                        v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Select    │────>│   Select    │────>│  Configure  │
│   Service   │     │  Reaction   │     │  Reaction   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
Step 3: Name & Submit                          v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Enter     │────>│   Submit    │────>│  Redirect   │
│   Name      │     │   to API    │     │  /workflows │
└─────────────┘     └─────────────┘     └─────────────┘
```

## API Integration Pattern

All API calls follow a consistent pattern:

```javascript
import { getToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const fetchData = async () => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/api/endpoint`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return await response.json();
};
```

## Error Handling Strategy

### API Errors

```javascript
try {
  const data = await apiCall();
} catch (error) {
  setAlertMessage(error.message || 'An unexpected error occurred');
  setAlertType('error');
}
```

### Form Validation Errors

```javascript
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.email) {
    newErrors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    newErrors.email = 'Invalid email format';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## Performance Considerations

1. **Lazy Loading**: Consider code-splitting for larger pages
2. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
3. **API Caching**: The `useServices` hook caches data to avoid redundant calls
4. **Optimistic Updates**: Consider implementing for better UX

## Security Considerations

1. **JWT Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **Token Expiration**: Handle 401 errors by redirecting to login
3. **Input Sanitization**: All user input is validated before submission
4. **CORS**: Backend configured to accept requests from web client origin
