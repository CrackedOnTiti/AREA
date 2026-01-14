from flask import Blueprint, request, jsonify, redirect, url_for, session
from database.models import db, UserServiceConnection, Service
from utils.auth_utils import require_auth
from datetime import datetime, timezone, timedelta
from config import Config

connections_bp = Blueprint('service_connections', __name__, url_prefix='/api/connections')

# Temporary storage for OAuth state -> user_id mapping
# In production, use Redis or database
oauth_state_storage = {}


@connections_bp.route('', methods=['GET'])
@require_auth
def list_connections(current_user):
    """List all services and their connection status for current user"""
    all_services = Service.query.filter_by(is_active=True, requires_oauth=True).all()
    user_connections = UserServiceConnection.query.filter_by(user_id=current_user.id).all()

    # Create a map of connected service IDs
    connected_service_ids = {conn.service_id for conn in user_connections}

    result = []
    for service in all_services:
        connection = next((c for c in user_connections if c.service_id == service.id), None)
        result.append({
            'service_id': service.id,
            'service_name': service.name,
            'display_name': service.display_name,
            'description': service.description,
            'is_connected': service.id in connected_service_ids,
            'connected_at': connection.connected_at.isoformat() if connection else None
        })

    return jsonify({'connections': result}), 200


@connections_bp.route('/gmail', methods=['GET', 'POST'])
def connect_gmail():
    """Initiate Gmail OAuth flow"""
    from app import oauth
    from utils.auth_utils import decode_token

    # Try to get token from Authorization header or URL param
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        token = request.args.get('token')

    if not token:
        return jsonify({'error': 'Authentication required'}), 401

    # Decode token to get user
    payload = decode_token(token)
    if not payload:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = payload.get('user_id')
    if not user_id:
        return jsonify({'error': 'Invalid token payload'}), 401

    # Store user_id in session for callback
    session['connecting_user_id'] = user_id

    # Redirect to Google OAuth with Gmail scope
    redirect_uri = url_for('service_connections.gmail_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@connections_bp.route('/gmail/callback', methods=['GET'])
def gmail_callback():
    """Handle Gmail OAuth callback"""
    from app import oauth

    # Get user_id from session
    user_id = session.pop('connecting_user_id', None)
    if not user_id:
        return jsonify({'error': 'Invalid session'}), 400

    try:
        # Exchange authorization code for token
        token = oauth.google.authorize_access_token()

        # Get Gmail and Drive service IDs (they share the same OAuth token)
        gmail_service = Service.query.filter_by(name='gmail').first()
        drive_service = Service.query.filter_by(name='drive').first()

        if not gmail_service:
            return jsonify({'error': 'Gmail service not found'}), 404

        # Calculate token expiration
        expires_in = token.get('expires_in', 3600)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

        # Create/update connection for Gmail
        gmail_connection = UserServiceConnection.query.filter_by(
            user_id=user_id,
            service_id=gmail_service.id
        ).first()

        if gmail_connection:
            # Update existing connection
            gmail_connection.access_token = token['access_token']
            gmail_connection.refresh_token = token.get('refresh_token', gmail_connection.refresh_token)
            gmail_connection.token_expires_at = expires_at
            gmail_connection.updated_at = datetime.now(timezone.utc)
        else:
            # Create new connection
            gmail_connection = UserServiceConnection(
                user_id=user_id,
                service_id=gmail_service.id,
                access_token=token['access_token'],
                refresh_token=token.get('refresh_token'),
                token_expires_at=expires_at
            )
            db.session.add(gmail_connection)

        # Create/update connection for Drive (same token)
        if drive_service:
            drive_connection = UserServiceConnection.query.filter_by(
                user_id=user_id,
                service_id=drive_service.id
            ).first()

            if drive_connection:
                # Update existing connection
                drive_connection.access_token = token['access_token']
                drive_connection.refresh_token = token.get('refresh_token', drive_connection.refresh_token)
                drive_connection.token_expires_at = expires_at
                drive_connection.updated_at = datetime.now(timezone.utc)
            else:
                # Create new connection
                drive_connection = UserServiceConnection(
                    user_id=user_id,
                    service_id=drive_service.id,
                    access_token=token['access_token'],
                    refresh_token=token.get('refresh_token'),
                    token_expires_at=expires_at
                )
                db.session.add(drive_connection)

        db.session.commit()

        return redirect(f"{Config.FRONTEND_URL}/services?connected=gmail")

    except Exception as e:
        return redirect(f"{Config.FRONTEND_URL}/services?error=gmail")


@connections_bp.route('/gmail', methods=['DELETE'])
@require_auth
def disconnect_gmail(current_user):
    """Disconnect Gmail service"""
    # Get Gmail service ID
    gmail_service = Service.query.filter_by(name='gmail').first()
    if not gmail_service:
        return jsonify({'error': 'Gmail service not found'}), 404

    # Find and delete connection
    connection = UserServiceConnection.query.filter_by(
        user_id=current_user.id,
        service_id=gmail_service.id
    ).first()

    if not connection:
        return jsonify({'error': 'Gmail not connected'}), 404

    db.session.delete(connection)
    db.session.commit()

    return jsonify({'message': 'Gmail disconnected successfully'}), 200


@connections_bp.route('/facebook', methods=['GET', 'POST'])
def connect_facebook():
    """Initiate Facebook OAuth flow for service connection"""
    from app import oauth
    from utils.auth_utils import decode_token

    # Try to get token from Authorization header or URL param
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        token = request.args.get('token')

    if not token:
        return jsonify({'error': 'Authentication required'}), 401

    # Decode token to get user
    payload = decode_token(token)
    if not payload:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = payload.get('user_id')
    if not user_id:
        return jsonify({'error': 'Invalid token payload'}), 401

    # Store user_id in session for callback
    session['connecting_user_id'] = user_id

    # Redirect to Facebook OAuth with user_posts scope
    redirect_uri = url_for('service_connections.facebook_callback', _external=True)
    return oauth.facebook.authorize_redirect(redirect_uri, scope='email public_profile user_posts')


@connections_bp.route('/facebook/callback', methods=['GET'])
def facebook_callback():
    """Handle Facebook OAuth callback for service connection"""
    from app import oauth

    # Get user_id from session
    user_id = session.pop('connecting_user_id', None)
    if not user_id:
        return jsonify({'error': 'Invalid session'}), 400

    try:
        # Exchange authorization code for token
        token = oauth.facebook.authorize_access_token()

        # Get Facebook service
        facebook_service = Service.query.filter_by(name='facebook').first()

        if not facebook_service:
            return jsonify({'error': 'Facebook service not found'}), 404

        # Facebook tokens typically don't expire quickly, but we'll set a default
        # In production, you'd want to handle long-lived tokens properly
        expires_in = token.get('expires_in', 5183999)  # ~60 days default
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

        # Create/update connection
        connection = UserServiceConnection.query.filter_by(
            user_id=user_id,
            service_id=facebook_service.id
        ).first()

        if connection:
            # Update existing connection
            connection.access_token = token['access_token']
            connection.token_expires_at = expires_at
            connection.updated_at = datetime.now(timezone.utc)
        else:
            # Create new connection
            connection = UserServiceConnection(
                user_id=user_id,
                service_id=facebook_service.id,
                access_token=token['access_token'],
                refresh_token=None,  # Facebook doesn't use refresh tokens the same way
                token_expires_at=expires_at
            )
            db.session.add(connection)

        db.session.commit()

        return redirect(f"{Config.FRONTEND_URL}/services?connected=facebook")

    except Exception as e:
        return redirect(f"{Config.FRONTEND_URL}/services?error=facebook")


@connections_bp.route('/facebook', methods=['DELETE'])
@require_auth
def disconnect_facebook(current_user):
    """Disconnect Facebook service"""
    # Get Facebook service ID
    facebook_service = Service.query.filter_by(name='facebook').first()
    if not facebook_service:
        return jsonify({'error': 'Facebook service not found'}), 404

    # Find and delete connection
    connection = UserServiceConnection.query.filter_by(
        user_id=current_user.id,
        service_id=facebook_service.id
    ).first()

    if not connection:
        return jsonify({'error': 'Facebook not connected'}), 404

    db.session.delete(connection)
    db.session.commit()

    return jsonify({'message': 'Facebook disconnected successfully'}), 200


@connections_bp.route('/github', methods=['GET', 'POST'])
def connect_github():
    """Initiate GitHub OAuth flow for service connection"""
    from app import oauth
    from utils.auth_utils import decode_token

    # Try to get token from Authorization header or URL param
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        token = request.args.get('token')

    if not token:
        return jsonify({'error': 'Authentication required'}), 401

    # Decode token to get user
    payload = decode_token(token)
    if not payload:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = payload.get('user_id')
    if not user_id:
        return jsonify({'error': 'Invalid token payload'}), 401

    # Store user_id in session for callback
    session['connecting_user_id'] = user_id

    # Redirect to GitHub OAuth
    redirect_uri = url_for('service_connections.github_callback', _external=True)
    return oauth.github.authorize_redirect(redirect_uri)


@connections_bp.route('/github/callback', methods=['GET'])
def github_callback():
    """Handle GitHub OAuth callback for service connection"""
    from app import oauth

    # Get user_id from session
    user_id = session.pop('connecting_user_id', None)
    if not user_id:
        return jsonify({'error': 'Invalid session'}), 400

    try:
        # Exchange authorization code for token
        token = oauth.github.authorize_access_token()

        # Get GitHub service
        github_service = Service.query.filter_by(name='github').first()

        if not github_service:
            return jsonify({'error': 'GitHub service not found'}), 404

        # GitHub tokens don't typically expire
        expires_at = datetime.now(timezone.utc) + timedelta(days=365)

        # Create/update connection
        connection = UserServiceConnection.query.filter_by(
            user_id=user_id,
            service_id=github_service.id
        ).first()

        if connection:
            # Update existing connection
            connection.access_token = token['access_token']
            connection.token_expires_at = expires_at
            connection.updated_at = datetime.now(timezone.utc)
        else:
            # Create new connection
            connection = UserServiceConnection(
                user_id=user_id,
                service_id=github_service.id,
                access_token=token['access_token'],
                refresh_token=None,
                token_expires_at=expires_at
            )
            db.session.add(connection)

        db.session.commit()

        return redirect(f"{Config.FRONTEND_URL}/services?connected=github")

    except Exception as e:
        return redirect(f"{Config.FRONTEND_URL}/services?error=github")


@connections_bp.route('/github', methods=['DELETE'])
@require_auth
def disconnect_github(current_user):
    """Disconnect GitHub service"""
    # Get GitHub service ID
    github_service = Service.query.filter_by(name='github').first()
    if not github_service:
        return jsonify({'error': 'GitHub service not found'}), 404

    # Find and delete connection
    connection = UserServiceConnection.query.filter_by(
        user_id=current_user.id,
        service_id=github_service.id
    ).first()

    if not connection:
        return jsonify({'error': 'GitHub not connected'}), 404

    db.session.delete(connection)
    db.session.commit()

    return jsonify({'message': 'GitHub disconnected successfully'}), 200


@connections_bp.route('/spotify', methods=['GET', 'POST'])
def connect_spotify():
    """Initiate Spotify OAuth flow for service connection"""
    from app import oauth
    from utils.auth_utils import decode_token

    # Try to get token from Authorization header or URL param
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        token = request.args.get('token')

    if not token:
        return jsonify({'error': 'Authentication required'}), 401

    # Decode token to get user
    payload = decode_token(token)
    if not payload:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = payload.get('user_id')
    if not user_id:
        return jsonify({'error': 'Invalid token payload'}), 401

    # Generate redirect URI
    redirect_uri = url_for('service_connections.spotify_callback', _external=True)
    redirect_uri = redirect_uri.replace('localhost', '127.0.0.1')

    # Get the OAuth response to extract the state before redirect
    auth_response = oauth.spotify.authorize_redirect(redirect_uri)

    # Extract state from the redirect URL
    import re
    state_match = re.search(r'state=([^&]+)', auth_response.location)
    if state_match:
        oauth_state = state_match.group(1)
        oauth_state_storage[oauth_state] = user_id

    return auth_response


@connections_bp.route('/spotify/callback', methods=['GET'])
def spotify_callback():
    """Handle Spotify OAuth callback for service connection"""
    from app import oauth

    # Get state and code from query parameters
    oauth_state = request.args.get('state')
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        return jsonify({'error': f'OAuth error: {error}'}), 400

    if not code or not oauth_state:
        return jsonify({'error': 'Missing authorization code or state'}), 400

    # Retrieve user_id from our temporary storage
    user_id = oauth_state_storage.get(oauth_state)

    if not user_id:
        return jsonify({'error': 'Invalid or expired OAuth state'}), 400

    # Clean up the state storage
    oauth_state_storage.pop(oauth_state, None)

    try:
        # Exchange authorization code for token manually
        # We can't use authorize_access_token() because it requires session state for CSRF
        # Instead, we'll manually exchange the code using requests

        import requests
        import base64
        from config import Config

        # Prepare credentials for basic auth
        client_id = Config.SPOTIFY_CLIENT_ID
        client_secret = Config.SPOTIFY_CLIENT_SECRET
        auth_str = f"{client_id}:{client_secret}"
        auth_b64 = base64.b64encode(auth_str.encode()).decode()

        # Exchange code for token
        redirect_uri = url_for('service_connections.spotify_callback', _external=True).replace('localhost', '127.0.0.1')

        token_response = requests.post(
            'https://accounts.spotify.com/api/token',
            headers={
                'Authorization': f'Basic {auth_b64}',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirect_uri
            }
        )

        if token_response.status_code != 200:
            return jsonify({'error': f'Token exchange failed: {token_response.text}'}), 500

        token = token_response.json()

        # Get Spotify service
        spotify_service = Service.query.filter_by(name='spotify').first()

        if not spotify_service:
            return jsonify({'error': 'Spotify service not found'}), 404

        # Spotify tokens typically expire in 1 hour
        expires_in = token.get('expires_in', 3600)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

        # Create/update connection
        connection = UserServiceConnection.query.filter_by(
            user_id=user_id,
            service_id=spotify_service.id
        ).first()

        if connection:
            # Update existing connection
            connection.access_token = token['access_token']
            connection.refresh_token = token.get('refresh_token', connection.refresh_token)
            connection.token_expires_at = expires_at
            connection.updated_at = datetime.now(timezone.utc)
        else:
            # Create new connection
            connection = UserServiceConnection(
                user_id=user_id,
                service_id=spotify_service.id,
                access_token=token['access_token'],
                refresh_token=token.get('refresh_token'),
                token_expires_at=expires_at
            )
            db.session.add(connection)

        db.session.commit()

        return redirect(f"{Config.FRONTEND_URL}/services?connected=spotify")

    except Exception as e:
        return redirect(f"{Config.FRONTEND_URL}/services?error=spotify")


@connections_bp.route('/spotify', methods=['DELETE'])
@require_auth
def disconnect_spotify(current_user):
    """Disconnect Spotify service"""
    # Get Spotify service ID
    spotify_service = Service.query.filter_by(name='spotify').first()
    if not spotify_service:
        return jsonify({'error': 'Spotify service not found'}), 404

    # Find and delete connection
    connection = UserServiceConnection.query.filter_by(
        user_id=current_user.id,
        service_id=spotify_service.id
    ).first()

    if not connection:
        return jsonify({'error': 'Spotify not connected'}), 404

    db.session.delete(connection)
    db.session.commit()

    return jsonify({'message': 'Spotify disconnected successfully'}), 200
