from flask import Blueprint, request, jsonify
from database.models import db, User
from utils.auth_utils import hash_password, verify_password, generate_token, require_auth

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
