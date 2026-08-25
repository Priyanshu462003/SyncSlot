import api from "./api";

export const bookAppointment = (data) => api.post("/appointments", data);
export const getMyAppointments = () => api.get("/appointments/me");
export const cancelAppointment = (id) => api.delete(`/appointments/${id}`);