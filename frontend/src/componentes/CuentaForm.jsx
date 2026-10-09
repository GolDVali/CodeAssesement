import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCuenta } from "../services/api.js";

function CuentaForm({ onCuentaCreada }) {
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await createCuenta({ nombre, saldo });
      if (onCuentaCreada) onCuentaCreada();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear la cuenta.");
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="c-nombre">Nombre de la cuenta</label>
        <input
          id="c-nombre"
          type="text"
          className="input"
          placeholder="Ej. Cuenta principal BBVA"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="c-saldo">Saldo inicial</label>
        <input
          id="c-saldo"
          type="number"
          step="0.01"
          min="0"
          className="input"
          placeholder="0.00"
          value={saldo}
          onChange={(e) => setSaldo(e.target.value)}
          required
        />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Guardando..." : "Crear cuenta"}
        </button>
      </div>
    </form>
  );
}

export default CuentaForm;
