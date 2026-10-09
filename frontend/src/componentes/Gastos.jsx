import { useNavigate } from "react-router-dom";
import { deleteGasto, autorizarGasto } from "../services/api.js";
import { moneda, fechaCorta } from "../utils/formato";
import Badge from "./Badge";
import Vacio from "./Vacio";

function Gastos({ gastos, usuario, onActualizar }) {
  const navigate = useNavigate();
  const esAdmin = usuario?.rol === "admin";

  const handleCancelar = async (g) => {
    if (!window.confirm(`¿Cancelar el gasto "${g.nombre}"? Esta acción no se puede revertir.`)) return;
    try {
      await deleteGasto(g.id);
      onActualizar({ tipo: "ok", texto: `Gasto "${g.nombre}" cancelado.` });
    } catch (err) {
      onActualizar({ tipo: "error", texto: err.response?.data?.error || "No se pudo cancelar el gasto." });
    }
  };

  const handleAutorizar = async (g) => {
    try {
      await autorizarGasto(g.id);
      onActualizar({ tipo: "ok", texto: `Gasto "${g.nombre}" autorizado.` });
    } catch (err) {
      onActualizar({ tipo: "error", texto: err.response?.data?.error || "No se pudo autorizar el gasto." });
    }
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>Gastos</h2>
        <span className="count">{gastos.length}</span>
      </div>

      {gastos.length === 0 ? (
        <Vacio titulo="Aún no hay gastos" texto="Registra tu primer gasto para comenzar el flujo de aprobación y pago.">
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/gasto/nuevo")}>
            Nuevo gasto
          </button>
        </Vacio>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Gasto</th>
                <th className="num">Monto</th>
                <th>Pagado</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => {
                const pct = g.monto ? Math.min(100, (g.pagado / g.monto) * 100) : 0;
                return (
                  <tr key={g.id}>
                    <td className="td-title">
                      <div className="cell-main">{g.nombre}</div>
                      <div className="cell-sub">
                        {g.usuario} · {fechaCorta(g.fecha_creacion)}
                      </div>
                    </td>
                    <td className="num cell-main" data-label="Monto">{moneda(g.monto)}</td>
                    <td data-label="Pagado">
                      {g.estado === "cancelado" ? (
                        <span className="muted">—</span>
                      ) : (
                        <div className="cell-progress">
                          <div className="progress">
                            <span style={{ width: `${pct}%` }} />
                          </div>
                          <div className="progress-label">
                            {moneda(g.pagado)} · {Math.round(pct)}%
                          </div>
                        </div>
                      )}
                    </td>
                    <td data-label="Estado">
                      <Badge valor={g.estado} />
                    </td>
                    <td className="td-actions">
                      <div className="row-actions">
                        {g.estado === "pendiente" && esAdmin && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAutorizar(g)}>
                            Autorizar
                          </button>
                        )}
                        {g.estado === "autorizado" && (
                          <button className="btn btn-success btn-sm" onClick={() => navigate(`/pago/nuevo/${g.id}`)}>
                            Pagar
                          </button>
                        )}
                        {(g.estado === "pendiente" || g.estado === "autorizado") && (
                          <button className="btn btn-danger-ghost btn-sm" onClick={() => handleCancelar(g)}>
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Gastos;
