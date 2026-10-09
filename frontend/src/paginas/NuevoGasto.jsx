import Layout from "../componentes/Layout";
import GastoForm from "../componentes/GastoForm";

function NuevoGastoPage() {
  return (
    <Layout
      titulo="Nuevo gasto"
      subtitulo="Registra un gasto para iniciar su flujo de aprobación."
      volver="/dashboard"
    >
      <div className="card form-card">
        <div className="card-body">
          <GastoForm />
        </div>
      </div>
    </Layout>
  );
}

export default NuevoGastoPage;
