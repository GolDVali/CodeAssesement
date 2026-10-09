import { Link, useNavigate } from "react-router-dom";
import { logout, getUsuarioActual } from "../services/api";
import { iniciales } from "../utils/formato";
import Icon from "./Icon";

// Estructura común de las páginas protegidas: cabecera + título + contenido
function Layout({ titulo, subtitulo, acciones, volver, children }) {
  const navigate = useNavigate();
  const usuario = getUsuarioActual();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    } finally {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("usuario");
      navigate("/login");
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/dashboard" className="brand">
            <span className="brand-mark">
              <Icon name="dollar" size={20} />
            </span>
            Control de Gastos
          </Link>

          <div className="header-right">
            {usuario && (
              <div className="user-chip">
                <span className="avatar">{iniciales(usuario.nombre)}</span>
                <span className="user-meta">
                  <span className="user-name">{usuario.nombre}</span>
                  <span className="user-role">
                    {usuario.rol === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </span>
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} aria-label="Cerrar sesión">
              <Icon name="logout" size={16} />
              <span className="hide-sm">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        {(titulo || acciones) && (
          <div className="page-head">
            <div>
              {volver && (
                <Link to={volver} className="back-link">
                  <Icon name="arrow-left" size={16} />
                  Volver al dashboard
                </Link>
              )}
              {titulo && <h1>{titulo}</h1>}
              {subtitulo && <p className="page-sub">{subtitulo}</p>}
            </div>
            {acciones && <div className="page-actions">{acciones}</div>}
          </div>
        )}
        {children}
      </main>
    </>
  );
}

export default Layout;
