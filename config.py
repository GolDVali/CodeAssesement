import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-cambiar-en-produccion")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///assesement.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Origen del frontend (Vite) permitido para CORS con cookies de sesión
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
