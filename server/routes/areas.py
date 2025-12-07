from flask import Blueprint, request, jsonify
from database.models import db, UserArea, WorkflowLog, Action, Reaction, Service
from utils.auth_utils import require_auth
from datetime import datetime, timezone

areas_bp = Blueprint('areas', __name__, url_prefix='/api/areas')


@areas_bp.route('/services', methods=['GET'])
@require_auth
def list_services(current_user):
    """List all available services with their actions and reactions"""
    services = Service.query.filter_by(is_active=True).all()

    return jsonify({
        'services': [service.to_dict() for service in services]
    }), 200


@areas_bp.route('', methods=['POST'])
@require_auth
def create_area(current_user):
    """Create a new workflow (AREA)"""
    data = request.get_json()

    # Validate required fields
    required_fields = ['name', 'action_id', 'reaction_id', 'action_config', 'reaction_config']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Validate action exists
    action = Action.query.get(data['action_id'])
    if not action:
        return jsonify({'error': 'Action not found'}), 404

    # Validate reaction exists
    reaction = Reaction.query.get(data['reaction_id'])
    if not reaction:
        return jsonify({'error': 'Reaction not found'}), 404

    # Create new AREA
    new_area = UserArea(
        user_id=current_user.id,
        name=data['name'],
        action_id=data['action_id'],
        reaction_id=data['reaction_id'],
        action_config=data['action_config'],
        reaction_config=data['reaction_config'],
        is_active=data.get('is_active', True)
    )

    db.session.add(new_area)
    db.session.commit()

    return jsonify({
        'message': 'Workflow created successfully',
        'area': new_area.to_dict()
    }), 201


@areas_bp.route('', methods=['GET'])
@require_auth
def list_areas(current_user):
    """List all workflows for the current user"""
    # Get query parameters for pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    is_active = request.args.get('is_active', type=str)

    # Build query
    query = UserArea.query.filter_by(user_id=current_user.id)

    # Filter by active status if provided
    if is_active is not None:
        is_active_bool = is_active.lower() == 'true'
        query = query.filter_by(is_active=is_active_bool)

    # Order by creation date (newest first)
    query = query.order_by(UserArea.created_at.desc())

    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'areas': [area.to_dict() for area in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'total_pages': pagination.pages
    }), 200


@areas_bp.route('/<int:area_id>', methods=['GET'])
@require_auth
def get_area(current_user, area_id):
    """Get a specific workflow by ID"""
    area = UserArea.query.get(area_id)

    if not area:
        return jsonify({'error': 'Workflow not found'}), 404

    # Verify ownership
    if area.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this workflow'}), 403

    return jsonify(area.to_dict()), 200


@areas_bp.route('/<int:area_id>', methods=['PUT'])
@require_auth
def update_area(current_user, area_id):
    """Update a workflow"""
    area = UserArea.query.get(area_id)

    if not area:
        return jsonify({'error': 'Workflow not found'}), 404

    # Verify ownership
    if area.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this workflow'}), 403

    data = request.get_json()

    # Update allowed fields
    if 'name' in data:
        area.name = data['name']
    if 'action_config' in data:
        area.action_config = data['action_config']
    if 'reaction_config' in data:
        area.reaction_config = data['reaction_config']
    if 'is_active' in data:
        area.is_active = data['is_active']

    area.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        'message': 'Workflow updated successfully',
        'area': area.to_dict()
    }), 200


@areas_bp.route('/<int:area_id>/toggle', methods=['PATCH'])
@require_auth
def toggle_area(current_user, area_id):
    """Toggle workflow active status"""
    area = UserArea.query.get(area_id)

    if not area:
        return jsonify({'error': 'Workflow not found'}), 404

    # Verify ownership
    if area.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this workflow'}), 403

    # Toggle active status
    area.is_active = not area.is_active
    area.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        'message': f'Workflow {"enabled" if area.is_active else "disabled"} successfully',
        'area': area.to_dict()
    }), 200


@areas_bp.route('/<int:area_id>', methods=['DELETE'])
@require_auth
def delete_area(current_user, area_id):
    """Delete a workflow"""
    area = UserArea.query.get(area_id)

    if not area:
        return jsonify({'error': 'Workflow not found'}), 404

    # Verify ownership
    if area.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this workflow'}), 403

    db.session.delete(area)
    db.session.commit()

    return jsonify({'message': 'Workflow deleted successfully'}), 200


@areas_bp.route('/<int:area_id>/logs', methods=['GET'])
@require_auth
def get_area_logs(current_user, area_id):
    """Get execution logs for a specific workflow"""
    area = UserArea.query.get(area_id)

    if not area:
        return jsonify({'error': 'Workflow not found'}), 404

    # Verify ownership
    if area.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this workflow'}), 403

    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    # Query logs for this area (newest first)
    pagination = WorkflowLog.query.filter_by(area_id=area_id)\
        .order_by(WorkflowLog.triggered_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'logs': [log.to_dict() for log in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'total_pages': pagination.pages
    }), 200
