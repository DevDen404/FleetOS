import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, Fuel, Gauge, Route, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./Operations.css";

const fallbackAnalytics = {
  utilization: 74.2,
  fuelEfficiency: 8.1,
  fuelBaseline: 7.55,
  activeTrips: 3,
  openAlerts: 4,
  utilizationTrend: [{ day: "Mon", trips: 58, idle: 19 }, { day: "Tue", trips: 66, idle: 15 }, { day: "Wed", trips: 62, idle: 22 }, { day: "Thu", trips: 74, idle: 13 }, { day: "Fri", trips: 81, idle: 17 }, { day: "Sat", trips: 71, idle: 12 }, { day: "Sun", trips: 48, idle: 9 }],
  fuelTrend: [{ day: "01", value: 7.4 }, { day: "05", value: 7.1 }, { day: "09", value: 7.5 }, { day: "13", value: 7.8 }, { day: "17", value: 8.2 }, { day: "21", value: 7.9 }, { day: "25", value: 8.5 }, { day: "29", value: 8.1 }],
};

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    fetch("http://127.0.0.1:5087/api/analytics").then((response) => response.json()).then(setAnalytics).catch(() => setAnalytics(fallbackAnalytics));
  }, []);
  const data = analytics ?? fallbackAnalytics;
  const utilization = data.utilizationTrend;
  const fuel = data.fuelTrend;
  return <div className="operations-page">
    <PageHeading title="Fleet analytics" subtitle="A decision view across utilization, fuel, route execution, and risk." />
    <div className="ops-summary analytics-summary"><Summary icon={<Gauge />} label="Utilization" value={`${data.utilization}%`} detail="Fleet average" /><Summary icon={<Fuel />} label="Fuel efficiency" value={`${data.fuelEfficiency} L`} detail={`Baseline ${data.fuelBaseline} L / 100 km`} /><Summary icon={<Route />} label="Active trips" value={data.activeTrips} detail="Vehicles currently moving" /><Summary icon={<TrendingUp />} label="Open alerts" value={data.openAlerts} detail="Needs review" /></div>
    <div className="analytics-charts"><article className="ops-panel"><PanelTitle icon={<BarChart3 size={17} />} title="Utilization trend" detail="Trips versus idle hours" /><div className="ops-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={utilization}><CartesianGrid vertical={false} stroke="#e9edf2" /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="trips" fill="#e8a13a" radius={[4, 4, 0, 0]} /><Bar dataKey="idle" fill="#dfe5ed" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></article><article className="ops-panel"><PanelTitle icon={<Fuel size={17} />} title="Fuel efficiency" detail="Average consumption this month" /><div className="chart-callout"><strong>{data.fuelEfficiency} <small>L / 100 km</small></strong><span><ArrowUpRight size={14} /> 7.2% above baseline</span></div><div className="ops-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={fuel}><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Area type="monotone" dataKey="value" stroke="#e8a13a" fill="#e8a13a" fillOpacity={0.16} /></AreaChart></ResponsiveContainer></div></article></div>
  </div>;
}
function PageHeading({ title, subtitle }) { return <div className="ops-heading"><div><p className="eyebrow">DECISION SUPPORT</p><h1>{title}</h1><p>{subtitle}</p></div><button className="outline-button">Export report</button></div>; }
function Summary({ icon, label, value, detail }) { return <article className="ops-summary-card"><div className="summary-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function PanelTitle({ icon, title, detail }) { return <div className="ops-panel-title"><div>{icon}</div><span><strong>{title}</strong><small>{detail}</small></span></div>; }
export default Analytics;
