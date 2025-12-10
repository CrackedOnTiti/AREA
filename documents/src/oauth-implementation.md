# OAuth2 Authentication Implementation

## Overview

Implemented Google OAuth2 authentication to allow users to register and login using their Google accounts. This provides a seamless authentication experience and reduces friction for new users.

## Google Cloud Console Setup

### Created OAuth2 Credentials
- **Project Name**: AREA Dev
- **Application Type**: Web application
- **OAuth Client ID**: `539654341004-1omviqr547ctdc0kn4ikvovs6gfvcih7.apps.googleusercontent.com`
- **Authorized Redirect URIs**:
  - `http://localhost:8080/api/auth/google/callback` (development)

### OAuth Consent Screen
- **User Type**: External
- **Application Status**: Testing mode
- **Test Users**: Added development team emails to audience list
- **Scopes**: `openid`, `email`, `profile`

## Architecture

### OAuth2 Flow (Authorization Code Grant)

```
1. User clicks "Login with Google"
   ↓
2. Backend redirects to Google consent screen (/api/auth/google/login)
   ↓
3. User approves permissions on Google
   ↓
4. Google redirects back with authorization code (/api/auth/google/callback)
   ↓
5. Backend exchanges code for access token
   ↓
6. Backend fetches user profile from Google (email, name, Google ID)
   ↓
7. Backend finds or creates user in database
   ↓
8. Backend generates JWT token
   ↓
9. Returns JWT token to client
```

## Implementation Details

### Dependencies Added

```txt
Authlib==1.3.0      # OAuth2 client library
flask-cors          # Cross-Origin Resource Sharing support
```

### Configuration (`server/config.py`)

```python
# Google OAuth2
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Flask SECRET_KEY (required for OAuth session management)
SECRET_KEY = os.getenv('JWT_SECRET_KEY')  # Reuses existing JWT secret

# CORS
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
```

### OAuth Client Initialization (`server/app.py`)

```python
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth

# Initialize CORS
CORS(app, origins=Config.CORS_ORIGINS)

# Initialize OAuth
oauth = OAuth(app)
oauth.register(
    name='google',
    client_id=Config.GOOGLE_CLIENT_ID,
    client_secret=Config.GOOGLE_CLIENT_SECRET,
    server_metadata_url=Config.GOOGLE_DISCOVERY_URL,
    client_kwargs={'scope': 'openid email profile'}
)
```

### User Management Logic (`server/utils/auth_utils.py`)

#### `find_or_create_oauth_user(provider, provider_user_id, email, name=None)`

Handles the complex logic of finding or creating users from OAuth data:

**Case 1: Existing OAuth User**
- User with matching `oauth_provider` and `oauth_provider_id` found
- Returns existing user

**Case 2: Existing Local User with Same Email**
- User with matching email but no OAuth data found
- Links OAuth account to existing local account
- Updates `oauth_provider` and `oauth_provider_id` fields
- Allows users to login via both password and OAuth

**Case 3: New User**
- Creates new user with OAuth data
- Generates unique username from email or name
- Sets `password_hash` to NULL (OAuth-only user)
- Cannot login via password endpoint

```python
def find_or_create_oauth_user(provider, provider_user_id, email, name=None):
    """Find or create a user from OAuth provider data"""

    # Try to find existing OAuth user
    user = User.query.filter_by(
        oauth_provider=provider,
        oauth_provider_id=provider_user_id
    ).first()

    if user:
        return user

    # Check for existing local user with same email
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        # Link OAuth to existing account
        existing_user.oauth_provider = provider
        existing_user.oauth_provider_id = provider_user_id
        db.session.commit()
        return existing_user

    # Generate unique username
    base_username = name.lower().replace(' ', '_') if name else email.split('@')[0]
    username = base_username
    counter = 1
    while User.query.filter_by(username=username).first():
        username = f"{base_username}_{counter}"
        counter += 1

    # Create new OAuth user
    new_user = User(
        username=username,
        email=email,
        password_hash=None,
        oauth_provider=provider,
        oauth_provider_id=provider_user_id
    )

    db.session.add(new_user)
    db.session.commit()

    return new_user
```

## Environment Variables

Required environment variables in `.env`:

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Flask Configuration (needed for OAuth sessions)
JWT_SECRET_KEY=your-secret-key

# CORS Configuration
CORS_ORIGINS=*
```

## References

- [Authlib Documentation](https://docs.authlib.org/en/latest/)
- [Google OAuth2 Guide](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [Issue #10 - Google OAuth2 Implementation](https://github.com/CrackedOnTiti/AREA/issues/10)
