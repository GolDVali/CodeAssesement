import { deletePago } from "../services/api.js";
import { moneda, fechaCorta } from "../utils/formato";
import Badge from "./Badge";
import Vacio from "./Vacio";

function Pagos({ pagos, onActualizar }) {
  const handleCancelar = async (p) => {
    if (!window.confirm(`¿Cancelar el pago "${p.nombre}"? El monto regresará a la cuenta.`)) return;
    try {
      await deletePago(p.id);
      onActualizar({ tipo: "ok", texto: `Pago "${p.nombre}" cancelado y saldo devuelto a la cuenta.` });
    } catch (err) {
      onActualizar({ tipo: "error", texto: err.response?.data?.error || "No se pudo cancelar el pago." });
    }
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>Pagos</h2>
        <span className="count">{pagos.length}</span>
      </div>

      {pagos.length === 0 ? (
        <Vacio titulo="Aún no hay pagos" texto="Los pagos aparecerán aquí cuando pagues un gasto autorizado." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pago</th>
                <th className="num">Monto</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Próximo pago</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td className="cell-main td-title">{p.nombre}</td>
                  <td className="num cell-main" data-label="Monto">{moneda(p.monto)}</td>
                  <td data-label="Tipo">
                    <Badge valor={p.tipo} />
                  </td>
                  <td data-label="Estado">
                    <Badge valor={p.estado} />
                  </td>
                  <td data-label="Fecha">{fechaCorta(p.fecha_pago)}</td>
                  <td data-label="Próximo pago">
                    {p.tipo === "automatico" && p.estado !== "cancelado" && p.fecha_siguiente ? (
                      <div className="cell-stack">
                        <div>{fechaCorta(p.fecha_siguiente)}</div>
                        <div className="cell-sub">cada {p.intervalo} días</div>
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="td-actions">
                    <div className="row-actions">
                      {p.estado !== "cancelado" && (
                        <button className="btn btn-danger-ghost btn-sm" onClick={() => handleCancelar(p)}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Pagos;
