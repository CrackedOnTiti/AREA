from flask import Blueprint, request, jsonify, url_for, redirect, current_app
from database.models import db, User
from utils.auth_utils import hash_password, verify_password, generate_token, require_auth, password_complexity, find_or_create_oauth_user, generate_reset_token
from utils.email_utils import send_password_reset_email
from datetime import datetime, timedelta, timezone

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user with username/email/password"""
    data = request.get_json()

    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields: username, email, password'}), 400

    username = data['username']
    email = data['email']
    password = data['password']

    # validate input
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    if len(password) > 128:
        return jsonify({'error': 'Password is too long'}), 400
    
    if not password_complexity(password):
        return jsonify({'error': 'Password requires a lowercase, uppercase and special character'}), 400
    
    # check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    # hash password and create user and gen token
    password_hash = hash_password(password)
    new_user = User(username=username, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()
    token = generate_token(new_user.id)

    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': new_user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with username/email and password"""
    data = request.get_json()

    if not data or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400

    password = data['password']

    # Find user by username or email
    user = None
    if 'username' in data:
        user = User.query.filter_by(username=data['username']).first()
    elif 'email' in data:
        user = User.query.filter_by(email=data['email']).first()
    else:
        return jsonify({'error': 'Must provide username or email'}), 400

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    # Check if user has a password (not OAuth-only user)
    if not user.password_hash:
        return jsonify({'error': 'This account uses OAuth login. Please use social login.'}), 401

    # Verify password
    if not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Generate JWT token
    token = generate_token(user.id)

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user(current_user):
    """Get current authenticated user info"""
    return jsonify({
        'user': current_user.to_dict()
    }), 200


@auth_bp.route('/google/login', methods=['GET'])
def google_login():
    """Initiate Google OAuth2 login"""
    # Get Oauth instance from app extensions
    oauth = current_app.extensions['authlib.integrations.flask_client']

    # Generate callback URL
    redirect_uri = url_for('auth.google_callback', _external=True)

    # Redirect user to Google for auth
    return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.route('/google/callback', methods=['GET'])
def google_callback():
    """Google OAuth2 callback"""
    try:
        # Get Oauth instance from app extensions
        oauth = current_app.extensions['authlib.integrations.flask_client']

        # Get access token from Google
        token = oauth.google.authorize_access_token()

        # Parse user info from the token
        user_info = token.get('userinfo')
        if not user_info:
            return jsonify({'error': 'Failed to get user info from Google'}), 400

        # Extract user data
        google_user_id = user_info.get('sub')  # Google's user ID
        email = user_info.get('email')
        name = user_info.get('name')

        if not google_user_id or not email:
            return jsonify({'error': 'Missing required user information from Google'}), 400

        # Find or create user
        user = find_or_create_oauth_user(
            provider='google',
            provider_user_id=google_user_id,
            email=email,
            name=name
        )

        # Generate JWT token
        jwt_token = generate_token(user.id)

        # Redirect to frontend with token
        frontend_url = 'http://localhost:8081/oauth/callback'
        return redirect(f'{frontend_url}?token={jwt_token}&success=true&service=google')

    except Exception as e:
        frontend_url = 'http://localhost:8081/oauth/callback'
        return redirect(f'{frontend_url}?error={str(e)}')


@auth_bp.route('/facebook/login', methods=['GET'])
def facebook_login():
    """Initiate Facebook OAuth2 login"""
    # Get OAuth instance from app extensions
    oauth = current_app.extensions['authlib.integrations.flask_client']

    # Generate callback URL
    redirect_uri = url_for('auth.facebook_callback', _external=True)

    # Redirect user to Facebook for auth
    return oauth.facebook.authorize_redirect(redirect_uri)


@auth_bp.route('/facebook/callback', methods=['GET'])
def facebook_callback():
    """Facebook OAuth2 callback"""
    try:
        # Get OAuth instance from app extensions
        oauth = current_app.extensions['authlib.integrations.flask_client']

        # Get access token from Facebook
        token = oauth.facebook.authorize_access_token()

        # Get user info from Facebook Graph API
        resp = oauth.facebook.get('https://graph.facebook.com/me?fields=id,name,email')
        user_info = resp.json()

        if not user_info:
            return jsonify({'error': 'Failed to get user info from Facebook'}), 400

        # Extract user data
        facebook_user_id = user_info.get('id')
        email = user_info.get('email')
        name = user_info.get('name')

        if not facebook_user_id:
            return jsonify({'error': 'Missing required user information from Facebook'}), 400

        # Email might not be available if user denied permission
        if not email:
            email = f"{facebook_user_id}@facebook.user"  # Fallback email

        # Find or create user
        user = find_or_create_oauth_user(
            provider='facebook',
            provider_user_id=facebook_user_id,
            email=email,
            name=name
        )

        # Generate JWT token
        jwt_token = generate_token(user.id)

        # Redirect to frontend with token
        frontend_url = 'http://localhost:8081/oauth/callback'
        return redirect(f'{frontend_url}?token={jwt_token}&success=true&service=facebook')

    except Exception as e:
        frontend_url = 'http://localhost:8081/oauth/callback'
        return redirect(f'{frontend_url}?error={str(e)}')


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset email"""
    data = request.get_json()

    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400

    email = data['email']

    # Find user by email
    user = User.query.filter_by(email=email).first()

    # Always return success to prevent email enumeration
    if not user:
        return jsonify({'message': 'If an account with that email exists, a password reset link has been sent'}), 200

    # Check if user is OAuth-only
    if not user.password_hash:
        return jsonify({'message': 'If an account with that email exists, a password reset link has been sent'}), 200

    # Generate reset token
    reset_token = generate_reset_token()
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.session.commit()

    # Send email
    email_sent = send_password_reset_email(user.email, reset_token)

    if not email_sent:
        return jsonify({'error': 'Failed to send reset email. Please try again later.'}), 500

    return jsonify({'message': 'If an account with that email exists, a password reset link has been sent'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    data = request.get_json()

    if not data or not all(k in data for k in ('token', 'password')):
        return jsonify({'error': 'Token and password are required'}), 400

    token = data['token']
    new_password = data['password']

    # Validate password
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if len(new_password) > 128:
        return jsonify({'error': 'Password is too long'}), 400

    if not password_complexity(new_password):
        return jsonify({'error': 'Password requires a lowercase, uppercase and special character'}), 400

    # Find user by token
    user = User.query.filter_by(reset_token=token).first()

    if not user:
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    # Check if token is expired
    if not user.reset_token_expires:
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    # Ensure timezone-aware comparison
    token_expiry = user.reset_token_expires
    if token_expiry.tzinfo is None:
        token_expiry = token_expiry.replace(tzinfo=timezone.utc)

    if token_expiry < datetime.now(timezone.utc):
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    # Reset password
    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()

    return jsonify({'message': 'Password successfully reset. You can now log in with your new password.'}), 200