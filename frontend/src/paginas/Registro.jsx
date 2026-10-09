import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUsuario } from "../services/api";
import AuthShell from "../componentes/AuthShell";

function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("user");
  const [correo, setCorreo] = useState("");
  const [passw, setPassw] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await createUsuario({ nombre, rol, correo, passw });
      navigate("/login", { state: { registrado: true } });
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear la cuenta. Inténtalo de nuevo.");
      setCargando(false);
    }
  };

  return (
    <AuthShell
      titulo="Crea tu cuenta"
      subtitulo="Regístrate para empezar a controlar gastos y pagos."
      pie={
        <>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            className="input"
            placeholder="Tu nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="rol">Rol</label>
          <select id="rol" className="select" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          <p className="hint">Solo los administradores pueden autorizar gastos.</p>
        </div>
        <div className="field">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            className="input"
            placeholder="tu@empresa.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="passw">Contraseña</label>
          <input
            id="passw"
            type="password"
            className="input"
            placeholder="••••••••"
            value={passw}
            onChange={(e) => setPassw(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={cargando}>
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
