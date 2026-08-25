import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = location.state?.from || null;

  const useAdminDemo = () => {
    setForm({ email: "admin@syncslot.com", password: "Admin@12345" });
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      const fallback =
        data.role === "PATIENT" ? "/patient" :
        data.role === "DOCTOR" ? "/doctor" :
        data.role === "ADMIN" ? "/admin" : "/";
      navigate(destination || fallback, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-icon"><LockKeyhole size={22} /></div>
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in to SyncSlot</h1>
          <p>Manage appointments from one secure workspace.</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="form">
          <label>Email
            <div className="input-wrap"><Mail size={17} /><input type="email" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com" /></div>
          </label>
          <label>Password
            <div className="input-wrap"><LockKeyhole size={17} /><input type="password" required value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="••••••••" /></div>
          </label>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? <Spinner small /> : "Sign in"}</button>
        </form>
        <div className="admin-demo-card">
          <div className="admin-demo-icon"><ShieldCheck size={18} /></div>
          <div className="admin-demo-content">
            <strong>Admin access</strong>
            <span>Default demo account: admin@syncslot.com</span>
          </div>
          <button type="button" className="btn btn-small btn-secondary" onClick={useAdminDemo}>Use Admin</button>
        </div>
        <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}