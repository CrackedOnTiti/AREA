# Introduction

Welcome to the AREA documentation.

## What is AREA?

AREA (Action-REAction) is an automation platform that connects different services to create automated workflows. Similar to IFTTT or Zapier, AREA allows users to define triggers (Actions) from one service and automated responses (REActions) from another.

### Example Use Cases

- **Email to Cloud**: Automatically save email attachments to OneDrive
- **GitHub to Teams**: Send a Teams message when an issue is created on GitHub
- **Weather Alerts**: Get notified when temperature drops below a threshold
- **Time-based Actions**: Execute tasks at specific dates or times

## Architecture

The AREA project consists of three main components:

1. **Application Server** (Flask REST API on port 8080)
   - Handles all business logic
   - Manages user authentication and authorization
   - Executes AREAs through hooks
   - Provides REST API endpoints

2. **Web Client** (React app on port 8081)
   - Browser-based user interface
   - Service configuration
   - AREA creation and management

3. **Mobile Client** (React Native Android APK)
   - Native Android application
   - Same functionality as web client
   - Available for download from web client

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+

Optional (for local development without Docker):
- Python 3.12+
- Node.js 18+

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/EpitechPGE3-2025/G-DEV-500-TLS-5-2-area-3 # or https://github.com/CrackedOnTiti/AREA.git
   cd AREA
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Flask REST API: http://localhost:8080
   - Web Client: http://localhost:8081
   - API Info: http://localhost:8080/about.json

### First Steps

1. Register a new user account
2. Subscribe to available services
3. Create your first AREA by connecting an Action to a REAction
4. Watch your automation run!

## Project Structure

```
AREA/
├── server/              # Flask backend
│   ├── app.py           # Main application
│   ├── routes/          # API endpoints
│   └── Dockerfile
├── client/
│   ├── web/             # React web client
│   ├── mobile/          # React Native mobile app
│   ├── Dockerfile.web
│   └── Dockerfile.mobile
├── database/            # Database migrations
│   └── models.py        # Database models
├── documents/           # mdBook documentation
├── docker-compose.yml   # Multi-container orchestration
└── README.md

```