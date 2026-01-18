# Deployment & Server Configuration

## Overview

The AREA backend runs on Gunicorn, a production-grade WSGI HTTP server for Python. This document covers server configuration, deployment options, and production considerations.

---

## Gunicorn Configuration

The server uses Gunicorn with a custom configuration file (`server/gunicorn.conf.py`).

### Configuration Options

```python
# Bind to all interfaces on port 8080
bind = "0.0.0.0:8080"

# Worker configuration
workers = 1  # Single worker to avoid scheduler duplication
worker_class = "sync"
worker_connections = 1000

# Timeouts
timeout = 120  # Request timeout in seconds
keepalive = 5  # Keep-alive connections

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"

# Process naming
proc_name = "area_server"

# Auto-reload in development
reload = True  # When FLASK_ENV=development
```

### Key Settings

| Setting | Value | Description |
|---------|-------|-------------|
| `bind` | `0.0.0.0:8080` | Listen on all interfaces, port 8080 |
| `workers` | `1` | Single worker (see note below) |
| `timeout` | `120` | 2-minute request timeout for long operations |
| `loglevel` | `info` | Configurable via `LOG_LEVEL` env var |

> **Note on Workers:** The server uses a single worker because the APScheduler runs inside the Flask app. Multiple workers would create duplicate schedulers, causing workflows to execute multiple times. For scaling, the scheduler should be moved to a separate container.

---

## Environment Variables

### Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GUNICORN_WORKERS` | `1` | Number of worker processes |
| `LOG_LEVEL` | `info` | Logging level (debug, info, warning, error) |
| `FLASK_ENV` | `production` | Environment mode (enables auto-reload in development) |

### Example

```bash
# Production
GUNICORN_WORKERS=1
LOG_LEVEL=warning
FLASK_ENV=production

# Development
GUNICORN_WORKERS=1
LOG_LEVEL=debug
FLASK_ENV=development
```

---

## Docker Deployment

### Server Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Start Gunicorn with config file
CMD ["gunicorn", "--config", "gunicorn.conf.py", "app:app"]
```

### Docker Compose

The complete stack is defined in `docker-compose.yml`:

```yaml
services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: area_db
      POSTGRES_USER: area_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build: ./server
    ports:
      - "8080:8080"
    depends_on:
      - database
    environment:
      DATABASE_URL: postgresql://area_user:${POSTGRES_PASSWORD}@database:5432/area_db
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      # ... other env vars

  client_web:
    build:
      context: ./client
      dockerfile: Dockerfile.web
    ports:
      - "8081:8081"

  client_mobile:
    build:
      context: ./client
      dockerfile: Dockerfile.mobile
    volumes:
      - mobile_build:/build

volumes:
  postgres_data:
  mobile_build:
```

---

## Starting the Server

### With Docker Compose (Recommended)

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f server
```

### Manual Start

```bash
cd server

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:pass@localhost:5432/area_db
export JWT_SECRET_KEY=your-secret-key

# Start with Gunicorn
gunicorn --config gunicorn.conf.py app:app

# Or with Flask development server
flask run --host=0.0.0.0 --port=8080
```

---

## Health Checks

### Health Endpoint

The server exposes a health check endpoint:

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "scheduler": "enabled",
  "services": {
    "scheduler_interval": "1 minutes",
    "active_count": 8
  }
}
```

### Docker Health Check

Add to `docker-compose.yml`:

```yaml
server:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

---

## Logging

### Log Format

Access logs follow the format:
```
%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"
```

Example:
```
172.20.0.1 - - [18/Jan/2026:10:30:00 +0000] "GET /api/auth/me HTTP/1.1" 200 234 "-" "Mozilla/5.0"
```

### Log Levels

| Level | Description |
|-------|-------------|
| `debug` | Detailed debugging information |
| `info` | General operational messages |
| `warning` | Warning messages |
| `error` | Error messages only |
| `critical` | Critical errors only |

Set via environment variable:
```bash
LOG_LEVEL=debug
```

---

## Related Documentation

- [Configuration](./configuration.md)
- [Architecture & Diagrams](./architecture.md)
- [API Authentication](./api-authentication.md)
