import { CalendarCheck2, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const dashboard =
    user?.role === "PATIENT" ? "/patient" :
    user?.role === "DOCTOR" ? "/doctor" :
    user?.role === "ADMIN" ? "/admin" : "/";

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={close}>
          <span className="brand-mark"><CalendarCheck2 size={20} /></span>
          <span>Sync<span>Slot</span></span>
        </Link>

        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>

        <nav className={`nav-links ${open ? "nav-open" : ""}`}>
          <Link className={location.pathname === "/doctors" ? "active" : ""} to="/doctors" onClick={close}>
            Find Doctors
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboard} onClick={close}>
                {user?.role === "ADMIN" ? "Admin Dashboard" : "Dashboard"}
              </Link>
              <button className="nav-logout" onClick={() => { logout(); close(); }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close}>Login</Link>
              <Link className="nav-cta" to="/register" onClick={close}>Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}