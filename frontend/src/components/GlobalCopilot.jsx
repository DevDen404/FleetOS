import { useState } from "react";
import { Bot, MessageSquare, Send, Sparkles, X } from "lucide-react";
import "./GlobalCopilot.css";

const fallbackPrompts = [
  "Which vehicles need attention?",
  "Find unusual fuel consumption",
  "Give me a fleet health summary",
  "Show me idle vehicles",
];

function getLiveForm() {
  const versions = JSON.parse(localStorage.getItem("fleetos-trip-form-versions") || "null") || [{ id: 1, name: "Trip intake", version: 1, status: "Published", fields: [
    { id: "vehicleId", label: "Vehicle", required: true },
    { id: "driver", label: "Driver", required: true },
    { id: "origin", label: "Origin", required: true },
    { id: "destination", label: "Destination", required: true },
  ] }];
  const liveId = Number(localStorage.getItem("fleetos-trip-form-live-version"));
  return versions.find((version) => version.id === liveId && version.status === "Published")
    || versions.filter((version) => version.status === "Published").sort((a, b) => b.version - a.version)[0]
    || versions[0];
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

function GlobalCopilot() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);

  async function ask(question = prompt) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    const form = getLiveForm();
    const trip = extractTripRequest(cleanQuestion, form);
    let answer;

    if (trip) {
      answer = trip.missing.length
        ? `I found a trip creation request, but it is missing required fields: ${trip.missing.join(", ")}. Please include them using the active form labels.`
        : `I matched all required fields to live form v${form.version} (${form.name}). Authorization is required before creating this trip.`;
    } else {
      answer = "I can help you inspect live fleet activity, trips, fuel, alerts, maintenance, drivers, or analytics.";
      try {
        const response = await fetch("http://127.0.0.1:5087/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: cleanQuestion }),
        });
        if (response.ok) {
          const payload = await response.json();
          answer = payload.answer || answer;
        }
      } catch {
        // Keep the local response when the API is unavailable.
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
      <div className="global-copilot-body">
        {!messages.length && <div className="copilot-empty"><Bot size={16} /><p>Ask about your fleet or create a trip using the active form labels.</p></div>}
        <div className="copilot-prompts">{fallbackPrompts.map((item) => <button key={item} onClick={() => ask(item)}>{item}</button>)}</div>
        {messages.map((message, index) => <div className="global-message" key={`${message.question}-${index}`}><div className="global-question"><MessageSquare size={12} /> {message.question}</div><div className="global-answer"><Bot size={15} /><span>{message.answer}</span></div></div>)}
      </div>
      <form className="global-copilot-form" onSubmit={(event) => { event.preventDefault(); ask(); }}><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about your fleet..." /><button type="submit" aria-label="Send question"><Send size={15} /></button></form>
    </section>}
  </div>;
}

export default GlobalCopilot;
