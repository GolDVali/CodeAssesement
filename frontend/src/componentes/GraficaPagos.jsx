import { Line } from "react-chartjs-2";

function GraficaPagos({ pagos }) {
  const data = {
    labels: pagos.map(p => p.fecha_pago),
    datasets: [
      {
        label: "Monto de pagos",
        data: pagos.map(p => p.monto),
        borderColor: "#2ecc71",
        fill: false,
      },
    ],
  };

  return (
    <div>
      <h3>Historial de pagos</h3>
      <Line data={data} />
    </div>
  );
}

export default GraficaPagos;
