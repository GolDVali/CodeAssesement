import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCuenta } from "../services/api.js";

function CuentaForm({ onCuentaCreada }) {
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCuenta({ nombre, saldo });
      setNombre("");
      setSaldo("");
      if (onCuentaCreada) onCuentaCreada(); // refresca lista de cuentas
      navigate("/dashboard");
    } catch (err) {
      setError("Error al crear cuenta");
    }
  };

  return (
    <div>
      <h2>Nueva Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre de la cuenta</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Saldo inicial</label>
          <input
            type="number"
            className="form-control"
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">
          Crear Cuenta
        </button>
      </form>
    </div>
  );
}

export default CuentaForm;
