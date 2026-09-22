import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bot, CheckCircle2, ChevronRight, CircleAlert, Clock3, Fuel, MapPin, MessageSquare, MoreHorizontal, RefreshCw, Send, Sparkles, TriangleAlert, Wrench } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSession } from "../utils/auth";

const fallbackFleet = [
  { id: "VH-204", plate: "UP32 AB 1234", status: "On trip", driver: "Maya Patel", speed: 64, fuel: 71, color: "#f2a93b" },
  { id: "VH-118", plate: "DL01 MJ 7712", status: "Idle", driver: "Noah Williams", speed: 0, fuel: 38, color: "#8b98aa" },
  { id: "VH-087", plate: "MH12 RT 4409", status: "On trip", driver: "Arjun Rao", speed: 52, fuel: 84, color: "#f2a93b" },
  { id: "VH-331", plate: "KA05 NK 9081", status: "Attention", driver: "Sofia Chen", speed: 0, fuel: 19, color: "#f05c68" },
];
const fallbackUtilization = [{ day: "Mon", trips: 58, idle: 19 }, { day: "Tue", trips: 66, idle: 15 }, { day: "Wed", trips: 62, idle: 22 }, { day: "Thu", trips: 74, idle: 13 }, { day: "Fri", trips: 81, idle: 17 }, { day: "Sat", trips: 71, idle: 12 }, { day: "Sun", trips: 48, idle: 9 }];
const fallbackFuelTrend = [{ day: "01", value: 7.4 }, { day: "05", value: 7.1 }, { day: "09", value: 7.5 }, { day: "13", value: 7.8 }, { day: "17", value: 8.2 }, { day: "21", value: 7.9 }, { day: "25", value: 8.5 }, { day: "29", value: 8.1 }];
const fallbackStatus = [{ name: "On trip", value: 24, color: "#e8a13a" }, { name: "Available", value: 11, color: "#4dc4a0" }, { name: "Idle", value: 7, color: "#8391a5" }, { name: "Attention", value: 3, color: "#e76872" }];
const fallbackAnswers = {
  "Which vehicles need attention?": "I found 3 vehicles that need attention. VH-331 is low on fuel at 19% and has an overdue service. VH-204 and VH-087 are showing fuel consumption above the fleet baseline.",
  "Find unusual fuel consumption": "Fuel efficiency is 8.1 L/100km this month, 7.2% above the fleet baseline. VH-204 is the largest outlier at 9.6 L/100km, followed by VH-087 at 9.1 L/100km.",
  "Give me a fleet health summary": "Fleet utilization is healthy at 74%. 24 vehicles are currently on trips, while 3 vehicles require attention. The main risks are elevated fuel consumption in 2 vehicles and one overdue maintenance record.",
  "Show me idle vehicles": "7 vehicles are currently idle. VH-118 has been stationary for 2h 14m, making it the longest idle vehicle. Estimated avoidable idle cost today is $184.",
};

function Dashboard() {
  const session = getSession();
  const userName = session?.name || "Sushant";
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [livePulse, setLivePulse] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [localActiveTrips, setLocalActiveTrips] = useState(() => JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]").filter((trip) => trip.status !== "Completed").length);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
      setLivePulse((value) => (value + 1) % 3);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleTripCreated = () => setLocalActiveTrips(JSON.parse(localStorage.getItem("fleetos-copilot-trips") || "[]").filter((trip) => trip.status !== "Completed").length);
    window.addEventListener("fleetos:trip-created", handleTripCreated);
    return () => window.removeEventListener("fleetos:trip-created", handleTripCreated);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5087/api/dashboard");
        if (!response.ok) throw new Error("Unable to fetch dashboard data");
        const result = await response.json();
        setDashboard(result);
      } catch {
        setDashboard(null);
      }
    };

    loadDashboard();
  }, []);

  const liveFleet = useMemo(() => {
    const fleet = dashboard?.liveVehicles ?? fallbackFleet;
    return fleet.map((vehicle, index) => ({
      ...vehicle,
      speed: typeof vehicle.speed === "number" ? vehicle.speed + ((livePulse + index) % 3) - 1 : 0,
    }));
  }, [dashboard, livePulse]);

  const utilization = dashboard?.utilization ?? fallbackUtilization;
  const fuelTrend = dashboard?.fuelTrend ?? fallbackFuelTrend;
  const statusData = dashboard?.statusBreakdown ?? fallbackStatus;
  const activeTripCount = Number(dashboard?.kpis?.[1]?.value ?? 3) + localActiveTrips;

  async function askCopilot(question = prompt) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    const normalizedQuestion = cleanQuestion.toLowerCase();
    const isGreeting = normalizedQuestion === "hi" || normalizedQuestion === "hello" || normalizedQuestion === "hey";
    let answer = isGreeting
      ? "Hello. I can help with live vehicles, open alerts, maintenance schedules, trips, fuel efficiency, and fleet health. What would you like to inspect?"
      : fallbackAnswers[cleanQuestion] || "I can analyze the live fleet data. Try asking about fuel consumption, idle vehicles, fleet health, or vehicles that need attention.";

    try {
      const response = await fetch("http://127.0.0.1:5087/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload.answer && !isGreeting) {
          answer = payload.answer;
        }
      }
    } catch {
      answer = isGreeting ? "Hello. I can help with live vehicles, open alerts, maintenance schedules, trips, fuel efficiency, and fleet health. What would you like to inspect?" : fallbackAnswers[cleanQuestion] || answer;
    }

    setMessages((current) => [...current, { question: cleanQuestion, answer }]);
    setPrompt("");
    setCopilotOpen(true);
  }

  return <div className="dashboard-page">
    <div className="page-heading"><div><p className="eyebrow">MONDAY, 22 SEPTEMBER 2026</p><h1>Good morning, {userName} <span>✦</span></h1><p className="heading-subtitle">Here&apos;s what&apos;s happening across your fleet today.</p></div><div className="heading-actions"><span className="sync-status"><i /> Live data <span>·</span> Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><button className="outline-button" onClick={() => setLastUpdated(new Date())}><RefreshCw size={15} /> Refresh</button></div></div>
    <section className="kpi-grid"><KpiCard label="Total vehicles" value={dashboard?.kpis?.[0]?.value ?? "45"} change={dashboard?.kpis?.[0]?.change ?? "4.8%"} note={dashboard?.kpis?.[0]?.note ?? "vs last month"} icon={<TruckIcon />} tone="blue" /><KpiCard label="On active trips" value={activeTripCount} change={dashboard?.kpis?.[1]?.change ?? "12.5%"} note={dashboard?.kpis?.[1]?.note ?? "vs yesterday"} icon={<MapPin size={18} />} tone="amber" /><KpiCard label="Fleet utilization" value={dashboard?.kpis?.[2]?.value ?? "74.2%"} change={dashboard?.kpis?.[2]?.change ?? "3.1%"} note={dashboard?.kpis?.[2]?.note ?? "vs last week"} icon={<ActivityIcon />} tone="green" /><KpiCard label="Open alerts" value={dashboard?.kpis?.[3]?.value ?? "08"} change={dashboard?.kpis?.[3]?.change ?? "2 new"} note={dashboard?.kpis?.[3]?.note ?? "needs attention"} icon={<TriangleAlert size={18} />} tone="red" inverse /></section>
    <section className="dashboard-grid top-grid"><article className="panel utilization-panel"><PanelHeader title="Fleet utilization" subtitle="Trips completed across the last 7 days" action="View analytics" /><div className="chart-legend"><span><i className="legend-dot amber-dot" />Active trips</span><span><i className="legend-dot slate-dot" />Idle hours</span><strong>{dashboard?.kpis?.[2]?.value ?? "74.2%"} <small>avg. utilization</small></strong></div><div className="large-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={utilization} barGap={5} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e9edf2" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8792a2", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8792a2", fontSize: 11 }} /><Tooltip cursor={{ fill: "#f7f8fa" }} contentStyle={{ border: "0", borderRadius: "8px" }} /><Bar dataKey="trips" fill="#e8a13a" radius={[4, 4, 0, 0]} barSize={14} /><Bar dataKey="idle" fill="#dfe5ed" radius={[4, 4, 0, 0]} barSize={14} /></BarChart></ResponsiveContainer></div></article><article className="panel status-panel"><PanelHeader title="Fleet status" subtitle="Current vehicle distribution" action="View fleet" /><div className="donut-wrap"><ResponsiveContainer width="184" height="184"><PieChart><Pie data={statusData} dataKey="value" innerRadius={63} outerRadius={82} paddingAngle={3} stroke="none" startAngle={90} endAngle={-270}>{statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>{dashboard?.kpis?.[0]?.value ?? "45"}</strong><span>vehicles</span></div></div><div className="status-legend">{statusData.map((status) => <div key={status.name}><span><i style={{ background: status.color }} />{status.name}</span><strong>{status.value}</strong></div>)}</div></article></section>
    <section className="dashboard-grid middle-grid"><article className="panel fuel-panel"><PanelHeader title="Fuel efficiency" subtitle="Average consumption, current month" action="View report" /><div className="fuel-summary"><strong>8.1 <small>L / 100 km</small></strong><span className="positive"><ArrowUpRight size={14} /> 7.2% <em>above baseline</em></span></div><div className="sparkline-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={fuelTrend} margin={{ top: 12, right: 2, left: 2, bottom: 0 }}><defs><linearGradient id="fuelFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8a13a" stopOpacity={0.24} /><stop offset="100%" stopColor="#e8a13a" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#98a1af", fontSize: 10 }} /><YAxis hide domain={[6, 10]} /><Tooltip contentStyle={{ border: "0", borderRadius: "8px" }} /><Area type="monotone" dataKey="value" stroke="#e8a13a" strokeWidth={2.5} fill="url(#fuelFill)" /></AreaChart></ResponsiveContainer></div></article><article className="panel attention-panel"><PanelHeader title="Needs attention" subtitle="Items that need your review" action="View all" /><div className="attention-list"><AttentionItem icon={<Fuel size={16} />} tone="amber" title="Fuel anomaly detected" detail="VH-204 · 18% above baseline" /><AttentionItem icon={<Wrench size={16} />} tone="red" title="Maintenance overdue" detail="VH-331 · Service due 3 days ago" /><AttentionItem icon={<Clock3 size={16} />} tone="slate" title="Extended idle time" detail="VH-118 · Idle for 2h 14m" /></div></article></section>
    <section className="dashboard-grid bottom-grid"><article className="panel live-panel"><PanelHeader title="Live fleet activity" subtitle={<><span className="live-indicator"><i /> Live</span> Vehicles currently transmitting</>} action="Open live map" /><div className="live-table"><div className="table-head"><span>Vehicle</span><span>Driver</span><span>Status</span><span>Speed</span><span>Fuel</span><span /></div>{liveFleet.map((vehicle) => <div className="vehicle-row" key={vehicle.id}><div className="vehicle-name"><div className="vehicle-icon" style={{ background: `${vehicle.color}22`, color: vehicle.color }}><TruckIcon /></div><div><strong>{vehicle.id}</strong><small>{vehicle.plate}</small></div></div><span className="driver-name">{vehicle.driver}</span><span className={`status-pill ${vehicle.status.toLowerCase().replace(" ", "-")}`}><i />{vehicle.status}</span><span className="speed-value">{vehicle.speed ? `${vehicle.speed} km/h` : "—"}</span><div className="fuel-meter"><span><i style={{ width: `${vehicle.fuel}%`, background: vehicle.fuel < 25 ? "#e76872" : "#4dc4a0" }} /></span><small>{vehicle.fuel}%</small></div><button className="row-action" aria-label={`Open ${vehicle.id}`}><MoreHorizontal size={18} /></button></div>)}</div></article><article className="panel activity-panel"><PanelHeader title="Recent activity" subtitle="Latest fleet events" action="View log" /><div className="activity-list"><ActivityItem icon={<CircleAlert />} tone="red" title="Overspeed alert" detail="VH-087 exceeded 80 km/h" time="8 min ago" /><ActivityItem icon={<CheckCircle2 />} tone="green" title="Trip completed" detail="VH-204 · Mumbai to Pune" time="21 min ago" /><ActivityItem icon={<Wrench />} tone="amber" title="Service scheduled" detail="VH-119 · Tomorrow, 09:30" time="1 hr ago" /></div></article></section>
    <section className="copilot-banner"><div className="copilot-orbit"><Bot size={22} /></div><div className="copilot-copy"><div className="copilot-title"><span>FleetOS AI</span><i>INTELLIGENCE LAYER</i></div><h2>Your fleet has a story. Ask anything.</h2><p>{dashboard?.fleetSummary ?? "Query live operations, uncover anomalies, and make better decisions with AI that knows your fleet."}</p></div><div className="copilot-input"><Sparkles size={17} /><input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => event.key === "Enter" && askCopilot()} onFocus={() => setCopilotOpen(true)} placeholder="Ask about your fleet..." /><button onClick={() => askCopilot()} aria-label="Ask FleetOS AI"><Send size={17} /></button></div><button className="copilot-expand" onClick={() => setCopilotOpen((value) => !value)}>{copilotOpen ? "Close copilot" : "Open copilot"}<ChevronRight size={15} /></button></section>
    {copilotOpen && <section className="copilot-drawer panel"><div className="drawer-heading"><div><div className="copilot-title"><span>FleetOS AI</span><i>GROUNDED IN YOUR DATA</i></div><h2>Fleet intelligence, on demand.</h2></div><button className="icon-button" onClick={() => setCopilotOpen(false)} aria-label="Close copilot">×</button></div><div className="suggestion-row">{Object.keys(fallbackAnswers).map((suggestion) => <button key={suggestion} onClick={() => askCopilot(suggestion)}>{suggestion}</button>)}</div>{messages.length > 0 && <div className="conversation">{messages.map((message, index) => <div className="conversation-item" key={`${message.question}-${index}`}><div className="user-question"><MessageSquare size={14} />{message.question}</div><div className="ai-answer"><Bot size={16} /><p>{message.answer}</p></div></div>)}</div>}</section>}
  </div>;
}
function KpiCard({ label, value, change, note, icon, tone, inverse }) { return <article className={`kpi-card ${tone}`}><div className="kpi-top"><span>{label}</span><div className="kpi-icon">{icon}</div></div><div className="kpi-value">{value}</div><div className={`kpi-change ${inverse ? "inverse" : ""}`}><strong>{change}</strong><span>{note}</span></div></article>; }
function PanelHeader({ title, subtitle, action }) { return <div className="panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="text-button" onClick={action === "Open live map" ? () => { window.location.href = "/live-fleet"; } : undefined}>{action}<ChevronRight size={14} /></button></div>; }
function AttentionItem({ icon, tone, title, detail }) { return <div className="attention-item"><div className={`event-icon ${tone}`}>{icon}</div><div><strong>{title}</strong><span>{detail}</span></div><ChevronRight size={16} /></div>; }
function ActivityItem({ icon, tone, title, detail, time }) { return <div className="activity-item"><div className={`event-icon ${tone}`}>{icon}</div><div><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>; }
function TruckIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><path d="M6.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /></svg>; }
function ActivityIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>; }
export default Dashboard;