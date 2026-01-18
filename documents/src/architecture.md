# Architecture & Diagrams

This document provides visual representations of the AREA platform architecture.

---

## Class Diagram - Database Models

```mermaid
classDiagram
    class User {
        +int id
        +string username
        +string email
        +string password_hash
        +string oauth_provider
        +string oauth_provider_id
        +string reset_token
        +datetime reset_token_expires
        +datetime created_at
        +datetime updated_at
    }

    class Service {
        +int id
        +string name
        +string display_name
        +string description
        +bool requires_oauth
        +string icon_url
        +bool is_active
    }

    class Action {
        +int id
        +int service_id
        +string name
        +string display_name
        +string description
        +json config_schema
    }

    class Reaction {
        +int id
        +int service_id
        +string name
        +string display_name
        +string description
        +json config_schema
    }

    class UserArea {
        +int id
        +int user_id
        +string name
        +int action_id
        +int reaction_id
        +json action_config
        +json reaction_config
        +bool is_active
        +datetime last_triggered
        +datetime created_at
        +datetime updated_at
    }

    class UserServiceConnection {
        +int id
        +int user_id
        +int service_id
        +string access_token
        +string refresh_token
        +datetime token_expires_at
        +datetime connected_at
        +datetime updated_at
    }

    class WorkflowLog {
        +int id
        +int area_id
        +string status
        +string message
        +datetime triggered_at
        +int execution_time_ms
    }

    User "1" --> "*" UserArea : owns
    User "1" --> "*" UserServiceConnection : has
    Service "1" --> "*" Action : provides
    Service "1" --> "*" Reaction : provides
    Service "1" --> "*" UserServiceConnection : connects
    Action "1" --> "*" UserArea : triggers
    Reaction "1" --> "*" UserArea : executes
    UserArea "1" --> "*" WorkflowLog : generates
```

---

## Sequence Diagram - User Authentication

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as Database

    U->>C: Enter credentials
    C->>S: POST /api/auth/login
    S->>DB: Query user by email/username
    DB-->>S: User record
    S->>S: Verify password hash
    S->>S: Generate JWT token
    S-->>C: 200 OK + JWT token
    C->>C: Store token
    C-->>U: Login successful
```

---

## Sequence Diagram - OAuth2 Service Connection

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant P as OAuth Provider
    participant DB as Database

    U->>C: Click "Connect Gmail"
    C->>S: GET /api/connections/gmail?token=JWT
    S->>S: Validate JWT, store user_id in session
    S-->>C: 302 Redirect to Google
    C->>P: OAuth consent screen
    U->>P: Grant permission
    P-->>S: GET /api/connections/gmail/callback?code=XXX
    S->>P: Exchange code for tokens
    P-->>S: Access + Refresh tokens
    S->>DB: Store UserServiceConnection
    S-->>C: 200 OK - Connected
    C-->>U: Gmail connected!
```

---

## Sequence Diagram - Workflow Execution

```mermaid
sequenceDiagram
    participant SC as Scheduler
    participant DB as Database
    participant A as Action Checker
    participant R as Reaction Executor
    participant API as External API

    loop Every minute
        SC->>DB: Get active workflows
        DB-->>SC: List of UserAreas

        loop For each workflow
            SC->>A: Check action condition
            A->>API: Query external service (if needed)
            API-->>A: Response data
            A-->>SC: triggered: true/false

            alt Action triggered
                SC->>R: Execute reaction
                R->>API: Call external API
                API-->>R: Success/Error
                R-->>SC: Execution result
                SC->>DB: Log workflow execution
                SC->>DB: Update last_triggered
            end
        end
    end
```

---

## Component Diagram - System Architecture

```mermaid
flowchart TB
    subgraph Clients
        WEB[Web Client<br/>React :8081]
        MOB[Mobile Client<br/>Flutter APK]
    end

    subgraph Server
        API[Flask API<br/>:8080]
        SCHED[Scheduler<br/>APScheduler]
    end

    subgraph Database
        DB[(PostgreSQL)]
    end

    subgraph External Services
        GOOGLE[Google APIs<br/>Gmail, Drive]
        FB[Facebook API]
        GH[GitHub API]
        SP[Spotify API]
    end

    WEB <-->|REST API| API
    MOB <-->|REST API| API
    API <--> DB
    SCHED <--> DB
    SCHED --> GOOGLE
    SCHED --> FB
    SCHED --> GH
    SCHED --> SP
    API -->|OAuth2| GOOGLE
    API -->|OAuth2| FB
    API -->|OAuth2| GH
    API -->|OAuth2| SP
```

---

## Docker Architecture

```mermaid
flowchart LR
    subgraph Docker Compose
        subgraph server [Server Container]
            FLASK[Flask App<br/>:8080]
        end

        subgraph web [Web Client Container]
            REACT[React App<br/>:8081]
        end

        subgraph mobile [Mobile Build Container]
            FLUTTER[Flutter Build]
        end

        subgraph db [Database Container]
            PG[(PostgreSQL<br/>:5432)]
        end

        VOL[(mobile_build<br/>Volume)]
    end

    FLASK <--> PG
    mobile --> VOL
    web --> VOL
    REACT -->|/client.apk| VOL
```
