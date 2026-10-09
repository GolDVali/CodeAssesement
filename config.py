import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-cambiar-en-produccion")

    _database_url = os.environ.get("DATABASE_URL", "sqlite:///assesement.db")
    # Render (y otros proveedores) a veces entregan la URL con el prefijo
    # antiguo "postgres://", pero SQLAlchemy 2.x solo acepta "postgresql://".
    # Además se especifica el driver "psycopg" (v3) explícitamente, porque
    # sin esto SQLAlchemy intenta usar psycopg2 por defecto.
    if _database_url.startswith("postgres://"):
        _database_url = _database_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif _database_url.startswith("postgresql://"):
        _database_url = _database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    SQLALCHEMY_DATABASE_URI = _database_url

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Origen(es) del frontend permitidos para CORS con cookies de sesión.
    # Se pueden pasar varios separados por coma, ej:
    # "http://localhost:5173,https://mi-frontend.vercel.app"
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

    # Necesario para que la cookie de sesión viaje entre dominios distintos
    # (frontend en Vercel, backend en Render).
    # SESSION_COOKIE_SECURE solo se activa si el frontend es https
    # (producción); en local (http://localhost) se desactiva.
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = FRONTEND_ORIGIN.startswith("https")
