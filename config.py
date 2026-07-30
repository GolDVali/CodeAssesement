import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-cambiar-en-produccion")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///assesement.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Origen(es) del frontend permitidos para CORS con cookies de sesión.
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

    # Necesario para que la cookie de sesión viaje entre dominios distintos debido a inicio de sesión con cookies
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = FRONTEND_ORIGIN.startswith("https")
