import { useState } from "react";
import { GripVertical, Plus, Save, Send, Settings2, Trash2 } from "lucide-react";
import "./TripFormBuilder.css";
import "./TripVersionControls.css";

const baseFields = [
  { id: "vehicleId", label: "Vehicle", type: "select", required: true },
  { id: "driver", label: "Driver", type: "text", required: true },
  { id: "origin", label: "Origin", type: "text", required: true },
  { id: "destination", label: "Destination", type: "text", required: true },
  { id: "status", label: "Status", type: "select", required: true },
  { id: "distanceKm", label: "Distance (km)", type: "number", required: true },
  { id: "durationMinutes", label: "Duration (minutes)", type: "number", required: true },
];

function TripFormBuilder() {
  const [versions, setVersions] = useState(() => JSON.parse(localStorage.getItem("fleetos-trip-form-versions") || "null") || [{ id: 1, name: "Trip intake", version: 1, status: "Published", updated: "Today", fields: baseFields }]);
  const [activeId, setActiveId] = useState(1);
  const [liveId, setLiveId] = useState(() => Number(localStorage.getItem("fleetos-trip-form-live-version")) || 1);
  const [notice, setNotice] = useState("");
  const active = versions.find((version) => version.id === activeId) || versions[0];
  const saveVersions = (next) => { setVersions(next); localStorage.setItem("fleetos-trip-form-versions", JSON.stringify(next)); };

  const editField = (fieldId, key, value) => saveVersions(versions.map((version) => version.id === active.id ? { ...version, status: "Draft", fields: version.fields.map((field) => field.id === fieldId ? { ...field, [key]: value } : field) } : version));
  const addField = () => saveVersions(versions.map((version) => version.id === active.id ? { ...version, status: "Draft", fields: [...version.fields, { id: `custom_${Date.now()}`, label: "New field", type: "text", required: false }] } : version));
  const removeField = (id) => saveVersions(versions.map((version) => version.id === active.id ? { ...version, status: "Draft", fields: version.fields.filter((field) => field.id !== id) } : version));
  const createVersion = () => { const next = { id: Date.now(), name: `Trip intake v${versions.length + 1}`, version: versions.length + 1, status: "Draft", updated: "Just now", fields: active.fields.map((field) => ({ ...field })) }; saveVersions([...versions, next]); setActiveId(next.id); };
  const publish = () => { saveVersions(versions.map((version) => version.id === active.id ? { ...version, status: "Published", updated: "Just now" } : version)); setNotice(`${active.name} published for trip entry.`); };
  const setLive = (version) => { setLiveId(version.id); localStorage.setItem("fleetos-trip-form-live-version", String(version.id)); setNotice(`${version.name} is now live for trip entry.`); };
  const deleteVersion = (version) => {
    if (versions.length === 1) {
      setNotice("Keep at least one form version in the workspace.");
      return;
    }
    if (version.id === liveId) {
      setNotice("The live version cannot be deleted. Set another version live first.");
      return;
    }
    if (!window.confirm(`Delete ${version.name}? This cannot be undone.`)) return;
    const nextVersions = versions.filter((item) => item.id !== version.id);
    saveVersions(nextVersions);
    if (version.id === active.id) setActiveId(nextVersions[0].id);
    setNotice(`${version.name} deleted.`);
  };

  return <div className="trip-builder"><div className="builder-heading"><div><p className="eyebrow">WORKSPACE CONFIGURATION</p><h1>Trip form builder</h1><p>Design and publish the form your team uses to enter trip data.</p></div><div className="builder-actions"><button className="builder-button" onClick={() => setNotice("Draft saved locally.")}><Save size={14} /> Save draft</button><button className="builder-button primary" onClick={publish}><Send size={14} /> Publish version</button></div></div>
    <div className="builder-shell"><aside className="builder-panel"><div className="builder-panel-heading"><h2>Versions</h2><button className="builder-button" onClick={createVersion}><Plus size={14} /></button></div><div className="version-list">{versions.map((version) => <div className={`version-item ${version.id === active.id ? "active" : ""}`} key={version.id}><div className="version-row"><button className="version-select" onClick={() => setActiveId(version.id)}><strong>{version.name}</strong><span>v{version.version} · {version.updated}</span><span className="version-badge">{version.status}</span></button><button className="version-delete" onClick={() => deleteVersion(version)} aria-label={`Delete ${version.name}`} title="Delete version"><Trash2 size={14} /></button></div>{version.status === "Published" && <button className={`live-version-button ${version.id === liveId ? "live" : ""}`} onClick={() => setLive(version)}>{version.id === liveId ? "Live version" : "Set live"}</button>}</div>)}</div><p className="builder-note">Publish a version, then choose Set live. Trips will use the live version by default.</p></aside>
      <section className="builder-panel"><div className="builder-panel-heading"><div><h2>Form fields</h2><span>{active.fields.length} fields · {active.status}</span></div><Settings2 size={17} color="#e8a13a" /></div><div className="field-list">{active.fields.map((field) => <div className="field-config" key={field.id}><div className="field-config-top"><GripVertical size={15} className="field-grip" /><input value={field.label} onChange={(event) => editField(field.id, "label", event.target.value)} /><select value={field.type} onChange={(event) => editField(field.id, "type", event.target.value)}><option value="text">Text</option><option value="number">Number</option><option value="select">Select</option></select><button className="row-action" onClick={() => removeField(field.id)}><Trash2 size={14} /></button></div><label className="field-toggle"><input type="checkbox" checked={field.required} onChange={(event) => editField(field.id, "required", event.target.checked)} /> Required</label></div>)}</div><button className="field-add" onClick={addField}><Plus size={14} /> Add field</button></section>
      <section className="builder-panel"><div className="builder-panel-heading"><div><h2>Published form preview</h2><span>{active.name} · version {active.version}</span></div></div><div className="builder-note">The published version is selected automatically on the Trips page. Use this builder to add or revise fields, then publish when ready.</div><div className="trip-form-preview">{active.fields.map((field) => <div className="preview-field" key={field.id}><span>{field.label}{field.required ? " *" : ""}</span><div /></div>)}</div>{notice && <div className="form-message">{notice}</div>}</section></div>
  </div>;
}

export default TripFormBuilder;
