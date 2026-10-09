import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPago, getCuentas, getGastos } from "../services/api.js";
import { moneda, hoyISO } from "../utils/formato";
import Badge from "./Badge";

function PagoForm({ gastoId, onPagoCreado }) {
  const [nombre, setNombre] = useState("");
  const [gasto, setGasto] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [montoParcial, setMontoParcial] = useState("");
  const [idCuenta, setIdCuenta] = useState("");
  const [tipo, setTipo] = useState("manual");
  const [parcial, setParcial] = useState(false);
  const [intervalo, setIntervalo] = useState("30");
  const [fechaInicio, setFechaInicio] = useState(hoyISO());
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;
    Promise.all([getCuentas(), getGastos()])
      .then(([c, g]) => {
        if (!activo) return;
        setCuentas(c.data);
        const encontrado = g.data.find((x) => String(x.id) === String(gastoId)) || null;
        setGasto(encontrado);
        if (encontrado) setNombre((prev) => prev || `Pago - ${encontrado.nombre}`);
      })
      .catch(() => {
        if (activo) setError("No se pudo cargar la información del gasto.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [gastoId]);

  if (cargando) {
    return (
      <div className="loading" style={{ padding: "40px 0" }}>
        <span className="spinner" />
        Cargando...
      </div>
    );
  }

  if (!gasto) {
    return (
      <>
        <div className="alert alert-error">{error || "No se encontró el gasto."}</div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
            Volver
          </button>
        </div>
      </>
    );
  }

  const pagable = gasto.estado === "autorizado";
  const pct = gasto.monto ? Math.min(100, (gasto.pagado / gasto.monto) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const monto = parcial ? Number(montoParcial) : gasto.restante;
    if (!(monto > 0)) {
      setError("El monto debe ser mayor a 0.");
      return;
    }
    if (monto > gasto.restante) {
      setError(`El monto no puede exceder lo pendiente (${moneda(gasto.restante)}).`);
      return;
    }

    setEnviando(true);
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
      setError(err.response?.data?.error || "No se pudo registrar el pago.");
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="summary">
        <div className="summary-title">
          {gasto.nombre} <Badge valor={gasto.estado} />
        </div>
        <div className="summary-grid">
          <div>
            <small>Monto del gasto</small>
            <strong>{moneda(gasto.monto)}</strong>
          </div>
          <div>
            <small>Pagado</small>
            <strong>{moneda(gasto.pagado)}</strong>
          </div>
          <div>
            <small>Pendiente</small>
            <strong>{moneda(gasto.restante)}</strong>
          </div>
        </div>
        <div className="progress">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      {!pagable && (
        <div className="alert alert-warn">
          Este gasto está «{gasto.estado}». Solo los gastos autorizados pueden pagarse.
        </div>
      )}

      <div className="field">
        <label htmlFor="p-nombre">Referencia del pago</label>
        <input
          id="p-nombre"
          type="text"
          className="input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="p-cuenta">Cuenta de origen</label>
        <select
          id="p-cuenta"
          className="select"
          value={idCuenta}
          onChange={(e) => setIdCuenta(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecciona una cuenta
          </option>
          {cuentas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} — {moneda(c.saldo)}
            </option>
          ))}
        </select>
        {cuentas.length === 0 && <p className="hint">Primero crea una cuenta bancaria desde el dashboard.</p>}
      </div>

      <label className="check-row">
        <input type="checkbox" checked={parcial} onChange={(e) => setParcial(e.target.checked)} />
        <div>
          <strong>Pago parcial</strong>
          <span>Paga solo una parte; el resto queda pendiente en el gasto.</span>
        </div>
      </label>

      {parcial ? (
        <div className="field">
          <label htmlFor="p-monto">Monto a pagar</label>
          <input
            id="p-monto"
            type="number"
            step="0.01"
            min="0.01"
            max={gasto.restante}
            className="input"
            placeholder="0.00"
            value={montoParcial}
            onChange={(e) => setMontoParcial(e.target.value)}
            required
          />
          <p className="hint">Máximo {moneda(gasto.restante)}.</p>
        </div>
      ) : (
        <p className="hint" style={{ marginTop: 0, marginBottom: 18 }}>
          Se pagará el total pendiente: <strong>{moneda(gasto.restante)}</strong>
        </p>
      )}

      <div className="field">
        <span className="label">Tipo de pago</span>
        <div className="segmented">
          <button type="button" className={tipo === "manual" ? "active" : ""} onClick={() => setTipo("manual")}>
            Manual
          </button>
          <button
            type="button"
            className={tipo === "automatico" ? "active" : ""}
            onClick={() => setTipo("automatico")}
          >
            Automático
          </button>
        </div>
      </div>

      {tipo === "automatico" && (
        <div className="field-row field">
          <div>
            <label htmlFor="p-intervalo">Repetir cada (días)</label>
            <input
              id="p-intervalo"
              type="number"
              min="1"
              className="input"
              value={intervalo}
              onChange={(e) => setIntervalo(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="p-fecha">Fecha de inicio</label>
            <input
              id="p-fecha"
              type="date"
              className="input"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-success" disabled={enviando || !pagable}>
          {enviando ? "Procesando..." : "Registrar pago"}
        </button>
      </div>
    </form>
  );
}

export default PagoForm;
