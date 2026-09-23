import { Bell, Search } from "lucide-react";

function Topbar() {
  return (
    <header className="topbar">
      <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>Overview</strong></div>

      <div className="topbar-actions">
        <label className="search-box"><Search size={16} /><input placeholder="Search fleet, trips, alerts..." /><kbd>⌘ K</kbd></label>
        <button className="icon-button notification-button" onClick={() => window.dispatchEvent(new CustomEvent("fleetos:open-insights"))} aria-label="Open notifications"><Bell size={18} /><i /></button>
        <div className="topbar-divider" />
      </div>
    </header>
  );
}

export default Topbar;      