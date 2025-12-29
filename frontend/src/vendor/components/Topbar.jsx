import React from "react";
import { Bell } from "lucide-react";

const Topbar = ({ title, subtitle }) => {
  const name = "Vendor Name";
  const email = "vendor@email.com";

  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        {/* LEFT: Title */}
        <div>
          <h1 className="text-base sm:text-xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#30BC69]">
            {subtitle}
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">

          {/* Live Updates (hide on phone) */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#EEFDF7] rounded-full text-[#4A8C66] text-sm font-medium shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A8C66] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A8C66]"></span>
            </span>
            <span>Live Updates</span>
          </div>

          {/* Notification */}
          <button className="relative text-gray-600 hover:text-gray-900">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 bg-[#EFF6FE] px-3 py-1.5 rounded-xl">
            
            {/* Text (hide on phone) */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-[#2A2A2A]">
                {name}
              </span>
              <span className="text-xs text-[#6F7277]">
                {email}
              </span>
            </div>

            {/* Avatar */}
            <div className="relative w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-[#EBEBEB] rounded-lg" />
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
