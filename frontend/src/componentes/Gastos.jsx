import { useEffect, useState } from "react";
import { getGastos, deleteGasto, autorizarGasto } from "../services/api.js";
import { useNavigate } from "react-router-dom";

function Gastos({ usuario }) {
  const [gastos, setGastos] = useState([]);
  const navigate = useNavigate();

  const cargarGastos = () => {
    getGastos()
      .then(res => setGastos(res.data))
      .catch(err => console.error("Error cargando gastos:", err));
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteGasto(id);
      cargarGastos();
    } catch (err) {
      console.error("Error eliminando gasto:", err);
    }
  };

  const handleAutorizar = async (id) => {
    try {
      await autorizarGasto(id);
      cargarGastos();
    } catch (err) {
      console.error("Error autorizando gasto:", err);
    }
  };

  return (
    <div>
      <h2>Gastos</h2>
      {/* Botón para registrar nuevo gasto */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/gasto/nuevo")}
      >
        Registrar nuevo gasto
      </button>

      <ul>
        {gastos.map(g => (
          <li key={g.id}>
            {g.nombre} - ${g.monto} ({g.estado})

            {/* Cancelar solo tiene sentido mientras el gasto no esté pagado ni ya cancelado */}
            {g.estado !== "pagado" && g.estado !== "cancelado" && (
              <button
                className="btn btn-danger btn-sm ms-2"
                onClick={() => handleDelete(g.id)}
              >
                Cancelar
              </button>
            )}

            {/* Si está autorizado y no pagado → generar pago */}
            {g.estado === "autorizado" && (
              <button
                className="btn btn-success btn-sm ms-2"
                onClick={() => navigate(`/pago/nuevo/${g.id}`)}
              >
                Generar Pago
              </button>
            )}

            {/* Si el usuario es admin y el gasto está pendiente → autorizar */}
            {usuario?.rol === "admin" && g.estado === "pendiente" && (
              <button
                className="btn btn-info btn-sm ms-2"
                onClick={() => handleAutorizar(g.id)}
              >
                Autorizar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Gastos;
