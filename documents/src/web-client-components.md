# Web Client Components

This document describes the reusable components available in the AREA web client.

## Component Categories

Components are organized into three categories:

| Category | Location | Purpose |
|----------|----------|---------|
| **UI** | `components/ui/` | Generic, reusable UI elements |
| **Layout** | `components/layout/` | Page structure components |
| **Features** | `components/features/` | Domain-specific components |

---

## UI Components

### Input

A form input component with built-in error handling and consistent styling.

**Location**: `src/components/Input.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Input label text |
| `name` | string | required | Input name attribute |
| `type` | string | `'text'` | Input type (text, email, password, etc.) |
| `value` | string | - | Controlled input value |
| `onChange` | function | required | Change handler |
| `error` | string | - | Error message to display |
| `placeholder` | string | - | Placeholder text |
| `disabled` | boolean | `false` | Disable input |

**Usage**:
```jsx
import Input from '../components/Input';

<Input
  label="Email"
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  error={errors.email}
  placeholder="Enter your email"
/>
```

---

### Button

A button component with loading state support.

**Location**: `src/components/Button.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Button content |
| `type` | string | `'button'` | Button type attribute |
| `onClick` | function | - | Click handler |
| `loading` | boolean | `false` | Show loading spinner |
| `disabled` | boolean | `false` | Disable button |
| `variant` | string | `'primary'` | Button style variant |
| `className` | string | - | Additional CSS classes |

**Variants**:
- `primary` - Blue background
- `secondary` - Outline style
- `danger` - Red background

**Usage**:
```jsx
import Button from '../components/Button';

<Button
  type="submit"
  loading={isSubmitting}
  disabled={!isValid}
>
  Submit
</Button>
```

---

### Alert

A notification component for displaying success/error messages.

**Location**: `src/components/Alert.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | string | required | Alert message |
| `type` | string | `'error'` | Alert type (`success`, `error`, `warning`, `info`) |
| `onClose` | function | - | Close handler (shows X button if provided) |

**Usage**:
```jsx
import Alert from '../components/Alert';

{alertMessage && (
  <Alert
    message={alertMessage}
    type={alertType}
    onClose={() => setAlertMessage(null)}
  />
)}
```

---

### PageHeader

A consistent header component for pages.

**Location**: `src/components/ui/PageHeader.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Page title |
| `subtitle` | string | - | Optional subtitle |
| `action` | node | - | Optional action button/element |

**Usage**:
```jsx
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/Button';

<PageHeader
  title="My Workflows"
  subtitle="Manage your automation workflows"
  action={
    <Button onClick={() => navigate('/workflows/create')}>
      Create New
    </Button>
  }
/>
```

---

## Layout Components

### Layout

The main layout wrapper that includes the sidebar navigation.

**Location**: `src/components/layout/Layout.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Page content |

**Usage**:
```jsx
import Layout from '../components/layout/Layout';

const MyPage = () => (
  <Layout>
    <div className="max-w-4xl mx-auto px-4 py-12">
    </div>
  </Layout>
);
```

---

### Sidebar

The navigation sidebar component.

**Location**: `src/components/layout/Sidebar.jsx`

**Navigation Items**:
- Dashboard (`/dashboard`)
- Services (`/services`)
- Workflows (`/workflows`)
- Logout (action)

---

## Feature Components

### ConnectedServiceItem

Displays a connected service with disconnect option.

**Location**: `src/components/features/ConnectedServiceItem.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `service` | object | required | Service object |
| `isDisconnecting` | boolean | `false` | Loading state |
| `onDisconnect` | function | required | Disconnect handler |

---

### ServiceCategory

Groups services by category with connect buttons.

**Location**: `src/components/features/ServiceCategory.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Category title |
| `services` | array | required | Array of services |
| `isConnecting` | string | - | Service currently connecting |
| `onConnect` | function | required | Connect handler |

---

### StepIndicator

Visual progress indicator for multi-step forms.

**Location**: `src/components/features/StepIndicator.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | number | required | Current step (1-3) |
| `totalSteps` | number | `3` | Total number of steps |

**Usage**:
```jsx
<StepIndicator currentStep={2} />
```

---

### Step1ActionSelection

Action selection step for workflow creation.

**Location**: `src/components/features/Step1ActionSelection.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `availableServices` | array | Services with actions |
| `selectedService` | string | Currently selected service |
| `onServiceChange` | function | Service change handler |
| `actions` | array | Available actions for service |
| `selectedAction` | object | Currently selected action |
| `onActionChange` | function | Action change handler |
| `actionConfig` | object | Action configuration |
| `onConfigChange` | function | Config change handler |
| `onNext` | function | Next step handler |
| `canProceed` | boolean | Enable next button |

---

### Step2ReactionSelection

Reaction selection step for workflow creation.

**Location**: `src/components/features/Step2ReactionSelection.jsx`

**Props**: Similar to Step1ActionSelection, but for reactions.

---

### Step3NameAndSubmit

Final step for naming and submitting the workflow.

**Location**: `src/components/features/Step3NameAndSubmit.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `name` | string | Workflow name |
| `onNameChange` | function | Name change handler |
| `description` | string | Workflow description |
| `onDescriptionChange` | function | Description change handler |
| `selectedAction` | object | Selected action (summary display) |
| `selectedReaction` | object | Selected reaction (summary display) |
| `onPrev` | function | Previous step handler |
| `onSubmit` | function | Submit handler |
| `submitting` | boolean | Loading state |

---

## Dynamic Form Generation

The workflow creation steps use dynamic form generation based on `config_schema` from the API.

### Schema Structure

```json
{
  "type": "object",
  "properties": {
    "time": {
      "type": "string",
      "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$",
      "description": "Time in HH:MM format"
    },
    "recipient": {
      "type": "string",
      "description": "Email address"
    }
  },
  "required": ["time"]
}
```

### Field Type Mapping

| Schema Type | Input Type |
|-------------|------------|
| `string` | `text` |
| `string` with `email` format | `email` |
| `string` with `password` format | `password` |
| `number` | `number` |
| `boolean` | `checkbox` |

### Example Implementation

```jsx
const renderConfigFields = (schema, config, onChange) => {
  if (!schema?.properties) return null;

  return Object.entries(schema.properties).map(([key, prop]) => (
    <Input
      key={key}
      label={prop.description || key}
      name={key}
      type={getInputType(prop)}
      value={config[key] || ''}
      onChange={(e) => onChange(key, e.target.value)}
      required={schema.required?.includes(key)}
      placeholder={prop.description}
    />
  ));
};
```

---

## Creating New Components

When creating new components, follow these guidelines:

1. **Functional Components**: Always use functional components with hooks
2. **Props Documentation**: Define clear prop types
3. **Consistent Styling**: Use Tailwind CSS utilities
4. **Error Handling**: Handle loading and error states
5. **Accessibility**: Include proper ARIA attributes

### Component Template

```jsx
import React from 'react';

const ComponentName = ({ propName, onClick }) => {
  return (
    <div className="component-styles">
    </div>
  );
};

export default ComponentName;
```
