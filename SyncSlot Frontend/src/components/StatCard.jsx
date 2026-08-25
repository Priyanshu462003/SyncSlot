export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{Icon && <Icon size={19} />}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}