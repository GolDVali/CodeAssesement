import { Pie } from "react-chartjs-2";

function GraficaGastos({ gastos }) {
  const estados = ["pendiente", "autorizado", "cancelado", "pagado"];
  const conteo = estados.map(e => gastos.filter(g => g.estado === e).length);

  const data = {
    labels: estados,
    datasets: [
      {
        data: conteo,
        backgroundColor: ["#f39c12", "#27ae60", "#c0392b", "#2980b9"],
      },
    ],
  };

  return (
    <div>
      <h3>Distribución de gastos</h3>
      <Pie data={data} />
    </div>
  );
}

export default GraficaGastos;
