import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

// Chart.js v4 requiere registrar explícitamente cada elemento/escala que
// se va a usar (ArcElement para el Pie, CategoryScale/LinearScale/
// PointElement/LineElement para el Line). Sin esto, react-chartjs-2 falla
// con errores como "arc is not a registered element" o
// "category is not a registered scale".
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)