# Web Client Pages

This document describes the pages (views) in the AREA web client application.

## Page Overview

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| LoginPage | `/login` | Public | User authentication |
| RegisterPage | `/register` | Public | New user registration |
| DashboardPage | `/dashboard` | Protected | Main dashboard with overview |
| ServicesPage | `/services` | Protected | Service connections management |
| WorkflowsPage | `/workflows` | Protected | List and manage workflows |
| CreateWorkflowPage | `/workflows/create` | Protected | Create new workflow |
| OAuthCallbackPage | `/oauth/callback` | - | Handle OAuth redirects |

---

## Public Pages

### LoginPage

**Location**: `src/pages/LoginPage.jsx`

**Purpose**: Authenticate existing users with username/email and password.

**Features**:
- Form validation
- Error handling for invalid credentials
- OAuth login buttons (Google, Facebook)
- Link to registration page
- Redirect to dashboard on success

**State Management**:
```javascript
const [formData, setFormData] = useState({
  identifier: '',
  password: '',
});
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
const [alertMessage, setAlertMessage] = useState(null);
const [alertType, setAlertType] = useState('error');
```

**API Integration**:
```javascript
import { login as loginService } from '../services/authService';

const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await loginService(formData.identifier, formData.password);
  login(response.token, response.user);
  navigate('/dashboard');
};
```

---

### RegisterPage

**Location**: `src/pages/RegisterPage.jsx`

**Purpose**: Create new user accounts.

**Features**:
- Username, email, password fields
- Password confirmation
- Validation for all fields
- Link to login page
- Redirect to login on success

**Validation Rules**:
- Username: 3-20 alphanumeric characters
- Email: Valid email format
- Password: Minimum 8 characters
- Confirm Password: Must match password

**State Management**:
```javascript
const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});
```

---

## Protected Pages

### DashboardPage

**Location**: `src/pages/DashboardPage.jsx`

**Purpose**: Main landing page after authentication showing overview.

**Features**:
- Welcome message with user info
- Quick stats (active workflows, connected services)
- Recent workflow activity
- Quick action buttons

**Layout**:
```jsx
<Layout>
  <div className="max-w-4xl mx-auto px-4 py-12">
    <PageHeader title="Dashboard" subtitle="Welcome back!" />
    {/* Stats cards */}
    {/* Recent activity */}
    {/* Quick actions */}
  </div>
</Layout>
```

---

### ServicesPage

**Location**: `src/pages/ServicesPage.jsx`

**Purpose**: Manage service connections (OAuth integrations).

**Features**:
- List connected services with disconnect option
- Browse available services by category
- Connect to new services via OAuth
- Visual feedback during connection process

**Sections**:
1. **Connected Services**: Shows services user has authenticated with
2. **Available Services**: Grouped by category (Google, Social, etc.)

**Service Categories** (from `utils/constants.js`):
```javascript
export const SERVICE_CATEGORIES = [
  { key: 'google', title: 'Google', services: ['gmail', 'drive'] },
  { key: 'social', title: 'Social & Music', services: ['facebook', 'spotify'] },
  { key: 'developer', title: 'Developer', services: ['github'] },
  { key: 'utilities', title: 'Utilities', services: ['timer', 'email', 'system'] },
];
```

**OAuth Connection**:
```javascript
import { connectService, disconnectService } from '../services/servicesService';

const handleConnect = (serviceName) => {
  setConnectingService(serviceName);
  connectService(serviceName);
};

const handleDisconnect = async (serviceName) => {
  await disconnectService(serviceName);
  await refetch();
};
```

---

### WorkflowsPage

**Location**: `src/pages/WorkflowsPage.jsx`

**Purpose**: View and manage existing workflows (AREAs).

**Features**:
- List all user workflows
- Toggle workflow active/inactive status
- Delete workflows
- View workflow details
- Create new workflow button

**Workflow Card Display**:
- Workflow name
- Action → Reaction summary
- Active/Inactive status toggle
- Last triggered timestamp
- Delete action

**Using the useWorkflows Hook**:
```javascript
import { useWorkflows } from '../hooks/useWorkflows';
import { deleteArea, toggleArea } from '../services/areasService';

const WorkflowsPage = () => {
  const { workflows, loading, error: fetchError, refetch } = useWorkflows();

  const handleToggle = async (workflowId) => {
    await toggleArea(workflowId);
    await refetch();
  };

  const handleDelete = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteArea(workflowId);
      await refetch();
    }
  };
};
```

---

### CreateWorkflowPage

**Location**: `src/pages/CreateWorkflowPage.jsx`

**Purpose**: Multi-step wizard for creating new workflows.

**Step 1 - Select Action**:
- Choose service with actions
- Select specific action
- Configure action parameters

**Step 2 - Select Reaction**:
- Choose service with reactions
- Select specific reaction
- Configure reaction parameters

**Step 3 - Name & Submit**:
- Enter workflow name
- Optional description
- Review summary
- Submit workflow

**State Management**:
```javascript
const [currentStep, setCurrentStep] = useState(1);
const [selectedActionService, setSelectedActionService] = useState('');
const [selectedAction, setSelectedAction] = useState(null);
const [actionConfig, setActionConfig] = useState({});
const [selectedReactionService, setSelectedReactionService] = useState('');
const [selectedReaction, setSelectedReaction] = useState(null);
const [reactionConfig, setReactionConfig] = useState({});
const [workflowName, setWorkflowName] = useState('');
const [workflowDescription, setWorkflowDescription] = useState('');
```

**Service Filtering**:
```javascript
const getAvailableServices = (withActions = false, withReactions = false) => {
  return services.filter(service => {
    const hasRequiredItems = withActions
      ? service.actions?.length > 0
      : withReactions
      ? service.reactions?.length > 0
      : true;
    return hasRequiredItems && isServiceAvailable(service.name);
  });
};
```

**Submit Workflow**:
```javascript
import { createArea } from '../services/areasService';

const handleSubmit = async () => {
  const areaData = {
    name: workflowName,
    description: workflowDescription,
    action_id: selectedAction.id,
    reaction_id: selectedReaction.id,
    action_config: actionConfig,
    reaction_config: reactionConfig
  };
  await createArea(areaData);
  navigate('/workflows');
};
```

---

### OAuthCallbackPage

**Location**: `src/pages/OAuthCallbackPage.jsx`

**Purpose**: Handle OAuth redirect callbacks from backend.

**Flow**:
1. Backend completes OAuth with provider
2. Redirects to `/oauth/callback?token=xxx` (success) or `?error=message` (failure)
3. Page reads query parameters
4. If token present: stores in localStorage, redirects to `/dashboard`
5. If error present: displays error, redirects to `/login`

**Implementation**:
```javascript
const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const error = searchParams.get('error');
    const token = searchParams.get('token');

    if (error) {
      setMessage(`Failed: ${error}`);
      setTimeout(() => navigate('/login'), 3000);
    } else if (token) {
      setMessage('Login successful! Welcome.');
      localStorage.setItem('token', token);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      setMessage('Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Loading spinner and message */}
    </div>
  );
};
```

---

## Page Layout Pattern

All protected pages follow a consistent layout pattern:

```jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/ui/PageHeader';

const PageName = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PageHeader
          title="Page Title"
          subtitle="Page description"
        />

        {loading && (
          <div className="text-center text-white">Loading...</div>
        )}

        {error && (
          <div className="bg-black border border-red-500 text-red-400 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PageName;
```

---

## Planned Pages

### ProfilePage (To Be Implemented)

**Route**: `/profile`

**Features**:
- Display user information (username, email)
- List connected services
- Change password functionality
- Account deletion option
- Notification preferences

### ChangePasswordPage (To Be Implemented)

**Route**: `/profile/change-password`

**Features**:
- Current password verification
- New password with confirmation
- Password strength indicator
- Success/error feedback

### WorkflowDetailsPage (To Be Implemented)

**Route**: `/workflows/:id`

**Features**:
- Workflow configuration details
- Execution history/logs
- Edit workflow
- Manual trigger option
