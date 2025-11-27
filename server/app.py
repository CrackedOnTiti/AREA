import time
from flask import Flask
from database.models import db
from config import Config
from routes.main import main_bp
from routes.auth import auth_bp

time.sleep(5)  # need to wait for db service first

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)

# create tables (basically mkdir -p)
with app.app_context():
    db.create_all()
    print("Database tables initialized")

# blueprints
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    print("Starting Flask server on port 8080...")
    app.run(host='0.0.0.0', port=8080, debug=True)
