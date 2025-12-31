import time
from flask import Flask, send_from_directory
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from database.models import db
from config import Config
from routes.main import main_bp
from routes.auth import auth_bp
from routes.areas import areas_bp
from routes.services import services_bp
from routes.service_connections import connections_bp
from seed_data import seed_all
from scheduler import init_scheduler, shutdown_scheduler
import atexit
import os

time.sleep(5)  # need to wait for db service first

app = Flask(__name__)

app.config.from_object(Config)

# Initialize CORS with credentials support
CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

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
        'scope': 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive'
    } # Scope basically specifically asks for something during handshake
)

oauth.register(
    name='facebook',
    client_id=Config.FACEBOOK_CLIENT_ID,
    client_secret=Config.FACEBOOK_CLIENT_SECRET,
    authorize_url='https://www.facebook.com/v18.0/dialog/oauth',
    access_token_url='https://graph.facebook.com/v18.0/oauth/access_token',
    client_kwargs={
        'scope': 'email public_profile'
    }
)

oauth.register(
    name='github',
    client_id=Config.GITHUB_CLIENT_ID,
    client_secret=Config.GITHUB_CLIENT_SECRET,
    authorize_url='https://github.com/login/oauth/authorize',
    access_token_url='https://github.com/login/oauth/access_token',
    api_base_url='https://api.github.com/',
    client_kwargs={
        'scope': 'repo read:user user:email'
    }
)

oauth.register(
    name='spotify',
    client_id=Config.SPOTIFY_CLIENT_ID,
    client_secret=Config.SPOTIFY_CLIENT_SECRET,
    authorize_url='https://accounts.spotify.com/authorize',
    access_token_url='https://accounts.spotify.com/api/token',
    api_base_url='https://api.spotify.com/v1/',
    client_kwargs={
        'scope': 'user-read-playback-state user-modify-playback-state playlist-read-private playlist-modify-public playlist-modify-private user-library-read user-library-modify'
    }
)

# Initialize scheduler
init_scheduler(app)

# Register shutdown handler
atexit.register(shutdown_scheduler)

# blueprints
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(areas_bp)
app.register_blueprint(services_bp)
app.register_blueprint(connections_bp)

# Serve demo page
@app.route('/demo')
def demo():
    return send_from_directory('static', 'demo.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database tables initialized")
        seed_all()

    print("Starting Flask server on port 8080...")
    app.run(host='0.0.0.0', port=8080, debug=True)
