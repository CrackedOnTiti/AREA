from flask import Blueprint, jsonify
from database.models import Service
from utils.auth_utils import require_auth

services_bp = Blueprint('services', __name__, url_prefix='/api/services')


@services_bp.route('', methods=['GET'])
@require_auth
def list_services(current_user):
    """List all available services with their actions and reactions"""
    services = Service.query.filter_by(is_active=True).all()

    return jsonify({
        'services': [service.to_dict() for service in services]
    }), 200
