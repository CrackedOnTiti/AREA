# Tech Stack

This document outlines the technologies, frameworks, and tools used in the AREA project.

```
┌─────────────────────────────────────────┐
│           Frontend Layer                │
├─────────────────┬───────────────────────┤
│   Web Client    │    Mobile Client      │
│   React         │    React Native       │
│   Port 8081     │    Android APK        │
└────────┬────────┴──────────┬────────────┘
         │                   │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │   Backend Layer   │
         │   Flask REST API  │
         │   Port 8080       │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │  Database Layer   │
         │   PostgreSQL      │
         │   Port 5432       │
         └───────────────────┘
```

---

## Frontend Technologies

### Web Client
- **Framework**: React
- **Language**: JavaScript/TypeScript
- **Port**: 8081
- **Purpose**: Browser-based user interface
- **Container**: Node.js 18 Alpine

### Mobile Client
- **Framework**: React Native
- **Language**: JavaScript/TypeScript
- **Platform**: Android (APK)
- **Purpose**: Mobile application
- **Container**: Node.js 18 Alpine

---

**Why React**, the main reason is because react allows us to have a centralised frontend that can work both for web and app thank to react native... I also have experience in component based architechture and the community is huge so potentially easyer to find someone that has done what we are looking for than going though the headache of finding out ourselfes

---

## Backend Technologies

### Application Server
- **Framework**: Flask 3.0.0
- **Language**: Python 3.12
- **Port**: 8080
- **Purpose**: REST API server, business logic
- **Key Libraries**:
  - `Flask-SQLAlchemy` - ORM for database operations
  - `Flask-CORS` - Cross-Origin Resource Sharing
  - `psycopg2-binary` - PostgreSQL adapter

### Database
- **DBMS**: PostgreSQL 15
- **Port**: 5432
- **Database Name**: `area_db`
- **Purpose**: Data persistence for users, services, actions, reactions, and AREAs

---

**Why Python**, python is the only language I used so far for backend and I love it... But for more serious reasons it's easy to setup, I have a lot of experience with it, the community is awsome and most importantly, let's say I want to add a AI chatbot well boto3 is quite literally made for python so yeah kind of thinking ahead but generally speaking it's simplicity is verry time efficient 

**Why Postgres**, I have had a lot of experience with many other options such as mySql, Sqlite, mongoDb, DynamoDB... But overall Postgres takes the cake for a SQL based DB. It has relationships unlike mongo, is quite fast, and has more features than mySql. I would have potentially went for DynamoDB if i where to deploy this to have a "Scalable" database but this is easily enough for this project. PostgreSql 🗣️🔛🔝🔥

---

## DevOps & Infrastructure

### Containerization
- **Docker**: Application containerization
- **Docker Compose**: Multi-container orchestration
- **Volumes**:
  - `postgres_data` - Database persistence
  - `mobile_build` - Shared volume for APK distribution

### Container Services
```yaml
services:
  database    → PostgreSQL 15
  server      → Flask REST API
  client_web  → React web app
  client_mobile → React Native builder
```

### CI/CD
- **Platform**: GitHub Actions
- **Workflows**:
  - `deploy.yml` - Automated mdBook documentation deployment to GitHub Pages
  - `mirror.yml` - Repository sync to Epitech servers

---

## Development Tools

### Documentation
- **mdBook**: Project documentation hosting
- **Markdown**: Documentation format
- **GitHub Pages**: Documentation hosting at [https://crackedontiti.github.io/AREA/](https://crackedontiti.github.io/AREA/)

### Version Control
- **Git**: Source control
- **GitHub**: Repository hosting
- **Branches**:
  - `main` - Production branch
  - `dev` - Development branch

---

## API Architecture

### REST API Endpoints
The Flask server exposes a RESTful API for client communication:

- **Authentication**: `/api/auth/*`
- **Services**: `/api/services`
- **Actions**: `/api/actions`
- **Reactions**: `/api/reactions`
- **AREAs**: `/api/areas`
- **About**: `/about.json` (required by spec)

### Data Format
- **Request/Response**: JSON
- **Authentication**: JWT tokens (to be implemented)
- **CORS**: Enabled for cross-origin requests

---

## Future Technologies

### Planned Additions
- **OAuth2 Providers**:
  - Google OAuth
  - Facebook OAuth
  - Twitter/X OAuth
- **Task Queue**: For executing AREAs asynchronously
- **Caching**: Redis for performance optimization
- **Production Server**: Gunicorn/uWSGI for Flask

### Security Considerations
- JWT token-based authentication
- Bcrypt for password hashing
- Environment variable management for secrets
- HTTPS/SSL (production)

---

## Learn More

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
