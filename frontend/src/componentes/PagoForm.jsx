import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPago, getCuentas, getGastos } from "../services/api.js";

function PagoForm({ gastoId, onPagoCreado }) {
  const [nombre, setNombre] = useState("");
  const [gasto, setGasto] = useState(null);
  const [montoParcial, setMontoParcial] = useState("");
  const [idCuenta, setIdCuenta] = useState("");
  const [tipo, setTipo] = useState("manual");
  const [parcial, setParcial] = useState(false);
  const [intervalo, setIntervalo] = useState("30");
  const [fechaInicio, setFechaInicio] = useState("");
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getCuentas()
      .then(res => setCuentas(res.data))
      .catch(err => console.error("Error cargando cuentas:", err));

    // El monto a pagar se toma directo del gasto (lo que le falta por
    // pagar); solo se pide manualmente si se elige "pago parcial".
    getGastos()
      .then(res => {
        const g = res.data.find(x => String(x.id) === String(gastoId));
        setGasto(g || null);
      })
      .catch(err => console.error("Error cargando gasto:", err));
  }, [gastoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!gasto) {
      setError("No se pudo cargar la información del gasto");
      return;
    }

    const monto = parcial ? Number(montoParcial) : gasto.restante;

    try {
      const payload = {
        nombre,
        monto,
        id_gasto: Number(gastoId),
        id_cuenta: Number(idCuenta),
        tipo,
        parcial,
      };
      if (tipo === "automatico") {
        payload.intervalo = Number(intervalo);
        payload.fecha_inicio = fechaInicio;
      }

      await createPago(payload);
      if (onPagoCreado) onPagoCreado();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el pago");
    }
  };

  return (
    <div>
      <h2>Nuevo Pago</h2>

      {gasto && (
        <p>
          Gasto: <strong>{gasto.nombre}</strong> — Pendiente por pagar:{" "}
          <strong>${gasto.restante}</strong> de ${gasto.monto}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre / referencia del pago</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="parcial"
            checked={parcial}
            onChange={(e) => setParcial(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="parcial">
            Pago parcial (elegir un monto menor al pendiente)
          </label>
        </div>

        {/* El monto solo se pregunta si es un pago parcial; si no, se usa
            automáticamente lo que falta por pagar del gasto. */}
        {parcial && (
          <div className="mb-3">
            <label>Monto a pagar</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={montoParcial}
              onChange={(e) => setMontoParcial(e.target.value)}
              max={gasto?.restante}
              required
            />
          </div>
        )}

        <div className="mb-3">
          <label>Cuenta bancaria</label>
          <select
            className="form-select"
            value={idCuenta}
            onChange={(e) => setIdCuenta(e.target.value)}
            required
          >
            <option value="" disabled>Selecciona una cuenta</option>
            {cuentas.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre} (saldo: ${c.saldo})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Tipo de pago</label>
          <select
            className="form-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="manual">Manual</option>
            <option value="automatico">Automático</option>
          </select>
        </div>

        {tipo === "automatico" && (
          <>
            <div className="mb-3">
              <label>Intervalo (días)</label>
              <input
                type="number"
                className="form-control"
                value={intervalo}
                onChange={(e) => setIntervalo(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Fecha de inicio</label>
              <input
                type="date"
                className="form-control"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-success">
          Crear Pago
        </button>
      </form>
    </div>
  );
}

export default PagoForm;
