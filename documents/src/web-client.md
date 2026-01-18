# Web Client

The AREA web client is a React-based single-page application (SPA) that provides a user-friendly interface for managing automation workflows. It communicates with the Flask REST API backend to perform all operations.

## Overview

The web client allows users to:

- **Authentication**: Register, login, and manage their accounts
- **Service Management**: Connect to third-party services via OAuth2 (Gmail, Drive, GitHub, Spotify, Facebook)
- **Workflow Creation**: Create AREAs by linking Actions to REActions
- **Dashboard**: Monitor active workflows and their execution status
- **Profile Settings**: Manage account settings and connected services

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **React Router DOM 6** | Client-side routing |
| **Tailwind CSS 3** | Utility-first styling |
| **Fetch API** | HTTP requests |
| **Context API** | Global state management |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

```bash
# Navigate to web client directory
cd client/web

# Install dependencies
npm install

# Start development server
npm start
```

The development server runs on `http://localhost:8081`.

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build client_web
```

## Project Structure

```
client/web/
├── public/
│   └── index.html
├── src/
│   ├── assets/              # Static assets (images, icons)
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Layout components (Layout, Sidebar, etc.)
│   │   ├── features/        # Feature-specific components
│   │   └── ui/              # Generic UI components (Input, Button, Alert)
│   ├── context/             # React Context providers
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── hooks/               # Custom React hooks
│   │   ├── useServices.js   # Services data fetching hook
│   │   └── useWorkflows.js  # Workflows data fetching hook
│   ├── pages/               # Page components
│   ├── services/            # API service modules
│   │   ├── authService.js   # Authentication API calls
│   │   ├── servicesService.js
│   │   └── areasService.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js     # App-wide constants (OAUTH_SERVICES, SERVICE_CATEGORIES)
│   │   ├── styles.js        # Reusable Tailwind class constants
│   │   └── validation.js    # Form validation helpers
│   ├── App.jsx              # Root component with routing
│   └── index.js             # Entry point
├── package.json
├── tailwind.config.js
└── Dockerfile
```

## Environment Configuration

Create a `.env` file in `client/web/`:

```env
# API Base URL
REACT_APP_API_URL=http://localhost:8080

# OAuth Callback URL (used for OAuth redirects)
REACT_APP_OAUTH_CALLBACK_URL=http://localhost:8081/oauth/callback
```

## Design Principles

The web client follows these core principles:

1. **Responsive First**: Mobile-friendly layouts using Tailwind CSS breakpoints
2. **User Feedback**: Loading states, success/error messages for all operations
3. **Accessibility**: Proper ARIA labels, keyboard navigation support
4. **Consistent UI**: Dark theme with consistent color scheme
5. **Error Handling**: Graceful API error handling with user-friendly messages

## Color Scheme

The application uses a dark theme:

| Element | Color |
|---------|-------|
| Background | `#000000` (black) |
| Card Background | `#0a0a0a` (near-black) |
| Primary Text | `#ffffff` (white) |
| Secondary Text | `#9ca3af` (gray-400) |
| Accent/Primary | `#3b82f6` (blue-500) |
| Success | `#22c55e` (green-500) |
| Error | `#ef4444` (red-500) |
| Borders | `#ffffff` (white) |

---

See also:
- [Web Client Architecture](./web-client-architecture.md)
- [Web Client Components](./web-client-components.md)
- [Web Client Pages](./web-client-pages.md)
- [API Integration Guide](./web-client-api.md)
