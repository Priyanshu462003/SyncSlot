export function formatTime(value) {
  if (!value) return "";
  return value.slice(0, 5);
}

export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function money(value) {
  if (value === null || value === undefined) return "Consultation fee not set";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function statusClass(status = "") {
  return `status status-${status.toLowerCase()}`;
}