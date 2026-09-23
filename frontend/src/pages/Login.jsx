import { useState } from "react";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const personas = [
  { id: "super-admin", label: "Super Admin", detail: "Full workspace access, Copilot, analytics, and configuration.", icon: ShieldCheck },
  { id: "driver", label: "Driver", detail: "Trips, assigned vehicle, and operational status.", icon: Truck },
];

function Login() {
  const navigate = useNavigate();
  const [persona, setPersona] = useState("super-admin");

  function signIn(event) {
    event.preventDefault();
    const selected = personas.find((item) => item.id === persona);
    localStorage.setItem("fleetos-session", JSON.stringify({ role: selected.id, name: selected.id === "driver" ? "Ravi Sharma" : "Sushant" }));
    sessionStorage.removeItem("fleetos-insights-seen");
    navigate("/dashboard", { replace: true });
  }

  return <main className="login-page"><section className="login-brand"><div className="login-mark"><span /></div><strong>fleet<span>os</span></strong><small>OPERATIONS CLOUD</small></section><section className="login-card"><p className="eyebrow">NORTHSTAR LOGISTICS</p><h1>Sign in to FleetOS</h1><p className="login-subtitle">Choose your workspace persona to continue.</p><form onSubmit={signIn}><div className="persona-list">{personas.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={`persona-option ${persona === item.id ? "selected" : ""}`} onClick={() => setPersona(item.id)}><span className="persona-icon"><Icon size={19} /></span><span><strong>{item.label}</strong><small>{item.detail}</small></span><i /></button>; })}</div><button className="login-submit" type="submit">Continue as {persona === "driver" ? "Driver" : "Super Admin"}<ArrowRight size={16} /></button></form><p className="login-note">Demo access · no password required</p></section></main>;
}

export default Login;
