import React, { useEffect, useRef, useState } from "react";
import { Bell, X, Clock } from "lucide-react";
// import api from "../pages/ApplicationAPI";
import { useNavigate } from "react-router-dom";
// ...existing code... (userManagementAPI no longer needed here)

const Topbar = ({ title, subtitle }) => {
  var name;
  var email;
  const [notifCount, setNotifCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState([]); // persisted on server
  // show all notifications in dropdown; no pagination here
  const dropdownRef = useRef(null);
  const notificationsRef = useRef([]);
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 w-full">
      {/* Left Section */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm font-semibold text-[#30BC69]">{subtitle}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Live Updates */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#EEFDF7] rounded-full text-[#4A8C66] text-[15px] font-medium shadow-sm">
          {/* Icon with pulse effect */}
          <div className="relative flex items-center justify-center w-8 h-8">
            {/* Outer pulsing rings */}
            <span className="absolute inline-flex h-6 w-6 rounded-full bg-[#4A8C66] opacity-20 animate-ping"></span>
            <span className="absolute inline-flex h-8 w-8 rounded-full bg-[#4A8C66] opacity-10 animate-ping"></span>

            {/* Center SVG icon */}
            <svg
              width="18"
              height="17"
              viewBox="0 0 18 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 relative text-[#4A8C66] animate-pulse"
            >
              <path d="M2.85859 12.9195C2.02734 12.0883 1.38947 11.1439 0.94497 10.0863C0.50047 9.0287 0.277928 7.91686 0.277345 6.75078C0.276762 5.5847 0.499303 4.47286 0.94497 3.41528C1.39064 2.3577 2.02851 1.41328 2.85859 0.582031L3.9086 1.63203C3.22318 2.31745 2.69468 3.10145 2.32309 3.98403C1.95151 4.86661 1.76543 5.78886 1.76484 6.75078C1.76426 7.7127 1.95034 8.63524 2.32309 9.51841C2.69584 10.4016 3.22434 11.1853 3.9086 11.8695L2.85859 12.9195ZM4.8711 10.907C4.31693 10.3529 3.89401 9.71849 3.60234 9.00391C3.31068 8.28932 3.16484 7.53828 3.16484 6.75078C3.16484 5.96328 3.31068 5.21224 3.60234 4.49766C3.89401 3.78307 4.31693 3.1487 4.8711 2.59453L5.92109 3.64453C5.49818 4.06745 5.18084 4.5452 4.9691 5.07778C4.75735 5.61036 4.65176 6.16803 4.65235 6.75078C4.65293 7.33353 4.7588 7.89149 4.96997 8.42466C5.18114 8.95782 5.49818 9.43528 5.92109 9.85703L4.8711 10.907ZM8.15234 16.3758V8.76328C7.75859 8.58828 7.44126 8.31849 7.20034 7.95391C6.95943 7.58932 6.83926 7.18828 6.83985 6.75078C6.83985 6.13828 7.0513 5.62057 7.47422 5.19766C7.89714 4.77474 8.41484 4.56328 9.02734 4.56328C9.63984 4.56328 10.1576 4.77474 10.5805 5.19766C11.0034 5.62057 11.2148 6.13828 11.2148 6.75078C11.2148 7.18828 11.0944 7.58932 10.8535 7.95391C10.6126 8.31849 10.2955 8.58828 9.90234 8.76328V16.3758H8.15234ZM13.1836 10.907L12.1336 9.85703C12.5565 9.43411 12.8738 8.95636 13.0856 8.42378C13.2973 7.8912 13.4029 7.33353 13.4023 6.75078C13.4018 6.16803 13.2959 5.61036 13.0847 5.07778C12.8736 4.5452 12.5565 4.06745 12.1336 3.64453L13.1836 2.59453C13.7378 3.1487 14.1607 3.78307 14.4523 4.49766C14.744 5.21224 14.8898 5.96328 14.8898 6.75078C14.8898 7.53828 14.744 8.28932 14.4523 9.00391C14.1607 9.71849 13.7378 10.3529 13.1836 10.907ZM15.1961 12.9195L14.1461 11.8695C14.8315 11.1841 15.3603 10.4004 15.7325 9.51841C16.1046 8.63641 16.2904 7.71386 16.2898 6.75078C16.2893 5.7877 16.1032 4.86545 15.7316 3.98403C15.36 3.10261 14.8315 2.31861 14.1461 1.63203L15.1961 0.582031C16.0273 1.41328 16.6655 2.3577 17.1106 3.41528C17.5557 4.47286 17.7779 5.5847 17.7773 6.75078C17.7768 7.91686 17.5542 9.02899 17.1097 10.0872C16.6652 11.1453 16.0273 12.0894 15.1961 12.9195Z" fill="currentColor" />
            </svg>
          </div>

          {/* Label */}
          <span className="whitespace-nowrap">Live Updates</span>

          {/* Status dot */}
          <span className="w-2.5 h-2.5 bg-[#8DDEA4] rounded-full"></span>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between px-5 py-1 rounded-xl bg-[#EFF6FE] w-auto">
          {/* Text */}
          <div className="flex flex-col items-end">
            <span className="self-start text-[15px] font-semibold text-[#2A2A2A]">
              {name}
            </span>
            <span className="text-[11px] font-medium text-[#6F7277]">
              {email}
            </span>
          </div>
          {/* Profile Box with Status Dot */}
          <div className="relative w-[46px] h-[40px] bg-white rounded-[10px] flex items-center justify-center">
            <div className="w-[42px] h-[36px] bg-[#EBEBEB] rounded-[10px]" />
            <span className="absolute -bottom-1 -right-1 w-[15px] h-[15px] bg-white rounded-full flex items-center justify-center">
              <span className="w-[11px] h-[11px] bg-[#30BC69] rounded-full"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
