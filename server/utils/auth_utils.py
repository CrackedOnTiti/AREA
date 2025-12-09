import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify
from database.models import User
from config import Config


def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt(rounds=Config.BCRYPT_LOG_ROUNDS)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def generate_token(user_id):
    """Generate a JWT token for a user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
        'iat': datetime.now(timezone.utc)
    }
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
    return token


def decode_token(token):
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """
    Decorator to protect routes that require authentication
    Usage: @require_auth

    Expects Authorization header: Bearer <token>
    Injects current_user into the route function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None

        # get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401

        if not token:
            return jsonify({'error': 'Authorization token is missing'}), 401

        # decode token
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        # get user from database
        current_user = User.query.get(payload['user_id'])
        if not current_user:
            return jsonify({'error': 'User not found'}), 401

        # inject current_user into the route function
        return f(current_user=current_user, *args, **kwargs)

    return decorated_function

def password_complexity(password):
    """Checks if password is correctly formatted"""
    lower = False
    upper = False
    special = False

    for char in password:
        if not lower or not upper or not special:
            if char.islower():
                lower = True
            if char.isupper():
                upper = True
            if not char.isalnum():
                special = True
            if lower and upper and special:
                return True
    return False


def find_or_create_oauth_user(provider, provider_user_id, email, name=None):
    """Find or create a user from OAuth provider data"""
    from database.models import db

    # Check if user already Oauthed with Google before
    user = User.query.filter_by(
        oauth_provider=provider,
        oauth_provider_id=provider_user_id
    ).first()

    if user:
        return user

    # Check if a user email already exists from classic regestration
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        # Link OAuth account to existing local account
        existing_user.oauth_provider = provider
        existing_user.oauth_provider_id = provider_user_id
        db.session.commit()
        return existing_user

    # Create new user from OAuth data
    # Generate username
    if name:
        base_username = name.lower().replace(' ', '_')
    else:
        base_username = email.split('@')[0]

    # Ensure username is unique
    username = base_username
    counter = 1
    while User.query.filter_by(username=username).first():
        username = f"{base_username}_{counter}"
        counter += 1

    # Create new user
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