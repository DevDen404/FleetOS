import { useEffect, useState } from "react";
import { Bot, Check, ShieldCheck, X } from "lucide-react";
import { getSession } from "../utils/auth";
import "./CopilotPermissions.css";

const driverAccounts = [{ id: "driver", name: "Ravi Sharma", role: "Driver" }];

function CopilotPermissions() {
  const session = getSession();
  const [open, setOpen] = useState(false);
  const [granted, setGranted] = useState(() => localStorage.getItem("fleetos-driver-copilot-access") === "true");

  useEffect(() => {
    const openManager = () => setOpen(true);
    window.addEventListener("fleetos:open-copilot-permissions", openManager);
    return () => window.removeEventListener("fleetos:open-copilot-permissions", openManager);
  }, []);

  if (session?.role !== "super-admin") return null;

  function updatePermission(value) {
    setGranted(value);
    localStorage.setItem("fleetos-driver-copilot-access", String(value));
    window.dispatchEvent(new CustomEvent("fleetos:copilot-access-changed", { detail: { granted: value } }));
  }

  return open && <div className="copilot-permissions-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
    <section className="copilot-permissions-modal" role="dialog" aria-modal="true" aria-labelledby="copilot-permissions-title">
      <header><div className="copilot-permissions-heading"><span><ShieldCheck size={19} /></span><div><p>WORKSPACE PERMISSIONS</p><h2 id="copilot-permissions-title">Copilot access</h2></div></div><button className="copilot-permissions-close" onClick={() => setOpen(false)} aria-label="Close Copilot access"><X size={18} /></button></header>
      <div className="copilot-permissions-body"><p>Grant Copilot access to trusted drivers. They will be able to ask fleet questions, but trip creation remains restricted to Super Admins.</p>{driverAccounts.map((driver) => <div className="copilot-permission-row" key={driver.id}><div className="copilot-permission-avatar"><Bot size={17} /></div><div><strong>{driver.name}</strong><small>{driver.role}</small></div><button className={`permission-toggle ${granted ? "granted" : ""}`} onClick={() => updatePermission(!granted)} aria-pressed={granted}>{granted && <Check size={14} />}{granted ? "Access granted" : "Grant access"}</button></div>)}</div>
      <footer><span>{granted ? "1 driver has Copilot access" : "No drivers have Copilot access"}</span><button onClick={() => setOpen(false)}>Done</button></footer>
    </section>
  </div>;
}

export default CopilotPermissions;
