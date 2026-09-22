import { useState } from "react";
import { CheckCircle2, Clock3, Fuel, MapPin, Navigation, ShieldCheck, Wrench } from "lucide-react";
import { getSession } from "../utils/auth";
import "./DriverDashboard.css";

const fallbackTrip = { id: "TR-4101", vehicleId: "VH-204", vehicleType: "Volvo FH16", origin: "Delhi", destination: "Jaipur", status: "On trip", progress: 64, distanceRemaining: 218, eta: "16:40", fuel: 71 };

function DriverDashboard() {
  const session = getSession();
  const [trip] = useState(() => {
    const localTrips = JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]");
    const assignedTrip = localTrips.find((item) => item.driver === session?.name && item.status !== "Completed");
    return assignedTrip ? { ...fallbackTrip, ...assignedTrip, progress: 42, distanceRemaining: assignedTrip.distanceKm || 303, eta: "16:40", fuel: 78 } : fallbackTrip;
  });
  const [checkedIn, setCheckedIn] = useState(true);

  return <div className="driver-dashboard"><div className="driver-welcome"><div><p className="eyebrow">DRIVER WORKSPACE</p><h1>Good morning, {session?.name || "Ravi Sharma"}</h1><p>Everything you need for today&apos;s route, in one place.</p></div><button className={`check-in-button ${checkedIn ? "checked" : ""}`} onClick={() => setCheckedIn((value) => !value)}>{checkedIn ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}{checkedIn ? "Checked in" : "Check in for duty"}</button></div>
    <section className="driver-trip-hero"><div className="trip-hero-top"><div><span className="trip-label">CURRENT ASSIGNMENT</span><h2>{trip.origin} <span>to</span> {trip.destination}</h2><p>{trip.id} · {trip.vehicleId} · {trip.vehicleType}</p></div><span className="driver-trip-status"><i /> {trip.status}</span></div><div className="route-progress"><div className="route-progress-line"><span style={{ width: `${trip.progress}%` }} /></div><div className="route-stops"><span>{trip.origin}</span><strong>{trip.progress}% complete</strong><span>{trip.destination}</span></div></div><div className="trip-hero-stats"><div><Navigation size={17} /><span><strong>{trip.distanceRemaining} km</strong><small>remaining</small></span></div><div><Clock3 size={17} /><span><strong>{trip.eta}</strong><small>estimated arrival</small></span></div><div><Fuel size={17} /><span><strong>{trip.fuel}%</strong><small>fuel level</small></span></div></div></section>
    <section className="driver-card-grid"><article className="driver-action-card"><div className="driver-card-icon amber"><MapPin size={19} /></div><div><strong>Open route guidance</strong><p>Continue navigation to {trip.destination}.</p></div><button>Open map</button></article><article className="driver-action-card"><div className="driver-card-icon green"><ShieldCheck size={19} /></div><div><strong>Safety score</strong><p>Excellent driving pattern this week.</p></div><b>96%</b></article><article className="driver-action-card"><div className="driver-card-icon red"><Wrench size={19} /></div><div><strong>Vehicle check</strong><p>{trip.vehicleId} daily inspection is due before departure.</p></div><button>Review</button></article></section>
    <section className="driver-lower-grid"><article className="driver-panel"><div className="driver-panel-heading"><div><h2>Today&apos;s checklist</h2><p>Complete before your next dispatch.</p></div></div><CheckItem label="Pre-trip vehicle inspection" done /><CheckItem label="Fuel and tire check" done /><CheckItem label="Confirm delivery documents" /><CheckItem label="Upload arrival proof" /></article><article className="driver-panel"><div className="driver-panel-heading"><div><h2>Driver updates</h2><p>Latest messages from dispatch.</p></div></div><div className="driver-update"><span className="update-dot" /><div><strong>Route is clear</strong><p>Dispatch confirmed the Jaipur corridor is operating normally.</p><small>12 minutes ago</small></div></div><div className="driver-update"><span className="update-dot amber" /><div><strong>Rest break reminder</strong><p>Your next recommended break is in 42 minutes.</p><small>1 hour ago</small></div></div></article></section>
  </div>;
}

function CheckItem({ label, done }) { return <div className={`driver-check ${done ? "done" : ""}`}><span>{done && <CheckCircle2 size={15} />}</span><strong>{label}</strong>{done ? <small>Complete</small> : <button>Mark done</button>}</div>; }
export default DriverDashboard;
