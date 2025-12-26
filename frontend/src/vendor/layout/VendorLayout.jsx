import { Outlet, useLocation } from "react-router-dom";
import { vendorRoutes } from "./VendorRoutesConfig";
import Sidebar from "../components/SideBar";
import Topbar from "../components/Topbar";
import { useEffect, useState } from "react";

const defaultTopbar = {
  title: "Vendor Panel",
  subtitle: "Manage your platform",
};

const VendorLayout = () => {
  const location = useLocation();
  const [topbarInfo, setTopbarInfo] = useState(defaultTopbar);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    const routeInfo = vendorRoutes[location.pathname];
    setTopbarInfo(routeInfo || defaultTopbar);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed((p) => !p)}
      />

      <div
        className="flex flex-col transition-all duration-300"
        style={{
          width: isSidebarCollapsed
            ? "calc(100% - 81px)"
            : "calc(100% - 289px)",
        }}
      >
        <Topbar {...topbarInfo} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
