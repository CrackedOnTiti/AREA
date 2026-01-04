# How to Contribute

## General Contribution Workflow

1. **Create an issue** describing the feature or bug
2. **Create a branch** from `dev` (not `main`)
3. **Make your changes** with clear, descriptive commits
4. **Create a Pull Request** to merge into `dev`
5. **Wait for review** and address any feedback

For technical documentation and API details, check the [MdBook documentation](https://crackedontiti.github.io/AREA/).

---

## Adding New Services, Actions, and Reactions

This guide explains how to extend the AREA platform with new services and their associated actions/reactions.

### 1. Add Service to Database Seed

Add your new service in `server/seed_data.py`:

```python
def seed_your_service():
    """Seed Your Service with actions and reactions"""

    # Check if service already exists
    existing = Service.query.filter_by(name='your_service').first()
    if existing:
        print("Your Service already exists")
        return

    # Create service
    your_service = Service(
        name='your_service',  # Internal name (lowercase, underscores)
        display_name='Your Service',  # User-facing name
        description='What your service does',
        requires_oauth=False,  # True if needs OAuth
        is_active=True
    )
    db.session.add(your_service)
    db.session.flush()  # Get the service ID

    # Add actions and reactions (see below)

    db.session.commit()
    print("Your Service seeded successfully")

# Add to seed_all()
def seed_all():
    seed_timer_service()
    seed_email_service()
    seed_gmail_service()
    seed_your_service()  # Add this line
```

### 2. Add Actions to Your Service

Actions are triggers that activate workflows. Add them in the same seed function:

```python
# Inside seed_your_service()

action = Action(
    service_id=your_service.id,
    name='your_action',  # Internal name
    display_name='Your Action',  # User-facing name
    description='When this happens...',
    config_schema={
        'type': 'object',
        'properties': {
            'parameter_name': {
                'type': 'string',
                'description': 'What this parameter does',
                'minLength': 1
            }
        },
        'required': ['parameter_name']
    }
)
db.session.add(action)
```

### 3. Add Reactions to Your Service

Reactions are tasks executed when actions trigger. Add them similarly:

```python
# Inside seed_your_service()

reaction = Reaction(
    service_id=your_service.id,
    name='your_reaction',  # Internal name
    display_name='Your Reaction',  # User-facing name
    description='Do something...',
    config_schema={
        'type': 'object',
        'properties': {
            'parameter_name': {
                'type': 'string',
                'description': 'What this parameter does'
            }
        },
        'required': ['parameter_name']
    }
)
db.session.add(reaction)
```

### 4. Implement Action Checker

Create a checker function in `server/scheduler.py`:

```python
def check_your_action(area: UserArea) -> dict:
    """Check if your action should trigger"""

    # Get configuration from area.action_config
    param = area.action_config.get('parameter_name')

    # Your logic to check if action should trigger
    if condition_is_met:
        return {
            'triggered': True,
            'data': {'info': 'Additional context'}
        }

    return {'triggered': False}
```

Then add it to the main scheduler loop:

```python
# In check_and_execute_workflows()
elif action.name == 'your_action':
    result = check_your_action(area)
    should_trigger = result.get('triggered', False)
```

### 5. Implement Reaction Executor

Create an executor function in `server/scheduler.py`:

```python
def execute_your_reaction(area: UserArea) -> dict:
    """Execute your reaction"""

    config = area.reaction_config
    param = config.get('parameter_name')

    try:
        # Your logic to execute the reaction
        # ...

        return {
            'success': True,
            'message': 'Action completed successfully'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
```

Then route to it in the executor:

```python
# In execute_reaction()
if reaction.name == 'your_reaction':
    return execute_your_reaction(area)
```

### 6. OAuth Services (Optional)

If your service requires OAuth, you need additional setup:

1. **Add OAuth route** in `server/routes/service_connections.py`:

```python
@connections_bp.route('/yourservice', methods=['GET', 'POST'])
def connect_yourservice():
    # Similar to connect_gmail()
    # Initiate OAuth flow
    pass

@connections_bp.route('/yourservice/callback', methods=['GET'])
def yourservice_callback():
    # Similar to gmail_callback()
    # Handle OAuth callback and store tokens
    pass
```

2. **Use stored tokens** in your action checker:

```python
from database.models import UserServiceConnection

connection = UserServiceConnection.query.filter_by(
    user_id=area.user_id,
    service_id=your_service.id
).first()

if not connection:
    return {'triggered': False, 'error': 'Service not connected'}

# Use connection.access_token for API calls
```

---

## Testing Your Changes

1. **Rebuild Docker** to apply database changes:
   ```bash
   docker-compose down # Add -v to empty data as well if needed
   docker-compose up --build
   ```

2. **Check if your service appears**:
   ```bash
   curl http://localhost:8080/api/services
   ```

3. **Create a workflow** using your new action/reaction

4. **Monitor scheduler logs** to verify triggers are working correctly

---

## Code Style

- Use descriptive variable names
- Add docstrings to functions
- Handle errors gracefully
- Follow existing patterns in the codebase

---

## Questions?

- Check the [MdBook documentation](https://crackedontiti.github.io/AREA/)
- Look at existing services (Timer, Email, Gmail) as examples
- Create an issue for help or clarification
