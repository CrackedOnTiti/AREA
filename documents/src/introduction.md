# Introduction

Welcome to the AREA documentation.

## What is AREA?

AREA (Action-REAction) is an automation platform that connects different services to create automated workflows. Similar to IFTTT or Zapier, AREA allows users to define triggers (Actions) from one service and automated responses (REActions) from another.

### Example Use Cases

- **Facebook to Spotify**: Automatically send a post to Facebook as soon as you start playing music
- **GitHub to Gmail**: Send a email when an issue is created on GitHub
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

3. **Mobile Client** (Flutter Android APK)
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
├── client/
│   ├── apk/             # Flutter mobile app
│   ├── web/             # React web client
│   └── Dockerfile.mobile
│   ├── Dockerfile.web
├── documents/           # mdBook documentation
├── server/              # Flask backend
│   ├── database/        # Database models
│   ├── routes/          # API endpoints
│   ├── scheduler/       # Core workflow activator
│   ├── static/          # Assets
│   ├── utils/           # Helper functions
│   ├── app.py           # Main application
│   ├── config.py        # Environment configuration
│   ├── Dockerfile
│   ├── gunicorn.conf.py # Gunicorn configuration
│   ├── init_db.py       # Database preperator/seed_data.py caller
│   ├── requirements.txt # Python environment dependecies
│   └── seed_data.py     # Mandatory data implant
├── .env.example
├── .gitignore
├── docker-compose.yml   # Multi-container orchestration
├── HOWTOCONTRIBUTE.md
└── README.md

```