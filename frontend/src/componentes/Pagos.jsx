import { useEffect, useState } from "react";
import { getPagos, deletePago } from "../services/api.js";

function Pagos() {
  const [pagos, setPagos] = useState([]);

  const cargarPagos = () => {
    getPagos()
      .then(res => setPagos(res.data))
      .catch(err => console.error("Error cargando pagos:", err));
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const handleCancelar = async (id) => {
    try {
      await deletePago(id);
      cargarPagos();
    } catch (err) {
      console.error("Error cancelando pago:", err);
    }
  };

  return (
    <div>
      <h2>Pagos</h2>
      <ul>
        {pagos.map(p => (
          <li key={p.id}>
            {p.nombre} - ${p.monto} ({p.estado}, {p.tipo}) - {p.fecha_pago}
            {p.estado !== "cancelado" && (
              <button
                className="btn btn-danger btn-sm ms-2"
                onClick={() => handleCancelar(p.id)}
              >
                Cancelar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pagos;
