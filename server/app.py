import time
from flask import Flask
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from database.models import db
from config import Config
from routes.main import main_bp
from routes.auth import auth_bp
from seed_data import seed_all

time.sleep(5)  # need to wait for db service first

app = Flask(__name__)

app.config.from_object(Config)

# Initialize CORS
CORS(app, origins=Config.CORS_ORIGINS)

# Initialize database
db.init_app(app)

# Initialize OAuth
oauth = OAuth(app)
oauth.register(
    name='google',
    client_id=Config.GOOGLE_CLIENT_ID,
    client_secret=Config.GOOGLE_CLIENT_SECRET,
    server_metadata_url=Config.GOOGLE_DISCOVERY_URL,
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# create tables (basically mkdir -p)
with app.app_context():
    db.create_all()
    print("Database tables initialized")

    # Seed initial services (Timer, Email, System)
    seed_all()

# blueprints
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    print("Starting Flask server on port 8080...")
    app.run(host='0.0.0.0', port=8080, debug=True)
