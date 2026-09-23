import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BellRing,
  ClipboardList,
  CircleHelp,
  Fuel,
  LayoutDashboard,
  LogOut,
  Map,
  ShieldCheck,
  Settings,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { clearSession, getSession } from "../utils/auth";

function Sidebar() {
  const navigate = useNavigate();
  const session = getSession();
  const displayName = session?.name || "Fleet manager";
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = session?.role === "super-admin" ? "Super Admin" : session?.role === "driver" ? "Driver" : "Fleet manager";
  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Live fleet", path: "/live-fleet", icon: Map },
    { name: "Vehicles", path: "/vehicles", icon: Truck },
    { name: "Drivers", path: "/drivers", icon: Users },
    { name: "Trips", path: "/trips", icon: Activity },
    { name: "Fuel intelligence", path: "/fuel", icon: Fuel },
    { name: "Maintenance", path: "/maintenance", icon: Wrench },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark"><span /></div>
        <div><strong>fleet<span>os</span></strong><small>OPERATIONS CLOUD</small></div>
      </div>
      <div className="workspace-switcher">
        <span className="workspace-dot" />
        <div><strong>Northstar Logistics</strong><small>Fleet workspace</small></div>
        <span className="chevron">⌄</span>
      </div>

      <nav className="main-nav">
        <p className="nav-label">Command center</p>
        {menuItems.map((item) => (
          <NavLink key={item.name} to={item.path} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <item.icon size={17} strokeWidth={1.8} />
            {item.name}
          </NavLink>
        ))}
        <p className="nav-label secondary-label">Workspace</p>
        <NavLink to="/alerts" className="nav-item"><BellRing size={17} strokeWidth={1.8} /> Alerts <span className="nav-count">8</span></NavLink>
        <NavLink to="/analytics" className="nav-item"><BarChart3 size={17} strokeWidth={1.8} /> Analytics</NavLink>
        <NavLink to="/trip-form-builder" className="nav-item"><ClipboardList size={17} strokeWidth={1.8} /> Form builder</NavLink>
        {session?.role === "super-admin" && <button className="nav-item sidebar-nav-button" onClick={() => window.dispatchEvent(new CustomEvent("fleetos:open-copilot-permissions"))}><ShieldCheck size={17} strokeWidth={1.8} /> Copilot access</button>}
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-item"><Settings size={17} strokeWidth={1.8} /> Settings</NavLink>
        <NavLink to="/help" className="nav-item"><CircleHelp size={17} strokeWidth={1.8} /> Help center</NavLink>
        <div className="sidebar-user"><div className="avatar avatar-small">{initials}</div><div><strong>{displayName}</strong><small>{roleLabel}</small></div><span className="online-dot" /></div>
        <button className="sidebar-signout" onClick={() => { clearSession(); navigate("/login", { replace: true }); }}><LogOut size={15} /> Sign out</button>
      </div>
    </aside>
  );
}

export default Sidebar;