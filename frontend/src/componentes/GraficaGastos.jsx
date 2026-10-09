import { Doughnut } from "react-chartjs-2";
import Vacio from "./Vacio";

const ESTADOS = [
  { clave: "pendiente", etiqueta: "Pendiente", color: "#f59e0b" },
  { clave: "autorizado", etiqueta: "Autorizado", color: "#3b82f6" },
  { clave: "pagado", etiqueta: "Pagado", color: "#10b981" },
  { clave: "cancelado", etiqueta: "Cancelado", color: "#ef4444" },
];

function GraficaGastos({ gastos }) {
  const conteo = ESTADOS.map((e) => gastos.filter((g) => g.estado === e.clave).length);

  const data = {
    labels: ESTADOS.map((e) => e.etiqueta),
    datasets: [
      {
        data: conteo,
        backgroundColor: ESTADOS.map((e) => e.color),
        borderWidth: 3,
        borderColor: "#ffffff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 8, padding: 16 },
      },
    },
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>Distribución de gastos</h2>
      </div>
      <div className="card-body">
        {gastos.length === 0 ? (
          <Vacio titulo="Sin datos" texto="La gráfica aparecerá cuando registres gastos." />
        ) : (
          <div className="chart-box">
            <Doughnut data={data} options={options} />
          </div>
        )}
      </div>
    </section>
  );
}

export default GraficaGastos;
