import { CalendarDays } from "lucide-react";

export default function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><CalendarDays size={24} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}