import time
from flask import Flask
time.sleep(5) # need to wait for db service first

app = Flask(__name__)

@app.route('/')
def index():
    return "Nibba"

@app.route('/about.json')
def about():
    return {
        "message": "about.json endpoint placeholder",
        "server": "running"
    }

if __name__ == '__main__':
    print("Starting Flask server on port 8080...")
    app.run(host='0.0.0.0', port=8080, debug=True)
