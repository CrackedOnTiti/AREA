from flask import Blueprint, request, jsonify
from utils.about import get_about_json
from database.models import db, Service
from config import Config

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Root endpoint"""
    return "Nibba"


@main_bp.route('/about.json')
def about():
    """Returns information about available services, actions, and reactions."""
    return get_about_json(request)


@main_bp.route('/health')
def health():
    """Health check endpoint for monitoring and deployment"""
    health_status = {
        'status': 'healthy',
        'database': 'unknown',
        'scheduler': 'unknown',
        'services': {}
    }

    # Check database connectivity
    try:
        Service.query.limit(1).all()
        health_status['database'] = 'connected'
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['database'] = f'error: {str(e)}'

    # Check scheduler status
    try:
        health_status['scheduler'] = 'enabled' if Config.SCHEDULER_ENABLED else 'disabled'
        health_status['services']['scheduler_interval'] = f"{Config.SCHEDULER_CHECK_INTERVAL_MINUTES} minutes"
    except Exception as e:
        health_status['scheduler'] = f'error: {str(e)}'

    # Add service count
    try:
        service_count = Service.query.filter_by(is_active=True).count()
        health_status['services']['active_count'] = service_count
    except Exception:
        pass

    status_code = 200 if health_status['status'] == 'healthy' else 503

    return jsonify(health_status), status_code
