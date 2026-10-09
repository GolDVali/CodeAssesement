import Icon from "./Icon";

// Pantalla dividida para login y registro
function AuthShell({ titulo, subtitulo, pie, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="brand brand-light">
          <span className="brand-mark">
            <Icon name="dollar" size={20} />
          </span>
          Control de Gastos
        </div>

        <div className="auth-hero">
          <h2>Los gastos y pagos de tu empresa, bajo control.</h2>
          <p>
            Registra, aprueba y paga con reglas claras, y mantén el balance de tus
            cuentas bancarias siempre al día.
          </p>
          <ul className="auth-features">
            <li>
              <Icon name="check-circle" /> Flujo de aprobación de gastos
            </li>
            <li>
              <Icon name="check-circle" /> Pagos parciales y automáticos
            </li>
            <li>
              <Icon name="check-circle" /> Balance de cuentas en tiempo real
            </li>
          </ul>
        </div>

        <small>Sistema de Control de Gastos</small>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="brand auth-mobile-brand">
            <span className="brand-mark">
              <Icon name="dollar" size={20} />
            </span>
            Control de Gastos
          </div>
          <h1>{titulo}</h1>
          <p className="auth-sub">{subtitulo}</p>
          {children}
          {pie && <p className="auth-foot">{pie}</p>}
        </div>
      </main>
    </div>
  );
}

export default AuthShell;
