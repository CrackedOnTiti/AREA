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
