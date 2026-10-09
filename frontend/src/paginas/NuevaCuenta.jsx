import Layout from "../componentes/Layout";
import CuentaForm from "../componentes/CuentaForm";

function NuevaCuentaPage() {
  return (
    <Layout
      titulo="Nueva cuenta bancaria"
      subtitulo="Agrega una cuenta para llevar el balance y poder registrar pagos."
      volver="/dashboard"
    >
      <div className="card form-card">
        <div className="card-body">
          <CuentaForm />
        </div>
      </div>
    </Layout>
  );
}

export default NuevaCuentaPage;
