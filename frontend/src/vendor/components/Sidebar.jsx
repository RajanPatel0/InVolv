import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, UploadCloud, Settings } from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    to: "/vendor/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    name: "Upload",
    to: "/vendor/upload",
    icon: <UploadCloud size={18} />,
  },
  {
    name: "Settings",
    to: "/vendor/settings",
    icon: <Settings size={18} />,
  },
];

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300
        ${isCollapsed ? "w-[81px]" : "w-[289px]"}
      `}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between h-[90px] px-4 border-b">
        {!isCollapsed ? (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/vendor/dashboard")}
          >
            <img src="/logo.png" alt="InVolv" className="h-9" />
            <div className="leading-tight">
              <h1 className="text-lg font-bold text-[#000075]">InVolv IN</h1>
              <p className="text-sm font-semibold text-[#30BC69]">Vendor</p>
            </div>
          </div>
        ) : (
          <img
            src="/logo.png"
            alt="InVolv"
            className="h-8 mx-auto cursor-pointer"
            onClick={() => navigate("/vendor/dashboard")}
          />
        )}

        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg bg-[#000075] text-white text-lg hover:bg-gray-200 hover:text-[#000075] transition"
        >
          {isCollapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ name, to, icon }) => {
          const isActive = location.pathname.startsWith(to);

          return (
            <Link
              key={name}
              to={to}
              className={`flex items-center gap-4 h-[54px] px-4 rounded-lg transition-all
                ${isActive
                  ? "bg-gradient-to-r from-[#1D44B5] to-[#000075] text-white"
                  : "text-[#000075] hover:bg-gray-100"}
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <span className="flex-shrink-0">{icon}</span>
              {!isCollapsed && <span className="text-sm font-medium">{name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
