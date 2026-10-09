import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { login } from "../services/api";
import AuthShell from "../componentes/AuthShell";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      // Backend espera "correo" y "passw"
      await login({ correo: email, passw: password });
      // Recarga completa para que la app lea el usuario recién guardado
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Correo o contraseña incorrectos");
      setCargando(false);
    }
  };

  return (
    <AuthShell
      titulo="Bienvenido de nuevo"
      subtitulo="Inicia sesión para administrar tus gastos y pagos."
      pie={
        <>
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </>
      }
    >
      {location.state?.registrado && (
        <div className="alert alert-ok">Cuenta creada. Ya puedes iniciar sesión.</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="tu@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={cargando}>
          {cargando ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
