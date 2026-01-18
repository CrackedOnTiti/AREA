# AREA

<p align="center">
  <img src="server/static/area-logo.png" alt="AREA Logo" width="200">
</p>

**Documentation:** [MdBook Documentation](https://crackedontiti.github.io/AREA/)

## What is AREA?

AREA (Action-REAction) is an automation platform similar to IFTTT or Zapier. It allows users to create automated workflows by connecting different services through triggers (Actions) and automated responses (REActions).

### Key Features
- **Service Integration**: Connect to multiple external services (Google(gmail & drive), Facebook, Github and Spotify)
- **Automation Workflows**: Create AREAs that link Actions to REActions
- **Multi-Platform**: Access via web browser or Android mobile app
- **REST API**: Complete backend API for all operations

## Tech Stack

### Backend
- **Python 3.12** with Flask web framework
- **Gunicorn** WSGI server for production
- **PostgreSQL 15** database
- **SQLAlchemy** ORM

### Frontend
- **React** for web client
- **Flutter** for Android mobile app

### DevOps
- **Docker** for containerization
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD

See [Tech Stack Documentation](https://crackedontiti.github.io/AREA/tech-stack.html) for detailed information.

## Environment Requirements

### Development Environment
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+
- (Optional) Python 3.12+ for local development
- (Optional) Node.js 18+ for local frontend development

## Quick Start

> **Note:** The APK build takes 5-15 minutes, so we allocated 4GB RAM to Gradle for faster builds.
> If your machine can't handle this, modify `-Xmx4096m` in `client/Dockerfile.mobile`.

### Clone the Repository

```bash
git clone https://github.com/EpitechPGE3-2025/G-DEV-500-TLS-5-2-area-3
cd G-DEV-500-TLS-5-2-area-3
```

### Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Skip APK build (faster, web only)
docker-compose up server database client_web --build
```

### Stop the Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

## Team

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Aurelien P.** | Web Profile Page | React, Tailwind |
| **Thierry B.** | Backend Lead & Apk Front Lead| Python/Flask backend, Postgresql, Docker, Gunicorn, Flutter, Documentation |
| **Aymeric L.** | Web Front Lead | React, Tailwind, Debugging, Testing |

## Documentation

**Comprehensive documentation is available in our MdBook:**
- [Documentation](https://crackedontiti.github.io/AREA/)

**Quick Links:**
- Architecture Overview
- Tech Stack Details
- Data Management
- Contribution Guide
- Team & Credits
