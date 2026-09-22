import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BellRing,
  CircleHelp,
  Fuel,
  LayoutDashboard,
  Map,
  Settings,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Live fleet", path: "/vehicles", icon: Map },
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
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-item"><Settings size={17} strokeWidth={1.8} /> Settings</NavLink>
        <NavLink to="/help" className="nav-item"><CircleHelp size={17} strokeWidth={1.8} /> Help center</NavLink>
        <div className="sidebar-user"><div className="avatar avatar-small">AK</div><div><strong>Alex Kim</strong><small>Fleet manager</small></div><span className="online-dot" /></div>
      </div>
    </aside>
  );
}

export default Sidebar;