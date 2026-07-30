import PagoForm from "../componentes/PagoForm";
import { useParams } from "react-router-dom";

function NuevoPagoPage() {
  const { gastoId } = useParams();

  return (
    <div className="container mt-5">
      <h2>Registrar nuevo pago</h2>
      <PagoForm gastoId={gastoId} />
    </div>
  );
}

export default NuevoPagoPage;
