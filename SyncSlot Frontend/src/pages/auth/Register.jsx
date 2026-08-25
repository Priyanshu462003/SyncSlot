import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, LockKeyhole, Stethoscope } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("PATIENT");
  const [form, setForm] = useState({ name:"", email:"", password:"", specializationId:"", bio:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm({...form, [key]: value});

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        ...(role === "DOCTOR" ? {
          specializationId: form.specializationId ? Number(form.specializationId) : null,
          bio: form.bio
        } : {})
      };
      const data = await register(payload);
      navigate(data.role === "DOCTOR" ? "/doctor" : "/patient", { replace:true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="auth-head">
          <div className="auth-icon"><UserRound size={22} /></div>
          <span className="eyebrow">Get started</span>
          <h1>Create your SyncSlot account</h1>
          <p>Choose your role and start using the scheduling platform.</p>
        </div>

        <div className="role-tabs">
          <button className={role === "PATIENT" ? "selected" : ""} onClick={() => setRole("PATIENT")} type="button">Patient</button>
          <button className={role === "DOCTOR" ? "selected" : ""} onClick={() => setRole("DOCTOR")} type="button">Doctor</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="form">
          <label>Full name
            <div className="input-wrap"><UserRound size={17} /><input required value={form.name} onChange={e => update("name",e.target.value)} placeholder="Your full name" /></div>
          </label>
          <label>Email
            <div className="input-wrap"><Mail size={17} /><input type="email" required value={form.email} onChange={e => update("email",e.target.value)} placeholder="you@example.com" /></div>
          </label>
          <label>Password
            <div className="input-wrap"><LockKeyhole size={17} /><input type="password" minLength={8} required value={form.password} onChange={e => update("password",e.target.value)} placeholder="Minimum 8 characters" /></div>
          </label>

          {role === "DOCTOR" && (
            <>
              <label>Specialization ID
                <div className="input-wrap"><Stethoscope size={17} /><input type="number" min="1" required value={form.specializationId} onChange={e => update("specializationId",e.target.value)} placeholder="Use an existing specialization ID" /></div>
                <small className="field-help">Ask the platform admin for the specialization ID.</small>
              </label>
              <label>Professional bio
                <textarea value={form.bio} onChange={e => update("bio",e.target.value)} rows="4" placeholder="Tell patients briefly about your experience." />
              </label>
            </>
          )}

          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? <Spinner small /> : `Create ${role === "DOCTOR" ? "doctor" : "patient"} account`}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}