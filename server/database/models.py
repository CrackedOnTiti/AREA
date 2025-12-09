from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for OAuth-only users
    oauth_provider = db.Column(db.String(50), nullable=True)  # 'google', 'facebook', or None for local auth
    oauth_provider_id = db.Column(db.String(255), nullable=True)  # Provider's user ID
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Ensure unique combination of oauth_provider and oauth_provider_id
    __table_args__ = (
        db.UniqueConstraint('oauth_provider', 'oauth_provider_id', name='unique_oauth_user'),
    )

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # Internal name: "gmail", "timer"
    display_name = db.Column(db.String(100), nullable=False)  # Display name: "Gmail", "Timer"
    description = db.Column(db.Text, nullable=True)
    requires_oauth = db.Column(db.Boolean, default=False, nullable=False)
    icon_url = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationships
    actions = db.relationship('Action', back_populates='service', lazy=True, cascade='all, delete-orphan')
    reactions = db.relationship('Reaction', back_populates='service', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Service {self.display_name}>'

    def to_dict(self):
        return {
            'name': self.name,
            'display_name': self.display_name,
            'description': self.description,
            'requires_oauth': self.requires_oauth,
            'icon_url': self.icon_url,
            'actions': [action.to_dict() for action in self.actions],
            'reactions': [reaction.to_dict() for reaction in self.reactions]
        }


class Action(db.Model):
    __tablename__ = 'actions'

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)  # Internal name: "new_email_received"
    display_name = db.Column(db.String(150), nullable=False)  # Display: "New email received"
    description = db.Column(db.Text, nullable=True)
    config_schema = db.Column(db.JSON, nullable=True)  # JSON schema for configuration

    # Relationships
    service = db.relationship('Service', back_populates='actions')

    def __repr__(self):
        return f'<Action {self.display_name}>'

    def to_dict(self):
        return {
            'name': self.name,
            'description': self.description
        }


class Reaction(db.Model):
    __tablename__ = 'reactions'

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)  # Internal name: "send_email"
    display_name = db.Column(db.String(150), nullable=False)  # Display: "Send an email"
    description = db.Column(db.Text, nullable=True)
    config_schema = db.Column(db.JSON, nullable=True)  # JSON schema for configuration

    # Relationships
    service = db.relationship('Service', back_populates='reactions')

    def __repr__(self):
        return f'<Reaction {self.display_name}>'

    def to_dict(self):
        return {
            'name': self.name,
            'description': self.description
        }


class UserArea(db.Model):
    """User-created workflows linking Actions to REActions"""
    __tablename__ = 'user_areas'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    action_id = db.Column(db.Integer, db.ForeignKey('actions.id'), nullable=False)
    reaction_id = db.Column(db.Integer, db.ForeignKey('reactions.id'), nullable=False)
    action_config = db.Column(db.JSON, nullable=False)  # e.g., {"time": "14:00"}
    reaction_config = db.Column(db.JSON, nullable=False)  # e.g., {"to": "user@email.com", "subject": "...", "body": "..."}
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_triggered = db.Column(db.DateTime, nullable=True)  # Prevent duplicates
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = db.relationship('User', backref='areas')
    action = db.relationship('Action')
    reaction = db.relationship('Reaction')

    def __repr__(self):
        return f'<UserArea {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'action': {
                'id': self.action_id,
                'name': self.action.name,
                'display_name': self.action.display_name,
                'service': self.action.service.display_name
            },
            'reaction': {
                'id': self.reaction_id,
                'name': self.reaction.name,
                'display_name': self.reaction.display_name,
                'service': self.reaction.service.display_name
            },
            'action_config': self.action_config,
            'reaction_config': self.reaction_config,
            'is_active': self.is_active,
            'last_triggered': self.last_triggered.isoformat() if self.last_triggered else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class WorkflowLog(db.Model):
    """Execution logs for workflow runs"""
    __tablename__ = 'workflow_logs'

    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('user_areas.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'success', 'failed', 'skipped'
    message = db.Column(db.Text, nullable=False)
    triggered_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    execution_time_ms = db.Column(db.Integer, nullable=True)  # Performance tracking

    # Relationships
    area = db.relationship('UserArea', backref='logs')

    def __repr__(self):
        return f'<WorkflowLog {self.id} - {self.status}>'

    def to_dict(self):
        return {
            'id': self.id,
            'area_id': self.area_id,
            'area_name': self.area.name if self.area else None,
            'status': self.status,
            'message': self.message,
            'triggered_at': self.triggered_at.isoformat(),
            'execution_time_ms': self.execution_time_ms
        }
