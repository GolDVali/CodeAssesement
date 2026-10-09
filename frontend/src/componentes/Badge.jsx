import { etiqueta } from "../utils/formato";

// Muestra un estado (gasto/pago) o un tipo de pago con su color
function Badge({ valor }) {
  return <span className={`badge badge-${valor}`}>{etiqueta(valor)}</span>;
}

export default Badge;
