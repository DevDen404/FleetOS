import { useEffect, useState } from "react";
import { BellRing, ChevronRight, Clock3, Fuel, Wrench, Zap } from "lucide-react";
import "./Operations.css";

const fallbackAlerts = [
  { id: "AL-301", title: "Fuel anomaly detected", detail: "VH-204 is 18% above baseline fuel consumption for the week.", severity: "High", status: "Open", vehicleId: "VH-204", driver: "Maya Patel", timestamp: "2026-09-23T07:40:00Z" },
  { id: "AL-204", title: "Maintenance overdue", detail: "VH-331 service due 3 days ago with repeated fault events.", severity: "Critical", status: "Open", vehicleId: "VH-331", driver: "Sofia Chen", timestamp: "2026-09-23T06:15:00Z" },
  { id: "AL-119", title: "Idle duration threshold crossed", detail: "VH-118 has been stationary for 2h 14m beyond expected idle window.", severity: "Medium", status: "Open", vehicleId: "VH-118", driver: "Noah Williams", timestamp: "2026-09-23T05:45:00Z" },
  { id: "AL-118", title: "Overspeed alert", detail: "VH-087 exceeded 80 km/h during city corridor travel.", severity: "High", status: "Open", vehicleId: "VH-087", driver: "Arjun Rao", timestamp: "2026-09-23T04:30:00Z" },
];

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    fetch("http://127.0.0.1:5087/api/alerts").then((response) => response.json()).then(setAlerts).catch(() => setAlerts(fallbackAlerts));
  }, []);
  return <div className="operations-page">
    <PageHeading title="Alerts center" subtitle="Prioritized events that need a decision from your operations team." />
    <div className="ops-summary"><Summary label="Open alerts" value={alerts.filter((alert) => alert.status === "Open").length} detail="Across the fleet" /><Summary label="Critical" value={alerts.filter((alert) => alert.severity === "Critical").length} detail="Requires immediate action" /><Summary label="High priority" value={alerts.filter((alert) => alert.severity === "High").length} detail="Review today" /></div>
    <section className="alert-list">{alerts.map((alert) => <article className="alert-row" key={alert.id}><div className={`alert-icon ${alert.severity.toLowerCase()}`}><AlertIcon title={alert.title} /></div><div className="alert-main"><div className="alert-title"><strong>{alert.title}</strong><span className={`severity ${alert.severity.toLowerCase()}`}>{alert.severity}</span></div><p>{alert.detail}</p><small>{alert.vehicleId} · {alert.driver} · {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div><button className="row-action" aria-label={`Open ${alert.id}`}><ChevronRight size={18} /></button></article>)}</section>
  </div>;
}
function PageHeading({ title, subtitle }) { return <div className="ops-heading"><div><p className="eyebrow">COMMAND CENTER</p><h1>{title}</h1><p>{subtitle}</p></div><button className="outline-button"><BellRing size={15} /> Configure alerts</button></div>; }
function Summary({ label, value, detail }) { return <article className="ops-summary-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function AlertIcon({ title }) { if (title.includes("Fuel")) return <Fuel size={18} />; if (title.includes("Maintenance")) return <Wrench size={18} />; if (title.includes("Overspeed")) return <Zap size={18} />; return <Clock3 size={18} />; }
export default Alerts;
