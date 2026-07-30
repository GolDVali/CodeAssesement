from flask import Blueprint, request, jsonify
from .models import Usuario, Gasto, Cuenta, Pago, PagoAutomatico
from datetime import date, timedelta
from .extensions import db
from flask_login import current_user, login_user, logout_user, login_required

main = Blueprint('main', __name__)


@main.route("/")
def index():
    return jsonify({
        "mensaje": "API de gastos y pagos activa",
        "login": "POST /auth/login",
        "logout": "POST /auth/logout"
    })


# Endpoint creación de usuarios
@main.route("/usuario", methods=["POST"])
def crear_usuario():
    data = request.get_json()

    nuevo_usuario = Usuario(
        nombre=data["nombre"],
        rol=data["rol"],
        correo=data["correo"],
        passw=data["passw"]
    )
    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({
        "mensaje": "Usuario creado exitosamente",
        "id": nuevo_usuario.id_usuario
    })


@main.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    usuario = Usuario.query.filter_by(correo=data["correo"]).first()
    if usuario and usuario.passw == data["passw"]:
        login_user(usuario)
        return jsonify({
            "mensaje": "Login exitoso",
            "usuario": {
                "id": usuario.id_usuario,
                "nombre": usuario.nombre,
                "rol": usuario.rol
            }
        })
    return jsonify({"error": "Credenciales inválidas"}), 401


@main.route("/auth/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"mensaje": "sesion cerrada con exito"})


# Endpoint para crear gasto
@main.route("/gasto", methods=["POST"])
@login_required
def crear_gasto():
    data = request.get_json()
    nuevo_gasto = Gasto(
        nombre=data["nombre"],
        fecha_creacion=date.today(),
        monto=data["monto"],
        # El estado inicial siempre es "pendiente": no se debe permitir que
        # el cliente cree un gasto ya "autorizado" saltándose el flujo de
        # aprobación.
        estado="pendiente",
        id_usuario=current_user.id_usuario
    )

    db.session.add(nuevo_gasto)
    db.session.commit()

    return jsonify({
        "mensaje": "Gasto creado exitosamente",
        "id": nuevo_gasto.id_gasto,
        "usuario": current_user.nombre
    })


@main.route("/gastos", methods=["GET"])
@login_required
def lista_gastos():
    gastos = Gasto.query.all()
    resultado = []
    for g in gastos:
        pagado = sum(float(p.monto) for p in g.pagos if p.estado in ("completo", "parcial"))
        resultado.append({
            "id": g.id_gasto,
            "nombre": g.nombre,
            "monto": float(g.monto),
            "pagado": pagado,
            "restante": float(g.monto) - pagado,
            "estado": g.estado,
            "fecha_creacion": g.fecha_creacion.isoformat(),
            # g.usuario es un objeto SQLAlchemy y no es serializable a JSON
            # directamente; se expone solo el nombre.
            "usuario": g.usuario.nombre
        })
    return jsonify(resultado)


@main.route("/gastos/<int:id_gasto>", methods=["DELETE"])
@login_required
def cancelar_gasto(id_gasto):
    gasto = Gasto.query.get(id_gasto)
    if not gasto:
        return jsonify({"error": "Gasto no encontrado"}), 404

    # Regla de negocio: un gasto cancelado no se reactiva, y uno ya pagado
    # tampoco debería poder cancelarse.
    if gasto.estado == "cancelado":
        return jsonify({"error": "El gasto ya está cancelado"}), 400
    if gasto.estado == "pagado":
        return jsonify({"error": "No se puede cancelar un gasto ya pagado"}), 400

    # Se marca como cancelado en lugar de borrarlo: borrar el registro
    # rompería la integridad referencial con los pagos existentes y haría
    # imposible aplicar la regla "gastos cancelados no se reactivan".
    gasto.estado = "cancelado"
    db.session.commit()
    return jsonify({"mensaje": "Gasto cancelado con exito", "id": gasto.id_gasto, "estado": gasto.estado})


@main.route("/gastos/<int:id_gasto>/autorizar", methods=["PUT"])
@login_required
def autorizar_gasto(id_gasto):
    gasto = Gasto.query.get(id_gasto)
    if not gasto:
        return jsonify({"error": "Gasto no encontrado"}), 404

    # Solo admin puede autorizar
    if current_user.rol != "admin":
        return jsonify({"error": "No tienes permisos para autorizar"}), 403

    # Un gasto cancelado no se reactiva ni se autoriza, y no tiene sentido
    # re-autorizar uno que ya está autorizado o pagado.
    if gasto.estado != "pendiente":
        return jsonify({"error": f"No se puede autorizar un gasto en estado '{gasto.estado}'"}), 400

    gasto.estado = "autorizado"
    db.session.commit()

    return jsonify({
        "mensaje": "Gasto autorizado con éxito",
        "id": gasto.id_gasto,
        "estado": gasto.estado
    })


@main.route("/cuenta", methods=["POST"])
@login_required
def crear_cuenta():
    data = request.get_json()
    nueva_cuenta = Cuenta(
        nombre=data["nombre"],
        saldo=data["saldo"]
    )
    db.session.add(nueva_cuenta)
    db.session.commit()
    return jsonify({"mensaje": "cuenta añadida", "id": nueva_cuenta.id_cuenta})


@main.route("/cuenta", methods=["GET"])
@login_required
def lista_cuentas():
    cuentas = Cuenta.query.all()
    return jsonify([{
        "id": c.id_cuenta,
        "nombre": c.nombre,
        "saldo": float(c.saldo)
    } for c in cuentas])


@main.route("/pago", methods=["POST"])
@login_required
def crear_pago():
    data = request.get_json()
    cuenta = Cuenta.query.get(data["id_cuenta"])
    gasto = Gasto.query.get(data["id_gasto"])

    if not cuenta:
        return jsonify({"error": "Cuenta no encontrada"}), 404
    if not gasto:
        return jsonify({"error": "Gasto no encontrado"}), 404

    # Regla: gasto debe estar aprobado antes de pagar
    if gasto.estado != "autorizado":
        return jsonify({"error": "El gasto debe estar autorizado antes de pagarse"}), 400

    # Regla: evitar pagos duplicados. Un gasto ya cubierto por completo
    # ("pagado") no puede volver a recibir pagos.
    if gasto.estado == "pagado":
        return jsonify({"error": "Este gasto ya fue pagado por completo"}), 400

    monto = data["monto"]
    if monto <= 0:
        return jsonify({"error": "El monto debe ser mayor a 0"}), 400

    # Evitar pagos duplicados: no permitir un pago con exactamente el mismo
    # monto y tipo sobre el mismo gasto el mismo día (doble clic / doble envío).
    duplicado = Pago.query.filter_by(
        id_gasto=gasto.id_gasto,
        monto=monto,
        tipo=data["tipo"],
        fecha_pago=date.today()
    ).first()
    if duplicado:
        return jsonify({"error": "Pago duplicado detectado para este gasto"}), 409

    # Cuánto le falta pagar al gasto (evita sobrepagar el gasto, no solo la cuenta)
    ya_pagado = sum(float(p.monto) for p in gasto.pagos if p.estado in ("completo", "parcial"))
    restante_gasto = float(gasto.monto) - ya_pagado
    if restante_gasto <= 0:
        return jsonify({"error": "Este gasto ya fue pagado por completo"}), 400

    if monto > restante_gasto:
        if data.get("parcial"):
            monto = restante_gasto
        else:
            return jsonify({"error": "El pago no puede exceder el monto pendiente del gasto"}), 400

    # Regla: el pago no puede exceder el saldo de la cuenta
    if float(cuenta.saldo) < monto:
        if data.get("parcial"):
            monto = float(cuenta.saldo)
        else:
            return jsonify({"error": "El pago no puede exceder el saldo de la cuenta"}), 400

    if monto <= 0:
        return jsonify({"error": "Saldo insuficiente para procesar el pago"}), 400

    estado = "parcial" if monto < restante_gasto else "completo"

    # Registro de pago
    nuevo_pago = Pago(
        nombre=data["nombre"],
        fecha_pago=date.today(),
        monto=monto,
        estado=estado,
        tipo=data["tipo"],
        id_gasto=gasto.id_gasto,
        id_cuenta=cuenta.id_cuenta
    )
    db.session.add(nuevo_pago)
    cuenta.saldo = float(cuenta.saldo) - monto

    if estado == "completo":
        gasto.estado = "pagado"

    if data["tipo"] == "automatico":
        nuevo_auto = PagoAutomatico(
            intervalo=data["intervalo"],
            monto=monto,
            estado="activo",
            fecha_inicio=data.get("fecha_inicio", date.today()),
            id_gasto=gasto.id_gasto
        )
        db.session.add(nuevo_auto)

    db.session.commit()
    return jsonify({
        "mensaje": "Pago registrado",
        "id": nuevo_pago.id_pago,
        "nombre": nuevo_pago.nombre,
        "estado": nuevo_pago.estado
    })


@main.route("/pago", methods=["GET"])
@login_required
def lista_pagos():
    pagos = Pago.query.all()
    resultado = []
    for p in pagos:
        info = {
            "id": p.id_pago,
            "nombre": p.nombre,
            "monto": float(p.monto),
            "estado": p.estado,
            "tipo": p.tipo,
            "fecha_pago": p.fecha_pago.isoformat()
        }
        if p.tipo == "automatico":
            auto = PagoAutomatico.query.filter_by(id_gasto=p.id_gasto).first()
            if auto:
                fecha_siguiente = auto.fecha_inicio + timedelta(days=auto.intervalo)
                info["intervalo"] = auto.intervalo
                info["fecha_siguiente"] = fecha_siguiente.isoformat()
        resultado.append(info)
    # Bug original: la función no retornaba `resultado`, por lo que este
    # endpoint siempre devolvía un error 500.
    return jsonify(resultado)


@main.route("/pago/<int:id_pago>", methods=["DELETE"])
@login_required
def cancelar_pago(id_pago):
    pago = Pago.query.get(id_pago)
    if not pago:
        return jsonify({"error": "Pago no encontrado"}), 404

    if pago.estado == "cancelado":
        return jsonify({"error": "El pago ya está cancelado"}), 400

    cuenta = Cuenta.query.get(pago.id_cuenta)
    gasto = Gasto.query.get(pago.id_gasto)

    # Al cancelar un pago se debe devolver el saldo a la cuenta; el código
    # original nunca lo hacía, así que el dinero descontado se perdía.
    if cuenta:
        cuenta.saldo = float(cuenta.saldo) + float(pago.monto)

    # Si el gasto ya se había marcado como "pagado" gracias a este pago,
    # regresa a "autorizado" para que pueda volver a pagarse.
    if gasto and gasto.estado == "pagado":
        gasto.estado = "autorizado"

    if pago.tipo == "automatico":
        PagoAutomatico.query.filter_by(id_gasto=pago.id_gasto).delete()

    # Se cancela el pago (se marca, no se borra el gasto asociado: el gasto
    # es una entidad independiente y no debe desaparecer al cancelar un pago).
    pago.estado = "cancelado"
    db.session.commit()

    return jsonify({"mensaje": "pago cancelado", "id": pago.id_pago, "estado": pago.estado})
