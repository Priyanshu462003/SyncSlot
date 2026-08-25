import { useEffect, useMemo, useState } from "react";
import { Search, Stethoscope, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getDoctors } from "../services/doctorService";
import Spinner from "../components/Spinner";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoctors().then(r => setDoctors(r.data)).catch(e => setError(e.response?.data?.message || "Could not load doctors.")).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return doctors;
    return doctors.filter(d => `${d.name} ${d.specialization || ""}`.toLowerCase().includes(q));
  }, [doctors, query]);

  return (
    <section className="page">
      <div className="page-hero">
        <div>
          <span className="eyebrow">Doctor directory</span>
          <h1>Find the right doctor.</h1>
          <p>Browse verified doctors and check their live availability.</p>
        </div>
        <div className="search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or specialty..." /></div>
      </div>

      {loading && <div className="center-loader"><Spinner /></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="doctor-grid">
          {filtered.map(d => (
            <article className="doctor-card" key={d.doctorId}>
              <div className="doctor-card-top">
                <div className="doctor-avatar"><Stethoscope size={26}/></div>
                <span className="verified">✓ Verified</span>
              </div>
              <h3>Dr. {d.name}</h3>
              <p className="specialty">{d.specialization || "General Medicine"}</p>
              <p className="bio">{d.bio || "Experienced healthcare professional available for appointments."}</p>
              <div className="doctor-card-bottom">
                <strong>{d.consultationFee != null ? `₹${Number(d.consultationFee).toLocaleString("en-IN")}` : "Fee not set"}</strong>
                <Link className="text-link" to={`/doctors/${d.doctorId}`}>View profile <ArrowRight size={15}/></Link>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !filtered.length && <div className="empty-state"><h3>No doctors found</h3><p>Try another name or specialty.</p></div>}
    </section>
  );
}