# Documentación de API REST — Sistema de Gastos y Pagos

**Base URL (desarrollo local):** `http://127.0.0.1:5000`
**Base URL (producción):** `<URL pública del backend desplegado>`

**Lenguajes / stack:** Python (Flask, Flask-SQLAlchemy, Flask-Login, Flask-Migrate, Flask-Cors) para el backend; JavaScript (React + Vite) para el frontend.

## Autenticación

La API usa **autenticación basada en sesión** (Flask-Login). El endpoint de login crea una cookie de sesión (`HttpOnly`) que el cliente debe enviar en cada request posterior (`credentials: include` / `withCredentials: true` en axios). No se usa autenticación por token (JWT/API key).

Todos los endpoints, salvo `/`, `/usuario` (registro) y `/auth/login`, requieren sesión activa. Si no hay sesión válida, responden `401 Unauthorized`.

---

## Índice de endpoints

| Método | Ruta | Descripción | Requiere sesión |
|---|---|---|---|
| GET | `/` | Info básica de la API | No |
| POST | `/usuario` | Crear usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/logout` | Cerrar sesión | Sí |
| POST | `/gasto` | Crear gasto | Sí |
| GET | `/gastos` | Listar gastos | Sí |
| DELETE | `/gastos/<id>` | Cancelar gasto | Sí |
| PUT | `/gastos/<id>/autorizar` | Autorizar gasto (solo admin) | Sí |
| POST | `/cuenta` | Crear cuenta bancaria | Sí |
| GET | `/cuenta` | Listar cuentas bancarias | Sí |
| POST | `/pago` | Registrar pago | Sí |
| GET | `/pago` | Listar pagos | Sí |
| DELETE | `/pago/<id>` | Cancelar pago | Sí |

---

## `GET /`

Endpoint informativo, sin autenticación.

**Respuesta 200:**
```json
{
  "mensaje": "API de gastos y pagos activa",
  "login": "POST /auth/login",
  "logout": "POST /auth/logout"
}
```

---

## `POST /usuario`

Crea un nuevo usuario del sistema.

**Body:**
```json
{
  "nombre": "Ana Pérez",
  "rol": "admin",
  "correo": "ana@empresa.com",
  "passw": "123456"
}
```
`rol` acepta `"admin"` (puede autorizar gastos) o cualquier otro valor para usuario estándar.

**Respuesta 200:**
```json
{ "mensaje": "Usuario creado exitosamente", "id": 1 }
```

**Respuesta 409** (correo ya registrado):
```json
{ "error": "El correo ya está registrado" }
```

---

## `POST /auth/login`

**Body:**
```json
{ "correo": "ana@empresa.com", "passw": "123456" }
```

**Respuesta 200:**
```json
{
  "mensaje": "Login exitoso",
  "usuario": { "id": 1, "nombre": "Ana Pérez", "rol": "admin" }
}
```

**Respuesta 401** (credenciales inválidas):
```json
{ "error": "Credenciales inválidas" }
```

---

## `POST /auth/logout`
*Requiere sesión.*

**Respuesta 200:**
```json
{ "mensaje": "sesion cerrada con exito" }
```

---

## `POST /gasto`
*Requiere sesión.*

Crea un gasto. Siempre se crea con `estado: "pendiente"` (el estado inicial no es configurable desde el cliente).

**Body:**
```json
{ "nombre": "Renta de oficina", "monto": 5000 }
```

**Respuesta 200:**
```json
{ "mensaje": "Gasto creado exitosamente", "id": 3, "usuario": "Ana Pérez" }
```

---

## `GET /gastos`
*Requiere sesión.*

Lista todos los gastos, incluyendo cuánto se ha pagado y cuánto falta.

**Respuesta 200:**
```json
[
  {
    "id": 3,
    "nombre": "Renta de oficina",
    "monto": 5000.0,
    "pagado": 2000.0,
    "restante": 3000.0,
    "estado": "autorizado",
    "fecha_creacion": "2026-07-29",
    "usuario": "Ana Pérez"
  }
]
```

`estado` puede ser: `pendiente`, `autorizado`, `cancelado`, `pagado`.

---

## `DELETE /gastos/<id_gasto>`
*Requiere sesión.*

Cancela un gasto (cambia su estado a `cancelado`; no borra el registro). No se puede cancelar un gasto ya cancelado ni uno ya pagado.

**Respuesta 200:**
```json
{ "mensaje": "Gasto cancelado con exito", "id": 3, "estado": "cancelado" }
```

**Respuesta 400** (ya cancelado / ya pagado):
```json
{ "error": "El gasto ya está cancelado" }
```

**Respuesta 404:**
```json
{ "error": "Gasto no encontrado" }
```

---

## `PUT /gastos/<id_gasto>/autorizar`
*Requiere sesión y rol `admin`.*

Autoriza un gasto que esté en estado `pendiente`.

**Respuesta 200:**
```json
{ "mensaje": "Gasto autorizado con éxito", "id": 3, "estado": "autorizado" }
```

**Respuesta 403** (no es admin):
```json
{ "error": "No tienes permisos para autorizar" }
```

**Respuesta 400** (no está pendiente):
```json
{ "error": "No se puede autorizar un gasto en estado 'cancelado'" }
```

---

## `POST /cuenta`
*Requiere sesión.*

Crea una cuenta bancaria.

**Body:**
```json
{ "nombre": "Cuenta principal BBVA", "saldo": 50000 }
```

**Respuesta 200:**
```json
{ "mensaje": "cuenta añadida", "id": 1 }
```

---

## `GET /cuenta`
*Requiere sesión.*

**Respuesta 200:**
```json
[
  { "id": 1, "nombre": "Cuenta principal BBVA", "saldo": 47000.0 }
]
```

---

## `POST /pago`
*Requiere sesión.*

Registra un pago sobre un gasto ya **autorizado**, descontando el monto de la cuenta bancaria indicada.

**Body (pago manual, completo):**
```json
{
  "nombre": "Pago renta julio",
  "monto": 5000,
  "id_gasto": 3,
  "id_cuenta": 1,
  "tipo": "manual",
  "parcial": false
}
```

**Body (pago automático):**
```json
{
  "nombre": "Pago renta recurrente",
  "monto": 5000,
  "id_gasto": 3,
  "id_cuenta": 1,
  "tipo": "automatico",
  "parcial": false,
  "intervalo": 30,
  "fecha_inicio": "2026-08-01"
}
```

Si `parcial: true` y el monto enviado excede el saldo disponible o el monto pendiente del gasto, el pago se ajusta automáticamente al máximo posible en vez de rechazarse.

**Reglas de negocio aplicadas:**
- El gasto debe estar `autorizado` (no se puede pagar un gasto `pendiente` o `cancelado`).
- El monto no puede exceder el saldo de la cuenta.
- El monto no puede exceder lo que falta por pagar del gasto.
- Se rechazan pagos duplicados (mismo gasto, mismo monto, mismo tipo, mismo día).
- Un gasto se marca `pagado` automáticamente cuando su saldo pendiente llega a 0.

**Respuesta 200:**
```json
{ "mensaje": "Pago registrado", "id": 7, "nombre": "Pago renta julio", "estado": "completo" }
```
`estado` del pago puede ser `parcial` o `completo`.

**Respuestas de error (400/404/409),** ejemplos:
```json
{ "error": "El gasto debe estar autorizado antes de pagarse" }
{ "error": "El pago no puede exceder el saldo de la cuenta" }
{ "error": "Pago duplicado detectado para este gasto" }
```

---

## `GET /pago`
*Requiere sesión.*

**Respuesta 200:**
```json
[
  {
    "id": 7,
    "nombre": "Pago renta julio",
    "monto": 5000.0,
    "estado": "completo",
    "tipo": "manual",
    "fecha_pago": "2026-07-29"
  },
  {
    "id": 8,
    "nombre": "Pago renta recurrente",
    "monto": 5000.0,
    "estado": "completo",
    "tipo": "automatico",
    "fecha_pago": "2026-07-29",
    "intervalo": 30,
    "fecha_siguiente": "2026-08-31"
  }
]
```

---

## `DELETE /pago/<id_pago>`
*Requiere sesión.*

Cancela un pago: devuelve el monto a la cuenta bancaria y, si el gasto asociado estaba marcado como `pagado` gracias a este pago, lo regresa a `autorizado`.

**Respuesta 200:**
```json
{ "mensaje": "pago cancelado", "id": 7, "estado": "cancelado" }
```

---

## Modelo de datos (resumen)

- **Usuario**: id_usuario, nombre, rol, correo, passw
- **Gasto**: id_gasto, nombre, monto, estado (pendiente/autorizado/cancelado/pagado), fecha_creacion, id_usuario
- **Cuenta**: id_cuenta, nombre, saldo
- **Pago**: id_pago, nombre, monto, estado (parcial/completo/cancelado), tipo (manual/automatico), fecha_pago, id_gasto, id_cuenta
- **PagoAutomatico**: id_automatico, intervalo (días), monto, estado, fecha_inicio, id_gasto

(Ver diagrama de base de datos adjunto para las relaciones completas.)
