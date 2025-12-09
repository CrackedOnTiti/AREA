from flask import Blueprint, request, jsonify, redirect, url_for, session
from database.models import db, UserServiceConnection, Service
from utils.auth_utils import require_auth
from datetime import datetime, timezone, timedelta

connections_bp = Blueprint('service_connections', __name__, url_prefix='/api/connections')


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


@connections_bp.route('/gmail', methods=['POST'])
@require_auth
def connect_gmail(current_user):
    """Initiate Gmail OAuth flow"""
    from app import oauth

    # Store user_id in session for callback
    session['connecting_user_id'] = current_user.id

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

        # Get Gmail service ID
        gmail_service = Service.query.filter_by(name='gmail').first()
        if not gmail_service:
            return jsonify({'error': 'Gmail service not found'}), 404

        # Calculate token expiration
        expires_in = token.get('expires_in', 3600)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

        # Check if connection already exists
        connection = UserServiceConnection.query.filter_by(
            user_id=user_id,
            service_id=gmail_service.id
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
                service_id=gmail_service.id,
                access_token=token['access_token'],
                refresh_token=token.get('refresh_token'),
                token_expires_at=expires_at
            )
            db.session.add(connection)

        db.session.commit()

        # Redirect to frontend success page or return success response
        return jsonify({
            'success': True,
            'message': 'Gmail connected successfully',
            'connection': connection.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': f'OAuth failed: {str(e)}'}), 500


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
