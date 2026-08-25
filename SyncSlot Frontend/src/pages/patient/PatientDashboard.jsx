import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CalendarX2, Clock3, Search, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyAppointments, cancelAppointment } from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import { formatDate, formatTime, statusClass } from "../../utils/format";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,setError]=useState("");

  const load = () => getMyAppointments().then(r=>setAppointments(r.data)).catch(e=>setError(e.response?.data?.message || "Could not load appointments.")).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const upcoming = useMemo(()=>appointments.filter(a=>a.status !== "CANCELLED" && new Date(`${a.appointmentDate}T${a.startTime}`) >= new Date()),[appointments]);
  const completed = appointments.filter(a=>a.status==="COMPLETED").length;
  const cancelled = appointments.filter(a=>a.status==="CANCELLED").length;

  const cancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try { await cancelAppointment(id); load(); } catch(e) { setError(e.response?.data?.message || "Could not cancel appointment."); }
  };

  return (
    <section className="page">
      <div className="dashboard-head">
        <div><span className="eyebrow">Patient dashboard</span><h1>Good to see you, {user?.name?.split(" ")[0]}.</h1><p>Keep track of your upcoming visits and appointment history.</p></div>
        <Link className="btn btn-primary" to="/doctors"><Search size={17}/> Find a doctor</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon"><CalendarCheck2 size={19}/></div><div><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming</div></div></div>
        <div className="stat-card"><div className="stat-icon"><Clock3 size={19}/></div><div><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon"><CalendarX2 size={19}/></div><div><div className="stat-value">{cancelled}</div><div className="stat-label">Cancelled</div></div></div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      <div className="section-heading compact"><div><span className="eyebrow">Schedule</span><h2>Upcoming appointments</h2></div></div>
      {loading ? <div className="center-loader"><Spinner/></div> :
        upcoming.length ? <div className="appointment-list">{upcoming.map(a=><AppointmentRow key={a.id} a={a} onCancel={cancel}/>)}</div> :
        <EmptyState title="No upcoming appointments" description="Find a doctor and book your next visit." />
      }

      <div className="section-heading compact history-heading"><div><span className="eyebrow">History</span><h2>Past appointments</h2></div></div>
      {!loading && <div className="appointment-list">{appointments.filter(a=>!upcoming.some(u=>u.id===a.id)).map(a=><AppointmentRow key={a.id} a={a}/>)}</div>}
    </section>
  );
}

function AppointmentRow({a,onCancel}) {
  return (
    <div className="appointment-row">
      <div className="appointment-date"><strong>{new Date(`${a.appointmentDate}T00:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat("en-IN",{month:"short"}).format(new Date(`${a.appointmentDate}T00:00:00`))}</span></div>
      <div className="appointment-info"><h3>Dr. {a.doctorName}</h3><p><Stethoscope size={14}/> {formatTime(a.startTime)} – {formatTime(a.endTime)}</p></div>
      <span className={statusClass(a.status)}>{a.status}</span>
      {a.status !== "CANCELLED" && a.status !== "COMPLETED" && onCancel && <button className="btn btn-danger-outline" onClick={()=>onCancel(a.id)}>Cancel</button>}
    </div>
  );
}