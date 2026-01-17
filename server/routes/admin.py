from flask import Blueprint, jsonify
from database.models import db, User, UserArea
from utils.auth_utils import require_auth

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/users', methods=['GET'])
@require_auth
def get_all_users(current_user):
    """Get all users with their workflows for admin"""
    if current_user.id != 1:
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    result = []

    for user in users:
        # Get user's workflows with full details
        workflows = UserArea.query.filter_by(user_id=user.id).all()
        workflow_list = [workflow.to_dict() for workflow in workflows]

        result.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'oauth_provider': user.oauth_provider,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'workflow_count': len(workflows),
            'workflows': workflow_list,
        })

    return jsonify({'users': result}), 200
