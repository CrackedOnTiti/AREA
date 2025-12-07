import time
from database.models import Service


def get_about_json(request):
    """
    Generate the /about.json response as specified in the project requirements.
    """
    client_host = request.remote_addr # get client IP address
    current_time = int(time.time())
    services = Service.query.filter_by(is_active=True).all() # query all active services with their actions and reactions

    response = {
        "client": {
            "host": client_host
        },
        "server": {
            "current_time": current_time,
            "services": [service.to_dict() for service in services]
        }
    }

    return response