import { useEffect, useState } from "react";
import { Phone, ShieldCheck, UserRound } from "lucide-react";
import "./Operations.css";

function Drivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5087/api/drivers")
      .then((response) => response.json())
      .then(setDrivers)
      .catch(() => setDrivers([]));
  }, []);

  return <div className="operations-page">
    <PageHeading eyebrow="PEOPLE OPERATIONS" title="Driver performance" subtitle="Track availability, safety, and workload across your driving team." />
    <div className="ops-summary"><Summary label="Active drivers" value={drivers.filter((driver) => driver.status === "On trip").length} detail="Currently on route" /><Summary label="Avg. safety score" value={`${drivers.length ? Math.round(drivers.reduce((total, driver) => total + driver.safetyScore, 0) / drivers.length) : 0}%`} detail="Across the roster" /><Summary label="Hours this week" value={drivers.reduce((total, driver) => total + driver.hoursThisWeek, 0)} detail="Combined duty hours" /></div>
    <section className="ops-grid driver-grid">{drivers.map((driver) => <article className="driver-card" key={driver.id}><div className="driver-card-head"><div className="driver-avatar"><UserRound size={20} /></div><div><strong>{driver.name}</strong><span>{driver.id} · {driver.region}</span></div><Status status={driver.status} /></div><div className="driver-assignment"><span>Assigned vehicle</span><strong>{driver.assignedVehicle}</strong></div><div className="driver-stats"><span><ShieldCheck size={15} />{driver.safetyScore}% safety</span><span>{driver.tripsCompleted} trips</span><span>{driver.hoursThisWeek}h this week</span></div><div className="driver-contact"><Phone size={14} />{driver.phone}</div></article>)}</section>
  </div>;
}

function PageHeading({ eyebrow, title, subtitle }) { return <div className="ops-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div><button className="primary-action">+ Add driver</button></div>; }
function Summary({ label, value, detail }) { return <article className="ops-summary-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function Status({ status }) { return <span className={`ops-status ${status.toLowerCase().replace(" ", "-")}`}><i />{status}</span>; }
export default Drivers;
