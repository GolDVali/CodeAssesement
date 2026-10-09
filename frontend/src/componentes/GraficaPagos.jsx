import { Line } from "react-chartjs-2";
import { moneda, fechaCorta } from "../utils/formato";
import Vacio from "./Vacio";

function GraficaPagos({ pagos }) {
  // Se suman los pagos vigentes (no cancelados) por fecha
  const porFecha = {};
  pagos
    .filter((p) => p.estado !== "cancelado")
    .forEach((p) => {
      porFecha[p.fecha_pago] = (porFecha[p.fecha_pago] || 0) + p.monto;
    });
  const fechas = Object.keys(porFecha).sort();

  const data = {
    labels: fechas.map((f) => fechaCorta(f)),
    datasets: [
      {
        label: "Pagado",
        data: fechas.map((f) => porFecha[f]),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: "#4f46e5",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${moneda(ctx.parsed.y)}` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `$${v}` },
        grid: { color: "#eef1f7" },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>Historial de pagos</h2>
      </div>
      <div className="card-body">
        {fechas.length === 0 ? (
          <Vacio titulo="Sin pagos" texto="Aquí verás cuánto has pagado por día." />
        ) : (
          <div className="chart-box">
            <Line data={data} options={options} />
          </div>
        )}
      </div>
    </section>
  );
}

export default GraficaPagos;
