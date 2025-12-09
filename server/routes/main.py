from flask import Blueprint, request
from utils.helpers import get_about_json

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Root endpoint"""
    return "Nibba"


@main_bp.route('/about.json')
def about():
    """Returns information about available services, actions, and reactions."""
    return get_about_json(request)
