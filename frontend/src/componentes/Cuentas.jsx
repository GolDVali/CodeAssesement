import { useEffect, useState } from "react";
import { getCuentas } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import CuentaForm from "./CuentaForm";

function Cuentas() {
  const [cuentas, setCuentas] = useState([]);
  const navigate = useNavigate();

  const cargarCuentas = () => {
    getCuentas()
      .then(res => setCuentas(res.data))
      .catch(err => console.error("Error cargando cuentas:", err));
  };

  useEffect(() => {
    cargarCuentas();
  }, []);

  return (
    <div>
      <h2>Cuentas</h2>
      {/* Botón para registrar nueva cuenta */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/cuenta/nueva")}
      >
        Registrar nueva cuenta
      </button>

      <ul>
        {cuentas.map(c => (
          <li key={c.id}>
            {c.nombre} - Saldo: ${c.saldo}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Cuentas;
