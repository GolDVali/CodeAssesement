import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGastos, getCuentas, getPagos } from "../services/api";
import { moneda } from "../utils/formato";
import Layout from "../componentes/Layout";
import Icon from "../componentes/Icon";
import Gastos from "../componentes/Gastos";
import Cuentas from "../componentes/Cuentas";
import Pagos from "../componentes/Pagos";
import GraficaGastos from "../componentes/GraficaGastos";
import GraficaPagos from "../componentes/GraficaPagos";

function Dashboard({ usuario }) {
  const [gastos, setGastos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);
  // En móvil el dashboard se divide en pestañas; en escritorio se ve todo junto
  const [vista, setVista] = useState("gastos");
  const navigate = useNavigate();

  const cargar = useCallback(async () => {
    try {
      const [g, c, p] = await Promise.all([getGastos(), getCuentas(), getPagos()]);
      setGastos([...g.data].sort((a, b) => b.id - a.id));
      setCuentas(c.data);
      setPagos([...p.data].sort((a, b) => b.id - a.id));
    } catch (err) {
      setAviso({ tipo: "error", texto: "No se pudo cargar la información. Intenta recargar la página." });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Los componentes hijos avisan aquí tras cancelar/autorizar algo
  const handleActualizar = (nuevoAviso) => {
    setAviso(nuevoAviso);
    cargar();
  };

  const saldoTotal = cuentas.reduce((s, c) => s + c.saldo, 0);
  const autorizados = gastos.filter((g) => g.estado === "autorizado");
  const porPagar = autorizados.reduce((s, g) => s + g.restante, 0);
  const pendientes = gastos.filter((g) => g.estado === "pendiente").length;
  const totalPagado = pagos.filter((p) => p.estado !== "cancelado").reduce((s, p) => s + p.monto, 0);

  const primerNombre = usuario?.nombre?.split(" ")[0];
  const seccion = (clave) => `seccion ${vista === clave ? "activa" : ""}`;

  return (
    <Layout
      titulo={primerNombre ? `Hola, ${primerNombre}` : "Dashboard"}
      subtitulo="Resumen de tus gastos, pagos y cuentas."
      acciones={
        <>
          <button className="btn btn-ghost" onClick={() => navigate("/cuenta/nueva")}>
            <Icon name="credit-card" size={16} />
            Nueva cuenta
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/gasto/nuevo")}>
            <Icon name="plus" size={16} />
            Nuevo gasto
          </button>
        </>
      }
    >
      {aviso && (
        <div className={`alert ${aviso.tipo === "ok" ? "alert-ok" : "alert-error"}`}>
          <span>{aviso.texto}</span>
          <button className="alert-close" onClick={() => setAviso(null)} aria-label="Cerrar aviso">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {cargando ? (
        <div className="loading">
          <span className="spinner" />
          Cargando información...
        </div>
      ) : (
        <>
          <div className="stats">
            <div className="stat">
              <span className="stat-icon tone-primary">
                <Icon name="credit-card" size={22} />
              </span>
              <div>
                <div className="stat-label">Saldo en cuentas</div>
                <div className="stat-value">{moneda(saldoTotal)}</div>
                <div className="stat-sub">{cuentas.length} cuenta(s)</div>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon tone-info">
                <Icon name="dollar" size={22} />
              </span>
              <div>
                <div className="stat-label">Por pagar</div>
                <div className="stat-value">{moneda(porPagar)}</div>
                <div className="stat-sub">{autorizados.length} gasto(s) autorizado(s)</div>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon tone-warning">
                <Icon name="clock" size={22} />
              </span>
              <div>
                <div className="stat-label">Pendientes de aprobar</div>
                <div className="stat-value">{pendientes}</div>
                <div className="stat-sub">esperan autorización</div>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon tone-success">
                <Icon name="trending" size={22} />
              </span>
              <div>
                <div className="stat-label">Total pagado</div>
                <div className="stat-value">{moneda(totalPagado)}</div>
                <div className="stat-sub">pagos vigentes</div>
              </div>
            </div>
          </div>

          <div className="tabs" role="tablist">
            {[
              ["gastos", "Gastos", gastos.length],
              ["pagos", "Pagos", pagos.length],
              ["cuentas", "Cuentas", cuentas.length],
            ].map(([clave, texto, total]) => (
              <button
                key={clave}
                role="tab"
                aria-selected={vista === clave}
                className={vista === clave ? "active" : ""}
                onClick={() => setVista(clave)}
              >
                {texto} <span className="tab-count">{total}</span>
              </button>
            ))}
          </div>

          <div className="grid-2">
            <div className={seccion("gastos")}>
              <Gastos gastos={gastos} usuario={usuario} onActualizar={handleActualizar} />
            </div>
            <div className="stack">
              <div className={seccion("cuentas")}>
                <Cuentas cuentas={cuentas} />
              </div>
              <div className={seccion("gastos")}>
                <GraficaGastos gastos={gastos} />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className={seccion("pagos")}>
              <Pagos pagos={pagos} onActualizar={handleActualizar} />
            </div>
            <div className={seccion("pagos")}>
              <GraficaPagos pagos={pagos} />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default Dashboard;
