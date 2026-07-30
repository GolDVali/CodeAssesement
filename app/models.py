from flask_login import UserMixin
from .extensions import db

class Usuario(UserMixin, db.Model):
    __tablename__ = 'usuario'
    id_usuario = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    rol = db.Column(db.String(50), nullable=False)
    correo = db.Column(db.String(100), unique=True, nullable=False)
    passw = db.Column(db.String(255), nullable=False)

    gastos = db.relationship('Gasto', backref='usuario', lazy=True)

    # UserMixin.get_id() busca por defecto un atributo `id`, pero la
    # llave primaria de esta tabla se llama `id_usuario`. Sin este método,
    # login_user() falla con "No `id` attribute - override `get_id`".
    def get_id(self):
        return str(self.id_usuario)


class Cuenta(db.Model):
    __tablename__ = 'cuenta'
    id_cuenta = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    saldo = db.Column(db.Numeric(12,2), nullable=False)

    pagos = db.relationship('Pago', backref='cuenta', lazy=True)


class Gasto(db.Model):
    __tablename__ = 'gasto'
    id_gasto = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    fecha_creacion = db.Column(db.Date, nullable=False)
    monto = db.Column(db.Numeric(12,2), nullable=False)
    estado = db.Column(db.String(50), nullable=False)

    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)

    pagos = db.relationship('Pago', backref='gasto', lazy=True)
    pagos_automaticos = db.relationship('PagoAutomatico', backref='gasto', lazy=True)


class Pago(db.Model):
    __tablename__ = 'pago'
    id_pago = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100))
    fecha_pago = db.Column(db.Date, nullable=False)
    monto = db.Column(db.Numeric(12,2), nullable=False)
    estado = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.Enum('manual', 'automatico'), nullable=False)

    id_gasto = db.Column(db.Integer, db.ForeignKey('gasto.id_gasto'), nullable=False)
    id_cuenta = db.Column(db.Integer, db.ForeignKey('cuenta.id_cuenta'), nullable=False)


class PagoAutomatico(db.Model):
    __tablename__ = 'pagoautomatico'
    id_automatico = db.Column(db.Integer, primary_key=True, autoincrement=True)
    intervalo = db.Column(db.Integer, nullable=False)  # intervalo en días
    monto = db.Column(db.Numeric(12,2), nullable=False)
    estado = db.Column(db.String(50), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)

    id_gasto = db.Column(db.Integer, db.ForeignKey('gasto.id_gasto'), nullable=False)
