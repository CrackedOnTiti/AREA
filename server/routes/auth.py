from flask import Blueprint, request, jsonify, url_for, redirect, current_app
from database.models import db, User
from utils.auth_utils import hash_password, verify_password, generate_token, require_auth, password_complexity, find_or_create_oauth_user

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

        # Return token and user info
        return jsonify({
            'message': 'Google login successful',
            'token': jwt_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': f'OAuth authentication failed: {str(e)}'}), 400
