import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-cambiar-en-produccion")

    _database_url = os.environ.get("DATABASE_URL", "sqlite:///assesement.db")
    
    if _database_url.startswith("postgres://"):
        _database_url = _database_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _database_url

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

    
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = FRONTEND_ORIGIN.startswith("https")
