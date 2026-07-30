import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Páginas
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import Dashboard from "./paginas/Dashboard";
import NuevoGasto from "./paginas/NuevoGasto";
import NuevaCuenta from "./paginas/NuevaCuenta";
import NuevoPago from "./paginas/NuevoPago";

// Componentes
import RutaProtegida from "./componentes/RutaProtegida";
import { getUsuarioActual } from "./services/api";

function App() {
  const usuario = getUsuarioActual();

  return (
    <Router>
      <Routes>
        {/* Raíz: redirige según si hay sesión activa */}
        <Route
          path="/"
          element={
            <Navigate to={usuario ? "/dashboard" : "/login"} replace />
          }
        />

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registro />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Dashboard usuario={usuario} />
            </RutaProtegida>
          }
        />
        <Route
          path="/gasto/nuevo"
          element={
            <RutaProtegida>
              <NuevoGasto />
            </RutaProtegida>
          }
        />
        <Route
          path="/cuenta/nueva"
          element={
            <RutaProtegida>
              <NuevaCuenta />
            </RutaProtegida>
          }
        />
        <Route
          path="/pago/nuevo/:gastoId"
          element={
            <RutaProtegida>
              <NuevoPago />
            </RutaProtegida>
          }
        />

        {/* Cualquier otra ruta desconocida -> raíz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;