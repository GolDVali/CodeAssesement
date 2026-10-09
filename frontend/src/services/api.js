import axios from "axios";

// En producción se define VITE_API_URL en Vercel; en local usa Flask en :5000
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Instancia de axios que siempre envía cookies de sesión
const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Si el backend responde 401 (sesión expirada, servidor reiniciado, etc.)
// pero el frontend todavía cree que hay sesión activa (localStorage),
// limpiamos esa bandera y mandamos a login para evitar un estado
// inconsistente donde la UI deja pasar pero la API rechaza todo.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("usuario");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);
  // La cookie de sesión de Flask es HttpOnly y no se puede leer desde JS,
  // por lo que guardamos una bandera local para que las rutas protegidas
  // sepan que hay una sesión activa, junto con los datos del usuario
  // (nombre y rol) para poder mostrar acciones según el rol (p. ej. admin).
  localStorage.setItem("isAuthenticated", "true");
  if (res.data?.usuario) {
    localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
  }
  return res;
};

export const logout = async () => {
  const res = await axiosInstance.post("/auth/logout");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("usuario");
  return res;
};

export const getUsuarioActual = () => {
  const raw = localStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
};

//Usuario
export const createUsuario = (data) => axiosInstance.post("/usuario", data);

// Gastos
export const getGastos = () => axiosInstance.get("/gastos");
export const createGasto = (data) => axiosInstance.post("/gasto", data);
export const deleteGasto = (id) => axiosInstance.delete(`/gastos/${id}`);
export const autorizarGasto = (id) => axiosInstance.put(`/gastos/${id}/autorizar`);

// Cuentas
export const getCuentas = () => axiosInstance.get("/cuenta");
export const createCuenta = (data) => axiosInstance.post("/cuenta", data);

// Pagos
export const getPagos = () => axiosInstance.get("/pago");
export const createPago = (data) => axiosInstance.post("/pago", data);
export const deletePago = (id) => axiosInstance.delete(`/pago/${id}`);
