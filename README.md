# AREA

> Dunno yet

**Notion:** [Notion TimeTable](https://www.notion.so/AREA-2af6219a901480c085b5d23c1f08b3bf?source=copy_link)
**Documentation:** [MdBook Documentation](https://crackedontiti.github.io/AREA/)

## Team

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Aurelien P.** | App & Front Lead | TBD |
| **Thierry B.** | Backend Lead | Python/Flask backend, database architecture, project structure |
| **Aymeric L.** | TBD | TBD |

## What is AREA?

AREA (Action-REAction) is an automation platform similar to IFTTT or Zapier. It allows users to create automated workflows by connecting different services through triggers (Actions) and automated responses (REActions).

### Key Features
- **Service Integration**: Connect to multiple external services (Google, Facebook, Email, etc.)
- **Automation Workflows**: Create AREAs that link Actions to REActions
- **Multi-Platform**: Access via web browser or Android mobile app
- **REST API**: Complete backend API for all operations

## Tech Stack

### Backend
- **Python 3.12** with Flask web framework
- **PostgreSQL 15** database
- **SQLAlchemy** ORM

### Frontend
- **React** for web client
- **React Native** for Android mobile app

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

### Clone the Repository

```bash
git clone https://github.com/EpitechPGE3-2025/G-DEV-500-TLS-5-2-area-3
cd G-DEV-500-TLS-5-2-area-3
```

### Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Stop the Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

## Documentation

**Comprehensive documentation is available in our MdBook:**
- [Documentation](https://crackedontiti.github.io/AREA/)

**Quick Links:**
- Architecture Overview
- Tech Stack Details
- Data Management
- Contribution Guide
- Team & Credits
