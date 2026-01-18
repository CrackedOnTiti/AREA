#!/usr/bin/env python3
from app import app, db
from seed_data import seed_all
from sqlalchemy import inspect

print("Initializing database...")

with app.app_context():
    # Check if tables already exist
    inspector = inspect(db.engine)
    existing_tables = inspector.get_table_names()

    if existing_tables:
        print(f"Database already initialized with {len(existing_tables)} tables. Skipping initialization.")
    else:
        db.create_all()
        print("Database tables created successfully")
        seed_all()
        print("Database seeding completed")
        print("Database initialization complete!")
