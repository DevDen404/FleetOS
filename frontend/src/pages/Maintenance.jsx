import { useEffect, useState } from "react";
import "./Operations.css";

function Maintenance() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5087/api/maintenance");
        const result = await response.json();
        setItems(result);
      } catch {
        setItems([]);
      }
    };

    loadItems();
  }, []);

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <h2>Maintenance queue</h2>
          <p>Preventive and corrective repair workflow</p>
        </div>
      </div>

      <div className="records-grid">
        {items.map((item) => (
          <article key={item.id} className="record-card">
            <div className="record-card-top">
              <strong>{item.title}</strong>
              <span className={`status-pill ${item.severity?.toLowerCase()}`}>{item.severity}</span>
            </div>
            <p>{item.vehicleId}</p>
            <ul>
              <li>Status: {item.status}</li>
              <li>Due: {item.dueDate}</li>
              <li>{item.notes}</li>
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Maintenance;
