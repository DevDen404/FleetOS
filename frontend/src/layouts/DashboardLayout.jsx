import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import GlobalCopilot from "../components/GlobalCopilot";

function DashboardLayout() {
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
    </div>
  );
}

export default DashboardLayout;