const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export const moneda = (n) => mxn.format(Number(n) || 0);

export const fechaCorta = (iso) => {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

// Fecha local de hoy en formato YYYY-MM-DD (para inputs type="date")
export const hoyISO = () => new Date().toLocaleDateString("en-CA");

export const iniciales = (nombre = "") =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";

export const etiqueta = (s = "") => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
