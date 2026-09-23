import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import GlobalCopilot from "../components/GlobalCopilot";
import TodayInsights from "../components/TodayInsights";
import CopilotPermissions from "../components/CopilotPermissions";
import { getSession } from "../utils/auth";

function DashboardLayout() {
  const session = getSession();
  const [insightsOpen, setInsightsOpen] = useState(() => session?.role === "super-admin" && sessionStorage.getItem("fleetos-insights-seen") !== "true");

  useEffect(() => {
    const openInsights = () => setInsightsOpen(true);
    window.addEventListener("fleetos:open-insights", openInsights);
    return () => window.removeEventListener("fleetos:open-insights", openInsights);
  }, []);

  function closeInsights() {
    sessionStorage.setItem("fleetos-insights-seen", "true");
    setInsightsOpen(false);
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main>
        <Topbar />

        <section className="page-content">
          <Outlet />
        </section>
      </main>
      <GlobalCopilot />
      <TodayInsights open={insightsOpen} onClose={closeInsights} />
      <CopilotPermissions />
    </div>
  );
}

export default DashboardLayout;