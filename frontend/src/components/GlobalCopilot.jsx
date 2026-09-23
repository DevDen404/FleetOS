import { useEffect, useRef, useState } from "react";
import { Bot, LockKeyhole, MessageSquare, Send, Sparkles, X } from "lucide-react";
import "./GlobalCopilot.css";
import "./GlobalCopilotAuthorization.css";
import { getStoredTripFormVersions, tripFormFields } from "../utils/tripFormSchema";
import { getSession } from "../utils/auth";

const fallbackPrompts = [
  "Which vehicles need attention?",
  "Find unusual fuel consumption",
  "Give me a fleet health summary",
  "Show me idle vehicles",
  "What  are the fields required to create a trip?",
  "Create a trip"
];

function getLiveForm() {
  const versions = getStoredTripFormVersions();
  const liveId = Number(localStorage.getItem("fleetos-trip-form-live-version"));
  return versions.find((version) => version.id === liveId && version.status === "Published")
    || versions.filter((version) => version.status === "Published").sort((a, b) => b.version - a.version)[0]
    || { ...versions[0], fields: tripFormFields.map((field) => ({ ...field })) };
}

function normalize(value) {
  return value.toLowerCase().replace(/[\u2013\u2014]/g, "-").replace(/\s+/g, " ").trim();
}

function extractTripRequest(question, form) {
  const text = normalize(question);
  if (!(text.includes("trip") || text.includes("route")) || !(text.includes("create") || text.includes("make") || text.includes("book"))) return null;

  const values = {};
  const aliases = {
    vehicleId: "vehicle|vehicle id|truck|lorry",
    driver: "driver",
    origin: "origin|from|starting from|start",
    destination: "destination|to|going to|ending at|end",
  };
  const fields = form.fields || [];
  fields.filter((field) => field.required).forEach((field) => {
    const key = field.id;
    const alias = aliases[key] || key;
    const pattern = new RegExp(`(?:${alias})\\s*(?:is|=|:|at|for|from|to)?\\s*([a-z0-9][a-z0-9 .'-]*?)(?=\\s+(?:vehicle|vehicle id|truck|lorry|driver|origin|from|starting from|start|destination|to|going to|ending at|end)\\b|$)`, "i");
    const match = text.match(pattern);
    if (match) values[key] = match[1].trim().replace(/[.,]$/, "");
  });

  const required = fields.filter((field) => field.required);
  const missing = required.filter((field) => !values[field.id]).map((field) => field.label || field.id);
  return { form, values, missing };
}

function isTripRequest(question) {
  const text = normalize(question);
  return (text.includes("trip") || text.includes("route")) && (text.includes("create") || text.includes("make") || text.includes("book"));
}

function isRequiredFieldsQuestion(question) {
  const text = normalize(question);
  return text.includes("required") && text.includes("field") && (text.includes("trip") || text.includes("form"));
}

function getRequiredFields(form) {
  return (form.fields || []).filter((field) => field.required);
}

function publishCreatedTrip(trip) {
  let storedTrips;
  try {
    const parsed = JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]");
    storedTrips = Array.isArray(parsed) ? parsed : [];
  } catch {
    // Ignore malformed local trip data and start with an empty register.
    storedTrips = [];
  }
  localStorage.setItem("fleetos-copilot-trips", JSON.stringify([trip, ...storedTrips.filter((item) => item.id !== trip.id)].slice(0, 50)));
  window.dispatchEvent(new CustomEvent("fleetos:trip-created", { detail: trip }));
}

function createFallbackTrip(payload) {
  return { ...payload, id: `TR-DEMO-${Date.now()}` };
}

function getFieldOptions(field) {
  if (field?.id === "status") return ["Planned", "On trip", "Completed"];
  return [];
}

function getStoredTrips() {
  try {
    const trips = JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]");
    return Array.isArray(trips) ? trips : [];
  } catch {
    return [];
  }
}

const fallbackQuickData = {
  vehicles: [
    { id: "VH-204", status: "On trip", driver: "Maya Patel", fuelLevel: 71 },
    { id: "VH-118", status: "Idle", driver: "Noah Williams", fuelLevel: 38 },
    { id: "VH-087", status: "On trip", driver: "Arjun Rao", fuelLevel: 84 },
    { id: "VH-331", status: "Attention", driver: "Sofia Chen", fuelLevel: 19 },
    { id: "VH-219", status: "Available", driver: "Ravi Sharma", fuelLevel: 57 },
    { id: "VH-442", status: "On trip", driver: "Priya Nair", fuelLevel: 61 },
    { id: "VH-510", status: "Idle", driver: "Daniel Moss", fuelLevel: 42 },
  ],
  trips: [
    { id: "TR-4101", vehicleId: "VH-204", status: "On trip" },
    { id: "TR-4102", vehicleId: "VH-087", status: "On trip" },
    { id: "TR-4103", vehicleId: "VH-442", status: "On trip" },
    { id: "TR-4104", vehicleId: "VH-219", status: "Completed" },
  ],
  dashboard: { kpis: [{ label: "Open alerts", value: "4" }] },
  analytics: { fuelEfficiency: 8.1, fuelBaseline: 7.55 },
};

async function fetchQuickData(url, fallback) {
  try {
    const response = await fetch(url);
    if (!response.ok) return fallback;
    const data = await response.json();
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

async function getQuickPromptAnswer(question) {
  const lower = normalize(question);
  const isAttention = lower.includes("attention") || lower.includes("need") && lower.includes("vehicle");
  const isFuel = lower.includes("fuel") || lower.includes("consumption");
  const isIdle = lower.includes("idle") || lower.includes("stationary");
  const isHealth = lower.includes("health") || lower.includes("summary");
  if (!isAttention && !isFuel && !isIdle && !isHealth) return null;

  const [vehicles, apiTrips, dashboard, analytics] = await Promise.all([
    fetchQuickData("http://127.0.0.1:5087/api/vehicles", fallbackQuickData.vehicles),
    fetchQuickData("http://127.0.0.1:5087/api/trips", fallbackQuickData.trips),
    fetchQuickData("http://127.0.0.1:5087/api/dashboard", fallbackQuickData.dashboard),
    fetchQuickData("http://127.0.0.1:5087/api/analytics", fallbackQuickData.analytics),
  ]);
  const localTrips = getStoredTrips();
  const trips = [...localTrips, ...apiTrips.filter((trip) => !localTrips.some((localTrip) => localTrip.id === trip.id))];

  if (isIdle) {
    const idleVehicles = vehicles.filter((vehicle) => vehicle.status === "Idle");
    return idleVehicles.length
      ? `${idleVehicles.length} vehicles are idle: ${idleVehicles.map((vehicle) => `${vehicle.id} (${vehicle.driver})`).join(", ")}.`
      : "No vehicles are currently idle.";
  }

  if (isFuel) {
    const lowFuel = vehicles.filter((vehicle) => Number(vehicle.fuelLevel) < 25);
    const efficiency = analytics.fuelEfficiency ?? dashboard.fuelEfficiency;
    const baseline = analytics.fuelBaseline ?? dashboard.fuelBaseline;
    const fuelSummary = efficiency == null ? "Live fuel efficiency is unavailable" : `Live fuel efficiency is ${efficiency} L/100km${baseline == null ? "" : ` against a ${baseline} L/100km baseline`}`;
    return lowFuel.length ? `${fuelSummary}. Low-fuel vehicles: ${lowFuel.map((vehicle) => `${vehicle.id} at ${vehicle.fuelLevel}%`).join(", ")}.` : `${fuelSummary}. No vehicles are below the 25% fuel threshold.`;
  }

  if (isAttention) {
    const attentionVehicles = vehicles.filter((vehicle) => vehicle.status === "Attention" || Number(vehicle.fuelLevel) < 25);
    return attentionVehicles.length
      ? `${attentionVehicles.length} vehicles need attention: ${attentionVehicles.map((vehicle) => `${vehicle.id} (${vehicle.status}, ${vehicle.fuelLevel}% fuel)`).join(", ")}.`
      : "No vehicles currently need attention.";
  }

  const activeTrips = trips.filter((trip) => trip.status === "On trip");
  const openAlerts = dashboard.kpis?.find((item) => item.label === "Open alerts")?.value ?? dashboard.openAlerts ?? 0;
  return `Fleet health: ${vehicles.length} vehicles, ${activeTrips.length} active trips, ${openAlerts} open alerts, and ${trips.length} trips in the current register.`;
}

function GlobalCopilot() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [tripDraft, setTripDraft] = useState(null);
  const [pendingTrip, setPendingTrip] = useState(null);
  const messagesBodyRef = useRef(null);
  const session = getSession();
  const [driverCopilotAccess, setDriverCopilotAccess] = useState(() => localStorage.getItem("fleetos-driver-copilot-access") === "true");
  const hasCopilotAccess = session?.role === "super-admin" || (session?.role === "driver" && driverCopilotAccess);

  useEffect(() => {
    const updateAccess = (event) => setDriverCopilotAccess(Boolean(event.detail?.granted));
    window.addEventListener("fleetos:copilot-access-changed", updateAccess);
    return () => window.removeEventListener("fleetos:copilot-access-changed", updateAccess);
  }, []);

  useEffect(() => {
    const body = messagesBodyRef.current;
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function addMessage(question, answer, options = {}) {
    setMessages((current) => [...current, { question, answer, ...options }]);
    setPrompt("");
    setOpen(true);
  }

  async function finishTrip(draft) {
    const payload = { ...draft.values, status: draft.values.status || "Planned", distanceKm: Number(draft.values.distanceKm || 0), durationMinutes: Number(draft.values.durationMinutes || 0) };
    let created;
    try {
      const response = await fetch("http://127.0.0.1:5087/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Trip creation failed");
      created = await response.json();
    } catch {
      created = createFallbackTrip(payload);
    }
    publishCreatedTrip(created);
    setTripDraft(null);
    addMessage("Trip details submitted", `${created.id} was created from live form v${draft.form.version} (${draft.form.name}).`);
  }

  function askNextTripField(draft) {
    const field = draft.fields[draft.index];
    addMessage("Trip creation", `What is the ${field.label}?`);
  }

  function requestTripAuthorization(draft) {
    setTripDraft(null);
    setPendingTrip(draft);
    addMessage("Trip creation", `All required fields are complete for live form v${draft.form.version} (${draft.form.name}). Create this trip now?`, { authorization: true });
  }

  async function handleTripAuthorization(question) {
    const answer = normalize(question);
    if (["yes", "y", "confirm", "create", "approve", "okay", "ok"].includes(answer)) {
      const draft = pendingTrip;
      setPendingTrip(null);
      await finishTrip(draft);
      return;
    }
    if (["no", "n", "cancel", "stop", "never mind"].includes(answer)) {
      setPendingTrip(null);
      addMessage(question, "Trip creation cancelled. No trip was created.");
      return;
    }
    addMessage(question, "Please reply yes to create the trip or no to cancel.");
  }

  async function continueTrip(question) {
    const value = question.trim();
    if (!value) return;
    if (["cancel", "stop", "never mind"].includes(normalize(value))) {
      setTripDraft(null);
      addMessage(value, "Trip creation cancelled.");
      return;
    }

    const field = tripDraft.fields[tripDraft.index];
    const values = { ...tripDraft.values, [field.id]: value };
    const nextDraft = { ...tripDraft, values, index: tripDraft.index + 1 };
    setMessages((current) => [...current, { question: value, answer: `Saved ${field.label}: ${value}` }]);
    setPrompt("");
    if (nextDraft.index >= nextDraft.fields.length) {
      requestTripAuthorization(nextDraft);
      return;
    }
    setTripDraft(nextDraft);
    askNextTripField(nextDraft);
  }

  async function ask(question = prompt) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    if (pendingTrip) {
      await handleTripAuthorization(cleanQuestion);
      return;
    }
    if (tripDraft) {
      await continueTrip(cleanQuestion);
      return;
    }
    const form = getLiveForm();
    if (session?.role !== "super-admin" && isTripRequest(cleanQuestion)) {
      addMessage(cleanQuestion, "Trip creation is restricted to Super Admins. Please ask your fleet manager to create this trip.");
      return;
    }
    if (isRequiredFieldsQuestion(cleanQuestion)) {
      const fields = getRequiredFields(form);
      addMessage(cleanQuestion, `The active form is v${form.version} (${form.name}). Required fields: ${fields.map((field) => field.label || field.id).join(", ")}.`);
      return;
    }

    const trip = isTripRequest(cleanQuestion) ? extractTripRequest(cleanQuestion, form) : null;
    let answer;

    if (trip) {
      const fields = getRequiredFields(form);
      const firstMissingIndex = fields.findIndex((field) => !trip.values[field.id]);
      if (firstMissingIndex >= 0) {
        const draft = { form, fields, values: trip.values, index: firstMissingIndex };
        setTripDraft(draft);
        setMessages((current) => [...current, { question: cleanQuestion, answer: `I’ll create this using live form v${form.version} (${form.name}).` }]);
        setPrompt("");
        askNextTripField(draft);
        return;
      }
      requestTripAuthorization({ form, fields, values: trip.values, index: fields.length });
      return;
    } else {
      answer = "I can help you inspect live fleet activity, trips, fuel, alerts, maintenance, drivers, or analytics.";
      try {
        const quickAnswer = await getQuickPromptAnswer(cleanQuestion);
        if (quickAnswer) {
          answer = quickAnswer;
        } else {
          const response = await fetch("http://127.0.0.1:5087/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: cleanQuestion }),
          });
          if (response.ok) {
            const payload = await response.json();
            answer = payload.answer || answer;
          }
        }
      } catch {
        answer = "Live fleet data is currently unavailable. Please try again when the API is connected.";
      }
    }

    setMessages((current) => [...current, { question: cleanQuestion, answer }]);
    setPrompt("");
    setOpen(true);
  }

  return <div className="global-copilot">
    <button className={`copilot-launcher ${open ? "open" : ""}`} onClick={() => setOpen((value) => !value)} aria-label={open ? "Close AI Copilot" : "Open AI Copilot"} title="Open AI Copilot"><Bot size={22} /></button>
    {open && <section className="global-copilot-panel">
      <header><div className="global-copilot-title"><span className="global-copilot-icon"><Sparkles size={17} /></span><div><strong>FleetOS Copilot</strong><small>Grounded in fleet operations</small></div></div><button className="global-copilot-close" onClick={() => setOpen(false)} aria-label="Close AI Copilot"><X size={16} /></button></header>
      {!hasCopilotAccess ? <div className="copilot-access-denied"><LockKeyhole size={22} /><strong>Copilot access restricted</strong><p>You do not have access to FleetOS Copilot. Please request permission from your fleet manager.</p></div> : <><div className="global-copilot-prompts"><div className="copilot-prompts">{fallbackPrompts.filter((item) => session?.role === "super-admin" || !isTripRequest(item)).map((item) => <button key={item} onClick={() => ask(item)}>{item}</button>)}</div></div>
        <div className="global-copilot-body" ref={messagesBodyRef}>
          {!messages.length && <div className="copilot-empty"><Bot size={16} /><p>Ask about your fleet or create a trip using the active form labels.</p></div>}
          {messages.map((message, index) => <div className="global-message" key={`${message.question}-${index}`}><div className="global-question"><MessageSquare size={12} /> {message.question}</div><div className="global-answer"><Bot size={15} /><span>{message.answer}</span></div>{message.authorization && pendingTrip && <div className="trip-authorization-actions"><button type="button" onClick={() => ask("yes")}>Accept</button><button type="button" onClick={() => ask("no")}>Reject</button></div>}</div>)}
        </div>
        <form className="global-copilot-form" onSubmit={(event) => { event.preventDefault(); ask(); }}>{getFieldOptions(tripDraft?.fields[tripDraft.index]).length ? <select value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="Select trip status"><option value="">Select status...</option>{getFieldOptions(tripDraft.fields[tripDraft.index]).map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about your fleet..." />}<button type="submit" aria-label="Send question"><Send size={15} /></button></form>
      </>}
    </section>}
  </div>;
}

export default GlobalCopilot;
