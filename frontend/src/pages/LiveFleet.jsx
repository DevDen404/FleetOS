import { useEffect, useMemo, useState } from "react";
import { Crosshair, Navigation, Search, Truck, X } from "lucide-react";
import "./LiveFleet.css";
import "./LiveFleetTrip.css";

const fallbackVehicles = [
  { id: "VH-204", plate: "UP32 AB 1234", type: "Volvo FH16", status: "On trip", driver: "Maya Patel", speed: 64, fuelLevel: 71, color: "#e8a13a", latitude: 28.6139, longitude: 77.209 },
  { id: "VH-118", plate: "DL01 MJ 7712", type: "Tata Prima", status: "Idle", driver: "Noah Williams", speed: 0, fuelLevel: 38, color: "#8794a6", latitude: 28.7041, longitude: 77.1025 },
  { id: "VH-087", plate: "MH12 RT 4409", type: "Ashok Leyland", status: "On trip", driver: "Arjun Rao", speed: 52, fuelLevel: 84, color: "#e8a13a", latitude: 19.076, longitude: 72.8777 },
  { id: "VH-331", plate: "KA05 NK 9081", type: "BharatBenz 2823", status: "Attention", driver: "Sofia Chen", speed: 0, fuelLevel: 19, color: "#e76872", latitude: 13.0827, longitude: 80.2707 },
  { id: "VH-219", plate: "GJ03 PQ 1189", type: "Eicher Pro 6048", status: "Available", driver: "Ravi Sharma", speed: 0, fuelLevel: 57, color: "#4dc4a0", latitude: 22.7196, longitude: 75.8577 },
  { id: "VH-442", plate: "TN07 SX 2943", type: "Mahindra Truxo", status: "On trip", driver: "Priya Nair", speed: 58, fuelLevel: 61, color: "#e8a13a", latitude: 13.0674, longitude: 80.2376 },
  { id: "VH-510", plate: "AP05 KL 7710", type: "Ashok Leyland", status: "Idle", driver: "Daniel Moss", speed: 0, fuelLevel: 42, color: "#8794a6", latitude: 17.385, longitude: 78.4867 },
];

function LiveFleet() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [feedActive, setFeedActive] = useState(true);

  useEffect(() => {
    let localTrips = [];
    try {
      const storedTrips = JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]");
      localTrips = Array.isArray(storedTrips) ? storedTrips : [];
    } catch {
      localTrips = [];
    }

    const applyTrips = (loadedVehicles) => {
      const safeVehicles = Array.isArray(loadedVehicles) ? loadedVehicles : fallbackVehicles;
      const activeTrips = localTrips.filter((item) => item.status !== "Completed");
      const updatedVehicles = safeVehicles.map((vehicle) => {
        const trip = activeTrips.find((item) => item.vehicleId === vehicle.id);
        return trip ? { ...vehicle, status: "On trip", driver: trip.driver || vehicle.driver, routeOrigin: trip.origin, routeDestination: trip.destination } : vehicle;
      });
      const missingVehicles = activeTrips.filter((trip) => !updatedVehicles.some((vehicle) => vehicle.id === trip.vehicleId)).map((trip, index) => ({
        id: trip.vehicleId,
        plate: "Demo assignment",
        type: "Assigned vehicle",
        status: "On trip",
        driver: trip.driver || "Unassigned",
        speed: 34,
        fuelLevel: 100,
        color: "#e8a13a",
        latitude: 28.6139 - (index * 2.5),
        longitude: 77.209 + (index * 1.8),
        routeOrigin: trip.origin,
        routeDestination: trip.destination,
      }));
      return [...updatedVehicles, ...missingVehicles];
    };
    fetch("http://127.0.0.1:5087/api/vehicles")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load vehicles");
        return response.json();
      })
      .then((loadedVehicles) => setVehicles(applyTrips(loadedVehicles)))
      .catch(() => setVehicles(applyTrips(fallbackVehicles)));

    const handleTripCreated = (event) => {
      const trip = event.detail;
      setVehicles((currentVehicles) => {
        const vehicleExists = currentVehicles.some((vehicle) => vehicle.id === trip.vehicleId);
        if (vehicleExists) return currentVehicles.map((vehicle) => vehicle.id === trip.vehicleId ? { ...vehicle, status: "On trip", driver: trip.driver || vehicle.driver, routeOrigin: trip.origin, routeDestination: trip.destination, speed: vehicle.speed || 34 } : vehicle);
        return [...currentVehicles, { id: trip.vehicleId, plate: "Demo assignment", type: "Assigned vehicle", status: "On trip", driver: trip.driver || "Unassigned", speed: 34, fuelLevel: 100, color: "#e8a13a", latitude: 25, longitude: 78, routeOrigin: trip.origin, routeDestination: trip.destination }];
      });
    };
    window.addEventListener("fleetos:trip-created", handleTripCreated);
    return () => window.removeEventListener("fleetos:trip-created", handleTripCreated);
  }, []);

  useEffect(() => {
    if (!feedActive) return undefined;

    const feedTimer = setInterval(() => {
      setVehicles((currentVehicles) => currentVehicles.map((vehicle, index) => {
        if (vehicle.status !== "On trip") return vehicle;

        const direction = index % 2 === 0 ? 1 : -1;
        const speedDelta = ((Date.now() / 2000 + index) % 3) - 1;
        return {
          ...vehicle,
          latitude: vehicle.latitude + 0.018 * direction,
          longitude: vehicle.longitude + 0.012 * (index % 3 === 0 ? -1 : 1),
          speed: Math.max(32, Math.min(78, Math.round(vehicle.speed + speedDelta))),
          fuelLevel: Math.max(12, vehicle.fuelLevel - 1),
        };
      }));
    }, 2000);

    return () => clearInterval(feedTimer);
  }, [feedActive]);

  const visibleVehicles = useMemo(() => vehicles.filter((vehicle) => (filter === "All" || vehicle.status === filter) && `${vehicle.id} ${vehicle.driver} ${vehicle.plate}`.toLowerCase().includes(query.toLowerCase())), [vehicles, filter, query]);
  const selectedVehicle = selected ? vehicles.find((vehicle) => vehicle.id === selected.id) ?? selected : null;

  const markerPosition = (vehicle) => ({ left: `${Math.max(6, Math.min(88, ((vehicle.longitude - 68) / 14) * 100))}%`, top: `${Math.max(8, Math.min(84, ((35 - vehicle.latitude) / 24) * 100))}%` });

  return <div className="live-fleet-page">
    <div className="live-fleet-heading"><div><p className="eyebrow">REAL-TIME OPERATIONS</p><h1>Live fleet map</h1><p>Monitor every vehicle, driver, and exception from one operational view.</p></div><button className={`map-live ${feedActive ? "active" : "paused"}`} onClick={() => setFeedActive((active) => !active)}><i /> {feedActive ? "Demo telemetry active · 2 sec feed" : "Demo telemetry paused · Resume feed"}</button></div>
    <div className="map-toolbar"><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vehicle or driver" /></label><div className="map-filters">{["All", "On trip", "Idle", "Attention", "Available"].map((option) => <button className={filter === option ? "selected" : ""} key={option} onClick={() => setFilter(option)}>{option}</button>)}</div><button className="map-tool-button" aria-label="Recenter map"><Crosshair size={16} /></button></div>
    <div className="map-layout"><section className="fleet-map"><div className="map-grid-lines" /><div className="map-route route-one" /><div className="map-route route-two" /><div className="map-label label-delhi">DELHI NCR</div><div className="map-label label-mumbai">MUMBAI</div><div className="map-label label-chennai">CHENNAI</div><div className="map-label label-hyderabad">HYDERABAD</div>{visibleVehicles.map((vehicle) => <button className="map-marker" style={{ ...markerPosition(vehicle), "--marker": vehicle.color }} key={vehicle.id} onClick={() => setSelected(vehicle)}><Truck size={15} /><span>{vehicle.id}</span></button>)}<div className="map-compass"><Navigation size={17} /> N</div></section><aside className="vehicle-rail"><div className="rail-heading"><strong>Fleet activity</strong><span>{visibleVehicles.length} vehicles</span></div>{visibleVehicles.map((vehicle) => <button className={`vehicle-live-row ${selected?.id === vehicle.id ? "active" : ""}`} key={vehicle.id} onClick={() => setSelected(vehicle)}><span className="vehicle-status-dot" style={{ background: vehicle.color }} /><span className="vehicle-live-copy"><strong>{vehicle.id}</strong><small>{vehicle.driver} · {vehicle.status}</small></span><span className="vehicle-live-speed">{vehicle.speed ? `${vehicle.speed} km/h` : "Idle"}</span></button>)}{visibleVehicles.length === 0 && <p className="empty-state">No vehicles match this view.</p>}</aside></div>
    {selectedVehicle && <div className="vehicle-detail"><div className="detail-icon" style={{ background: `${selectedVehicle.color}22`, color: selectedVehicle.color }}><Truck size={20} /></div><div><strong>{selectedVehicle.id} · {selectedVehicle.type}</strong><span>{selectedVehicle.plate} · {selectedVehicle.driver}</span>{selectedVehicle.routeOrigin && <small className="route-context">{selectedVehicle.routeOrigin} to {selectedVehicle.routeDestination}</small>}</div><dl><div><dt>Status</dt><dd>{selectedVehicle.status}</dd></div><div><dt>Speed</dt><dd>{selectedVehicle.speed ? `${selectedVehicle.speed} km/h` : "Stationary"}</dd></div><div><dt>Fuel</dt><dd>{selectedVehicle.fuelLevel}%</dd></div></dl><button className="detail-close" onClick={() => setSelected(null)} aria-label="Close vehicle detail"><X size={17} /></button></div>}
  </div>;
}
export default LiveFleet;
