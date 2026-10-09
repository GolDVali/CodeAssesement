import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGasto } from "../services/api.js";

function GastoForm({ onGastoCreado }) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      // El estado inicial siempre lo define el backend ("pendiente")
      await createGasto({ nombre, monto });
      if (onGastoCreado) onGastoCreado();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear el gasto.");
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="g-nombre">Concepto del gasto</label>
        <input
          id="g-nombre"
          type="text"
          className="input"
          placeholder="Ej. Renta de oficina"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="g-monto">Monto</label>
        <input
          id="g-monto"
          type="number"
          step="0.01"
          min="0.01"
          className="input"
          placeholder="0.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
        <p className="hint">El gasto se crea como pendiente hasta que un administrador lo autorice.</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Guardando..." : "Crear gasto"}
        </button>
      </div>
    </form>
  );
}

export default GastoForm;
