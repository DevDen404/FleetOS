import { useEffect, useState } from "react";
import "./Operations.css";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5087/api/vehicles");
        const result = await response.json();
        setVehicles(result);
      } catch {
        setVehicles([]);
      }
    };

    loadVehicles();
  }, []);

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <h2>Vehicle registry</h2>
          <p>Fleet asset overview</p>
        </div>
      </div>

      <div className="records-grid">
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className="record-card">
            <div className="record-card-top">
              <strong>{vehicle.id}</strong>
              <span className={`status-pill ${vehicle.status?.toLowerCase().replace(" ", "-")}`}>{vehicle.status}</span>
            </div>
            <p>{vehicle.type}</p>
            <ul>
              <li>Plate: {vehicle.plate}</li>
              <li>Driver: {vehicle.driver}</li>
              <li>Fuel: {vehicle.fuelLevel}%</li>
              <li>Maintenance due: {vehicle.maintenanceDueDays} days</li>
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Vehicles;
