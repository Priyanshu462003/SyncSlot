export default function Spinner({ small = false }) {
  return <span className={`spinner ${small ? "spinner-small" : ""}`} aria-label="Loading" />;
}