import { ArrowRight, CalendarCheck2, CheckCircle2, Clock3, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> Modern appointment scheduling</div>
          <h1>Healthcare scheduling that works <em>for everyone.</em></h1>
          <p className="hero-text">
            SyncSlot connects patients with verified doctors, makes availability visible,
            and keeps every appointment organized from booking to completion.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/doctors">
              Find a doctor <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-secondary btn-lg" to="/register">Create account</Link>
          </div>
          <div className="trust-row">
            <span><CheckCircle2 size={16} /> Verified doctors</span>
            <span><CheckCircle2 size={16} /> Secure JWT access</span>
            <span><CheckCircle2 size={16} /> Conflict-safe booking</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow" />
          <div className="hero-panel">
            <div className="hero-panel-head">
              <div>
                <span className="muted">Today</span>
                <h3>Your appointments</h3>
              </div>
              <span className="pill pill-green">Live schedule</span>
            </div>
            <div className="mini-appointment">
              <div className="mini-avatar">DS</div>
              <div className="mini-main"><strong>Dr. Sharma</strong><span>Cardiology</span></div>
              <div className="mini-time">10:30 AM</div>
            </div>
            <div className="mini-appointment">
              <div className="mini-avatar purple">AM</div>
              <div className="mini-main"><strong>Dr. Mehta</strong><span>Dermatology</span></div>
              <div className="mini-time">12:00 PM</div>
            </div>
            <div className="mini-appointment">
              <div className="mini-avatar orange">RK</div>
              <div className="mini-main"><strong>Dr. Kapoor</strong><span>General Medicine</span></div>
              <div className="mini-time">04:30 PM</div>
            </div>
            <div className="hero-card-footer"><Clock3 size={16} /> Slots update automatically</div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div><Stethoscope size={22} /><strong>Verified doctors</strong><span>Browse trusted profiles</span></div>
        <div><CalendarCheck2 size={22} /><strong>Smart scheduling</strong><span>See open slots instantly</span></div>
        <div><ShieldCheck size={22} /><strong>Secure access</strong><span>JWT & role-based security</span></div>
        <div><Users size={22} /><strong>Simple workflow</strong><span>One place for appointments</span></div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="eyebrow">How it works</span><h2>From search to appointment in minutes.</h2></div>
        </div>
        <div className="steps">
          <div className="step"><span>01</span><h3>Find a doctor</h3><p>Explore verified doctors and their specialties.</p></div>
          <div className="step"><span>02</span><h3>Choose a slot</h3><p>Pick an available date and time that suits you.</p></div>
          <div className="step"><span>03</span><h3>Book securely</h3><p>Confirm your appointment with a protected account.</p></div>
        </div>
      </section>
    </>
  );
}