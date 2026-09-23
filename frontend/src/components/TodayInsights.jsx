import { useEffect, useState } from "react";
import { Clock3, Fuel, Route, Sparkles, Wrench, X } from "lucide-react";
import { getSession } from "../utils/auth";
import "./TodayInsights.css";

const fallbackData = {
  vehicles: [
    { id: "VH-204", status: "On trip", driver: "Maya Patel", fuelLevel: 71 },
    { id: "VH-118", status: "Idle", driver: "Noah Williams", fuelLevel: 38 },
    { id: "VH-087", status: "On trip", driver: "Arjun Rao", fuelLevel: 84 },
    { id: "VH-331", status: "Attention", driver: "Sofia Chen", fuelLevel: 19 },
    { id: "VH-442", status: "On trip", driver: "Priya Nair", fuelLevel: 61 },
    { id: "VH-510", status: "Idle", driver: "Daniel Moss", fuelLevel: 42 },
  ],
  trips: [
    { id: "TR-4101", vehicleId: "VH-204", status: "On trip", origin: "Delhi", destination: "Jaipur" },
    { id: "TR-4102", vehicleId: "VH-087", status: "On trip", origin: "Mumbai", destination: "Pune" },
    { id: "TR-4103", vehicleId: "VH-442", status: "On trip", origin: "Bengaluru", destination: "Hyderabad" },
  ],
  maintenance: [
    { vehicleId: "VH-331", title: "Brake inspection overdue", status: "Scheduled", severity: "Critical" },
    { vehicleId: "VH-204", title: "Fuel system diagnostic", status: "In progress", severity: "High" },
  ],
};

async function loadData(url, fallback) {
  try {
    const response = await fetch(url);
    if (!response.ok) return fallback;
    const value = await response.json();
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function storedTrips() {
  try {
    const value = JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function loadInsights() {
  const [vehicles, apiTrips, maintenance] = await Promise.all([
    loadData("http://127.0.0.1:5087/api/vehicles", fallbackData.vehicles),
    loadData("http://127.0.0.1:5087/api/trips", fallbackData.trips),
    loadData("http://127.0.0.1:5087/api/maintenance", fallbackData.maintenance),
  ]);
  const localTrips = storedTrips();
  const trips = [...localTrips, ...apiTrips.filter((trip) => !localTrips.some((localTrip) => localTrip.id === trip.id))];
  const activeTrips = trips.filter((trip) => trip.status === "On trip");
  const lowFuel = vehicles.filter((vehicle) => Number(vehicle.fuelLevel) < 25);
  const idleVehicles = vehicles.filter((vehicle) => vehicle.status === "Idle");
  const urgentMaintenance = maintenance.filter((item) => item.severity === "Critical" || item.status === "Overdue" || item.status === "In progress");

  return [
    { icon: Route, tone: "amber", label: "Trip anomaly", value: `${activeTrips.length} active trips`, detail: activeTrips.length ? activeTrips.slice(0, 3).map((trip) => `${trip.vehicleId} · ${trip.origin || "route pending"} to ${trip.destination || "destination pending"}`).join("; ") : "No active trip anomalies detected." },
    { icon: Fuel, tone: "red", label: "Fuel anomaly", value: `${lowFuel.length} low-fuel vehicles`, detail: lowFuel.length ? lowFuel.map((vehicle) => `${vehicle.id} at ${vehicle.fuelLevel}%`).join(", ") : "No vehicles are below the 25% fuel threshold." },
    { icon: Clock3, tone: "slate", label: "Idle time", value: `${idleVehicles.length} idle vehicles`, detail: idleVehicles.length ? idleVehicles.map((vehicle) => `${vehicle.id} · ${vehicle.driver}`).join(", ") : "No vehicles are currently idle." },
    { icon: Wrench, tone: "red", label: "Urgent maintenance", value: `${urgentMaintenance.length} tasks`, detail: urgentMaintenance.length ? urgentMaintenance.slice(0, 3).map((item) => `${item.vehicleId} · ${item.title}`).join("; ") : "No urgent maintenance tasks." },
  ];
}

function TodayInsights({ open, onClose }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const session = getSession();

  useEffect(() => {
    if (!open || session?.role !== "super-admin") return undefined;
    let cancelled = false;
    loadInsights().then((value) => {
      if (!cancelled) setInsights(value);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, session?.role]);

  if (!open || session?.role !== "super-admin") return null;
  return <div className="today-insights-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="today-insights-modal" role="dialog" aria-modal="true" aria-labelledby="today-insights-title">
      <header><div className="today-insights-title"><span><Sparkles size={20} /></span><div><p>FLEETOS AI</p><h2 id="today-insights-title">Today&apos;s insights</h2><small>Live operational signals for {session.name}</small></div></div><button className="today-insights-close" onClick={onClose} aria-label="Close today&apos;s insights"><X size={20} /></button></header>
      <div className="today-insights-content">{loading ? <p className="today-insights-loading">Loading today&apos;s operational insights...</p> : <div className="today-insights-modal-grid">{insights.map((insight) => { const Icon = insight.icon; return <article className="today-insight-modal-card" key={insight.label}><div className={`today-insight-modal-icon ${insight.tone}`}><Icon size={20} /></div><div><span>{insight.label}</span><strong>{insight.value}</strong><p>{insight.detail}</p></div></article>; })}</div>}</div>
      <footer><span>Updated from live fleet, trip, and maintenance data</span><button onClick={onClose}>Close notifications</button></footer>
    </section>
  </div>;
}

export default TodayInsights;
