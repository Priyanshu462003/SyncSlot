import api from "./api";

export const getDoctors = () => api.get("/doctors");
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const getAvailability = (id, date) =>
  api.get(`/doctors/${id}/availability`, { params: { date } });

export const setAvailability = (data) =>
  api.post("/doctor/availability", data);

export const getDoctorAppointments = () =>
  api.get("/doctor/appointments");

export const completeAppointment = (id) =>
  api.put(`/doctor/appointments/${id}/complete`);

export const getAdminDoctors = () => api.get("/admin/doctors");
export const verifyDoctor = (id) => api.put(`/admin/doctors/${id}/verify`);
export const getAdminAppointments = () => api.get("/admin/appointments");
export const createSpecialization = (name) =>
  api.post("/admin/specializations", { name });