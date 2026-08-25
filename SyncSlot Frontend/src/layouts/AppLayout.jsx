import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content"><Outlet /></main>
      <footer className="footer">
        <div>© {new Date().getFullYear()} SyncSlot</div>
        <div>Doctor appointment scheduling, simplified.</div>
      </footer>
    </div>
  );
}