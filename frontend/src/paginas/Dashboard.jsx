import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGastos, getCuentas, getPagos, logout } from "../services/api";
import Gastos from "../componentes/Gastos";
import Cuentas from "../componentes/Cuentas";
import Pagos from "../componentes/Pagos";
import GraficaGastos from "../componentes/GraficaGastos";
import GraficaPagos from "../componentes/GraficaPagos";

function Dashboard({ usuario }) {
  const [gastos, setGastos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getGastos().then(res => setGastos(res.data));
    getCuentas().then(res => setCuentas(res.data));
    getPagos().then(res => setPagos(res.data));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center">
        <h1>Dashboard</h1>
        <button className="btn btn-outline-secondary" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Sección Gastos */}
      <div className="mb-5">
        <Gastos usuario={usuario} />
        <GraficaGastos gastos={gastos} />
      </div>

      {/* Sección Cuentas */}
      <div className="mb-5">
        <Cuentas />
      </div>

      {/* Sección Pagos */}
      <div className="mb-5">
        <Pagos />
        <GraficaPagos pagos={pagos} />
      </div>
    </div>
  );
}

export default Dashboard;
