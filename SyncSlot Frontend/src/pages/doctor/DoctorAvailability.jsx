import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { setAvailability } from "../../services/doctorService";
import Spinner from "../../components/Spinner";

export default function DoctorAvailability() {
  const [form,setForm]=useState({dayOfWeek:"MONDAY",startTime:"09:00",endTime:"17:00",slotDurationMinutes:30});
  const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const submit=async(e)=>{
    e.preventDefault();setMessage("");setError("");setLoading(true);
    try{await setAvailability({...form,slotDurationMinutes:Number(form.slotDurationMinutes)});setMessage("Availability saved successfully.");}
    catch(e){setError(e.response?.data?.message || "Could not save availability.");}
    finally{setLoading(false);}
  };
  return <section className="page narrow-page">
    <div className="page-title"><span className="eyebrow">Doctor settings</span><h1>Manage availability</h1><p>Define your weekly working hours and appointment duration.</p></div>
    <div className="form-card">
      {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-error">{error}</div>}
      <form className="form" onSubmit={submit}>
        <label>Day of week<select value={form.dayOfWeek} onChange={e=>setForm({...form,dayOfWeek:e.target.value})}>{["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"].map(d=><option key={d}>{d}</option>)}</select></label>
        <div className="form-grid"><label>Start time<input type="time" required value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/></label><label>End time<input type="time" required value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})}/></label></div>
        <label>Slot duration<select value={form.slotDurationMinutes} onChange={e=>setForm({...form,slotDurationMinutes:e.target.value})}><option value="15">15 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select></label>
        <button className="btn btn-primary" disabled={loading}>{loading?<Spinner small/>:<><CalendarClock size={17}/> Save availability</>}</button>
      </form>
    </div>
  </section>;
}