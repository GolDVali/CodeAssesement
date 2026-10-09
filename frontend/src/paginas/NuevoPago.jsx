import { useParams } from "react-router-dom";
import Layout from "../componentes/Layout";
import PagoForm from "../componentes/PagoForm";

function NuevoPagoPage() {
  const { gastoId } = useParams();

  return (
    <Layout
      titulo="Registrar pago"
      subtitulo="Paga el gasto completo o una parte de él desde una de tus cuentas."
      volver="/dashboard"
    >
      <div className="card form-card">
        <div className="card-body">
          <PagoForm gastoId={gastoId} />
        </div>
      </div>
    </Layout>
  );
}

export default NuevoPagoPage;
