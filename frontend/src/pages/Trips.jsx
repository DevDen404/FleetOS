import { useEffect, useState } from "react";
import { ExternalLink, Plus, Route, Truck, X } from "lucide-react";
import { Link } from "react-router-dom";
import "./Operations.css";
import "./TripCreate.css";
import "./TripVersionControls.css";

const fallbackTrips = [
  { id: "TR-4101", vehicleId: "VH-204", driver: "Maya Patel", origin: "Delhi", destination: "Jaipur", status: "On trip", distanceKm: 610 },
  { id: "TR-4102", vehicleId: "VH-087", driver: "Arjun Rao", origin: "Mumbai", destination: "Pune", status: "On trip", distanceKm: 160 },
  { id: "TR-4103", vehicleId: "VH-442", driver: "Priya Nair", origin: "Bengaluru", destination: "Hyderabad", status: "On trip", distanceKm: 570 },
  { id: "TR-4104", vehicleId: "VH-219", driver: "Ravi Sharma", origin: "Lucknow", destination: "Kanpur", status: "Completed", distanceKm: 190 },
];

function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [formValues, setFormValues] = useState({ vehicleId: "VH-204", driver: "Maya Patel", origin: "", destination: "", status: "Planned", distanceKm: "", durationMinutes: "" });
  const [notice, setNotice] = useState("");
  const [versions] = useState(() => {
    const versions = JSON.parse(localStorage.getItem("fleetos-trip-form-versions") || "null") || [{ name: "Trip intake", version: 1, status: "Published", fields: [] }];
    return versions;
  });
  const [selectedVersionId, setSelectedVersionId] = useState(() => Number(localStorage.getItem("fleetos-trip-form-live-version")) || null);
  const publishedVersions = versions.filter((version) => version.status === "Published");
  const publishedVersion = publishedVersions.find((version) => version.id === selectedVersionId) || publishedVersions.sort((a, b) => b.version - a.version)[0] || versions[0];

  useEffect(() => {
    const localTrips = JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]");
    Promise.all([fetch("http://127.0.0.1:5087/api/trips"), fetch("http://127.0.0.1:5087/api/vehicles")]).then(async ([tripResponse, vehicleResponse]) => { const apiTrips = await tripResponse.json(); setTrips([...localTrips, ...apiTrips.filter((trip) => !localTrips.some((localTrip) => localTrip.id === trip.id))]); setVehicles(await vehicleResponse.json()); }).catch(() => { setTrips(localTrips.length ? [...localTrips, ...fallbackTrips] : fallbackTrips); setVehicles([{ id: "VH-204", driver: "Maya Patel" }, { id: "VH-087", driver: "Arjun Rao" }, { id: "VH-442", driver: "Priya Nair" }]); });
    const handleTripCreated = (event) => setTrips((current) => [event.detail, ...current.filter((trip) => trip.id !== event.detail.id)]);
    window.addEventListener("fleetos:trip-created", handleTripCreated);
    return () => window.removeEventListener("fleetos:trip-created", handleTripCreated);
  }, []);

  function updateField(fieldId, value) {
    const nextValues = { ...formValues, [fieldId]: value };
    if (fieldId === "vehicleId") {
      nextValues.driver = vehicles.find((vehicle) => vehicle.id === value)?.driver || nextValues.driver;
    }
    setFormValues(nextValues);
  }

  async function createTrip(event) {
    event.preventDefault();
    setNotice("");
    const payload = { ...formValues, distanceKm: Number(formValues.distanceKm), durationMinutes: Number(formValues.durationMinutes) };
    try {
      const response = await fetch("http://127.0.0.1:5087/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Trip creation failed");
      const created = await response.json();
      setTrips((current) => [created, ...current]);
      publishTripToLiveFleet(created);
      setNotice(`${created.id} created with form version ${publishedVersion.version}.`);
    } catch {
      const created = { ...payload, id: `TR-DEMO-${trips.length + 1}` };
      setTrips((current) => [created, ...current]);
      publishTripToLiveFleet(created);
      setNotice(`${created.id} added to the demo register with form version ${publishedVersion.version}.`);
    }
    setCreateOpen(false);
  }

  function publishTripToLiveFleet(trip) {
    const storedTrips = JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]");
    localStorage.setItem("fleetos-copilot-trips", JSON.stringify([trip, ...storedTrips.filter((storedTrip) => storedTrip.id !== trip.id)].slice(0, 50)));
    window.dispatchEvent(new CustomEvent("fleetos:trip-created", { detail: trip }));
  }

  return <div className="operations-page">
    <div className="ops-heading"><div><p className="eyebrow">TRIP OPERATIONS</p><h1>Trips</h1><p>Track route execution and enter new work using the active form version.</p></div><div className="builder-actions"><button className="primary-action" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create trip</button><Link className="builder-button" to="/trip-form-builder"><ExternalLink size={14} /> Open form builder</Link></div></div>
    <div className="ops-summary"><article className="ops-summary-card"><Route size={18} className="summary-icon" /><span>Active trips</span><strong>{trips.filter((trip) => trip.status === "On trip").length}</strong><small>Vehicles currently moving</small></article><article className="ops-summary-card"><Truck size={18} className="summary-icon" /><span>Total distance</span><strong>{trips.reduce((total, trip) => total + Number(trip.distanceKm || 0), 0).toLocaleString()} km</strong><small>Across recent records</small></article><article className="ops-summary-card"><span>Entry form</span><strong>v{publishedVersion?.version ?? 1}</strong><small>{publishedVersion?.name ?? "Trip intake"} · Published</small></article></div>
    <section className="ops-panel"><div className="ops-panel-title"><div><strong>Recent trip entries</strong><small>Using published form version {publishedVersion?.version ?? 1}</small></div></div><div className="table-list">{trips.map((trip) => <div key={trip.id} className="table-row"><span>{trip.id}</span><span>{trip.vehicleId} · {trip.driver}</span><span>{trip.origin}</span><span>{trip.destination}</span><span>{trip.status}</span><span>{trip.distanceKm} km</span></div>)}</div></section>
    {notice && <div className="trip-notice">{notice}</div>}
    {createOpen && <div className="trip-modal-backdrop"><section className="trip-modal"><div className="modal-heading"><div><p className="eyebrow">TRIP ENTRY FORM</p><h2>Create trip</h2><p>{publishedVersion?.name ?? "Trip intake"} · choose the published version for this entry</p></div><button className="detail-close" onClick={() => setCreateOpen(false)} aria-label="Close create trip"><X size={18} /></button></div><label className="version-picker">Form version<select value={publishedVersion?.id ?? ""} onChange={(event) => { const nextId = Number(event.target.value); setSelectedVersionId(nextId); localStorage.setItem("fleetos-trip-form-live-version", String(nextId)); }} >{publishedVersions.map((version) => <option key={version.id} value={version.id}>v{version.version} · {version.name}{version.id === Number(localStorage.getItem("fleetos-trip-form-live-version")) ? " · Live" : ""}</option>)}</select></label><form className="trip-create-form" onSubmit={createTrip}>{(publishedVersion?.fields?.length ? publishedVersion.fields : [{ id: "vehicleId", label: "Vehicle", type: "select", required: true }, { id: "driver", label: "Driver", type: "text", required: true }, { id: "origin", label: "Origin", type: "text", required: true }, { id: "destination", label: "Destination", type: "text", required: true }, { id: "status", label: "Status", type: "select", required: true }, { id: "distanceKm", label: "Distance (km)", type: "number", required: true }, { id: "durationMinutes", label: "Duration (minutes)", type: "number", required: true }]).map((field) => <label key={field.id}>{field.label}{field.required ? " *" : ""}{field.type === "select" ? <select required={field.required} value={formValues[field.id] || ""} onChange={(event) => updateField(field.id, event.target.value)}>{field.id === "vehicleId" ? vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.id} · {vehicle.driver}</option>) : <><option>Planned</option><option>On trip</option><option>Completed</option></>}</select> : <input required={field.required} type={field.type} value={formValues[field.id] || ""} onChange={(event) => updateField(field.id, event.target.value)} />}</label>)}<div className="modal-footer"><small>Saved against form version {publishedVersion?.version ?? 1}</small><button className="submit-trip" type="submit">Create trip</button></div></form></section></div>}
  </div>;
}

export default Trips;
