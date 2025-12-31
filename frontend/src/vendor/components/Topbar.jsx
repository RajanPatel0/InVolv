import React from "react";
import { Bell } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Topbar = ({ title, subtitle }) => {
  const name = "Vendor Name";
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white border-b border-gray-200">

      {/* ================= MOBILE TOPBAR ================= */}
      <div className="flex sm:hidden items-center justify-between h-[80px] px-4">
        
        {/* Left: Page title */}
        <h1 className="text-sm font-semibold text-[#000075] truncate">
          {title}
        </h1>

        {/* Right: icons */}
        <div className="flex items-center gap-4">
          
          {/* Notification */}
          <button className="relative text-gray-600">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="relative w-9 h-9 bg-[#EFF6FE] rounded-lg flex items-center justify-center"
          onClick={()=>navigate("/vendor/profile")}>
            <FaUser className="w-7 h-7 bg-[#EBEBEB] text-gray-500 rounded-lg" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-[#30BC69] rounded-full"></span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP TOPBAR ================= */}
      <div className="hidden sm:flex items-center justify-between px-6 h-[80px] bg-[#000075]">
        
        {/* Left */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 text-white">
            {title}
          </h1>
          <p className="text-sm font-semibold text-[#30BC69]">
            {subtitle}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Live Updates */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#EEFDF7] rounded-full text-[#4A8C66] text-sm font-medium shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A8C66] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A8C66]"></span>
            </span>
            <span>Live Updates</span>
          </div>

          {/* Notification */}
          <button className="relative text-white cursor-pointer hover:text-green-300">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 bg-[#EFF6FE] px-3 py-1.5 rounded-xl cursor-pointer">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-[#2A2A2A]">
                {name}
              </span>
              <span className="text-xs text-[#6F7277]">
                vendor@email.com
              </span>
            </div>

            <div className="relative w-9 h-9 bg-white rounded-lg flex items-center justify-center"
            onClick={()=> navigate("/vendor/profile")}>
              <FaUser className="w-8 h-8 bg-[#EBEBEB] text-gray-500 rounded-lg" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-[#30BC69] rounded-full"></span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Topbar;
