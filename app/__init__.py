from flask_login import LoginManager
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .extensions import db
from config import Config

login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Habilita CORS con credenciales para que el frontend (otro origen/puerto)
    # pueda enviar y recibir la cookie de sesión de Flask-Login.
    origenes = [o.strip() for o in app.config["FRONTEND_ORIGIN"].split(",") if o.strip()]
    CORS(app, supports_credentials=True, origins=origenes)

    db.init_app(app)
    login_manager.init_app(app)
    Migrate(app, db)
    from . import models

    from .routes import main
    app.register_blueprint(main)

    return app


@login_manager.user_loader
def load_user(user_id):
    from .models import Usuario
    return Usuario.query.get(int(user_id))
