import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CalendarCheck2, UserCheck, Users, Plus } from "lucide-react";
import { createSpecialization, getAdminAppointments, getAdminDoctors, verifyDoctor } from "../../services/doctorService";
import Spinner from "../../components/Spinner";
import { formatDate, formatTime, statusClass } from "../../utils/format";

export default function AdminDashboard() {
  const [doctors,setDoctors]=useState([]); const [appointments,setAppointments]=useState([]);
  const [specialization,setSpecialization]=useState(""); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [message,setMessage]=useState("");
  const load=async()=>{setLoading(true);try{const [d,a]=await Promise.all([getAdminDoctors(),getAdminAppointments()]);setDoctors(d.data);setAppointments(a.data);}catch(e){setError(e.response?.data?.message||"Could not load admin data.");}finally{setLoading(false);}};
  useEffect(()=>{load()},[]);
  const verify=async(id)=>{try{await verifyDoctor(id);setMessage("Doctor verified.");load();}catch(e){setError(e.response?.data?.message||"Could not verify doctor.");}};
  const addSpec=async(e)=>{e.preventDefault();if(!specialization.trim())return;try{await createSpecialization(specialization.trim());setMessage("Specialization created.");setSpecialization("");}catch(e){setError(e.response?.data?.message||"Could not create specialization.");}};
  const verified=doctors.filter(d=>d.verified).length;
  return <section className="page">
    <div className="dashboard-head"><div><span className="eyebrow">Administration</span><h1>Platform overview</h1><p>Verify doctors and monitor appointments.</p></div></div>
    <div className="stats-grid"><div className="stat-card"><div className="stat-icon"><Users size={19}/></div><div><div className="stat-value">{doctors.length}</div><div className="stat-label">Doctors</div></div></div><div className="stat-card"><div className="stat-icon"><UserCheck size={19}/></div><div><div className="stat-value">{verified}</div><div className="stat-label">Verified</div></div></div><div className="stat-card"><div className="stat-icon"><CalendarCheck2 size={19}/></div><div><div className="stat-value">{appointments.length}</div><div className="stat-label">Appointments</div></div></div></div>
    {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-error">{error}</div>}
    <div className="admin-grid">
      <div className="form-card"><div className="card-heading"><div><h3>Add specialization</h3><p>Create a specialization doctors can select during registration.</p></div><Plus size={20}/></div><form className="inline-form" onSubmit={addSpec}><input value={specialization} onChange={e=>setSpecialization(e.target.value)} placeholder="e.g. Cardiology"/><button className="btn btn-primary">Add</button></form></div>
      <div className="table-wrap"><table><thead><tr><th>Doctor</th><th>Specialization</th><th>Status</th><th></th></tr></thead><tbody>{doctors.map(d=><tr key={d.doctorId}><td><strong>Dr. {d.name}</strong></td><td>{d.specialization||"—"}</td><td>{d.verified?<span className="status status-completed"><CheckCircle2 size={13}/> Verified</span>:<span className="status status-booked">Pending</span>}</td><td>{!d.verified&&<button className="btn btn-small btn-primary" onClick={()=>verify(d.doctorId)}>Verify</button>}</td></tr>)}</tbody></table></div>
    </div>
    <div className="section-heading compact history-heading"><div><span className="eyebrow">Monitoring</span><h2>All appointments</h2></div></div>
    {loading?<div className="center-loader"><Spinner/></div>:<div className="table-wrap"><table><thead><tr><th>Date</th><th>Doctor</th><th>Patient</th><th>Time</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td>{formatDate(a.appointmentDate)}</td><td>Dr. {a.doctorName}</td><td>{a.patientName}</td><td>{formatTime(a.startTime)}</td><td><span className={statusClass(a.status)}>{a.status}</span></td></tr>)}</tbody></table></div>}
  </section>;
}