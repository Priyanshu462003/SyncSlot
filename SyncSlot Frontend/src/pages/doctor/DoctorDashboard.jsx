import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CalendarClock, CheckCircle2, Users, Clock3 } from "lucide-react";
import { completeAppointment, getDoctorAppointments } from "../../services/doctorService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";
import { formatDate, formatTime, statusClass } from "../../utils/format";
import { Link } from "react-router-dom";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments,setAppointments]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  const load=()=>getDoctorAppointments().then(r=>setAppointments(r.data)).catch(e=>setError(e.response?.data?.message || "Could not load appointments.")).finally(()=>setLoading(false));
  useEffect(()=>{load()},[]);

  const today=new Date().toISOString().slice(0,10);
  const todayAppointments=appointments.filter(a=>a.appointmentDate===today);
  const completed=appointments.filter(a=>a.status==="COMPLETED").length;
  const pending=appointments.filter(a=>a.status==="BOOKED").length;
  const patients=new Set(appointments.map(a=>a.patientId)).size;

  const markComplete=async(id)=>{
    try{await completeAppointment(id);load();}catch(e){setError(e.response?.data?.message || "Could not complete appointment.");}
  };

  return (
    <section className="page">
      <div className="dashboard-head">
        <div><span className="eyebrow">Doctor workspace</span><h1>Welcome, Dr. {user?.name}.</h1><p>Your appointments and schedule at a glance.</p></div>
        <Link className="btn btn-secondary" to="/doctor/availability"><CalendarClock size={17}/> Manage availability</Link>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon"><CalendarCheck2 size={19}/></div><div><div className="stat-value">{todayAppointments.length}</div><div className="stat-label">Today's visits</div></div></div>
        <div className="stat-card"><div className="stat-icon"><Clock3 size={19}/></div><div><div className="stat-value">{pending}</div><div className="stat-label">Pending</div></div></div>
        <div className="stat-card"><div className="stat-icon"><CheckCircle2 size={19}/></div><div><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon"><Users size={19}/></div><div><div className="stat-value">{patients}</div><div className="stat-label">Patients served</div></div></div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      <div className="section-heading compact"><div><span className="eyebrow">Today</span><h2>Appointments</h2></div></div>
      {loading ? <div className="center-loader"><Spinner/></div> : (
        <div className="appointment-list">
          {todayAppointments.length ? todayAppointments.map(a=>(
            <div className="appointment-row" key={a.id}>
              <div className="appointment-date"><strong>{formatTime(a.startTime)}</strong><span>{formatTime(a.endTime)}</span></div>
              <div className="appointment-info"><h3>{a.patientName}</h3><p>Appointment #{a.id}</p></div>
              <span className={statusClass(a.status)}>{a.status}</span>
              {a.status==="BOOKED" && <button className="btn btn-primary btn-small" onClick={()=>markComplete(a.id)}>Complete</button>}
            </div>
          )) : <div className="empty-state"><h3>No appointments today</h3><p>Your schedule is clear.</p></div>}
        </div>
      )}

      <div className="section-heading compact history-heading"><div><span className="eyebrow">All appointments</span><h2>Recent activity</h2></div></div>
      {!loading && <div className="table-wrap"><table><thead><tr><th>Date</th><th>Patient</th><th>Time</th><th>Status</th></tr></thead><tbody>
        {appointments.slice().sort((a,b)=>`${b.appointmentDate}${b.startTime}`.localeCompare(`${a.appointmentDate}${a.startTime}`)).map(a=><tr key={a.id}><td>{formatDate(a.appointmentDate)}</td><td>{a.patientName}</td><td>{formatTime(a.startTime)}</td><td><span className={statusClass(a.status)}>{a.status}</span></td></tr>)}
      </tbody></table></div>}
    </section>
  );
}