import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGasto } from "../services/api.js";

function GastoForm({ onGastoCreado }) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // El estado inicial siempre lo define el backend ("pendiente"),
      // por eso aquí no se envía ni se permite elegir.
      await createGasto({ nombre, monto });
      setNombre("");
      setMonto("");
      if (onGastoCreado) onGastoCreado(); // refresca lista de gastos
      navigate("/dashboard");
    } catch (err) {
      setError("Error al crear gasto");
    }
  };

  return (
    <div>
      <h2>Nuevo Gasto</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Monto</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">
          Crear Gasto
        </button>
      </form>
    </div>
  );
}

export default GastoForm;
