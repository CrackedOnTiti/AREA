import time
import os
from flask import Flask, request
from database.models import db
from helper import get_about_json
time.sleep(5) # need to wait for db service first

app = Flask(__name__)

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://area_user:area_password@localhost:5432/area_db')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# basically mkdir -p
with app.app_context():
    db.create_all()
    print("Database tables initialized")

@app.route('/')
def index():
    return "Nibba"

@app.route('/about.json')
def about():
    """
    Returns information about available services, actions, and reactions.
    Required endpoint as per project specification.
    """
    return get_about_json(request)

if __name__ == '__main__':
    print("Starting Flask server on port 8080...")
    app.run(host='0.0.0.0', port=8080, debug=True)
