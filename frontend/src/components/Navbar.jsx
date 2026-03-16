import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Search, Bell} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationPopup from "./involv_web_page/components/NotificationPopup.jsx";
import NotificationBadge from "./involv_web_page/components/NotificationBadge.jsx";
import useNotificationStore from "../api/stores/notificationStore.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Get notification store
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    setMounted(true);
    // Fetch unread count only when user is logged in
    const token = localStorage.getItem("accessToken");
    if (token && token.trim().length > 0) {
      fetchUnreadCount();

      // Refresh count every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount]);

  const handleNotificationBellClick = () => {
    setShowNotificationPopup(!showNotificationPopup);
  };

  return (
    <>
      <nav className="w-full bg-white text-white shadow-lg sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo + InVolv */}
          <div className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo.png"
              alt="InVolv Logo"
              className="h-10 w-10 select-none"
            />
            <div className="flex flex-col items-start">
              <p className="font-bold text-xl text-black">InVolv</p>
              <p className="text-sm font-[500] text-black">Not So Far</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center text-sm font-[700] gap-8">
            <Link to="/" className="flex items-center gap-1 text-black hover:text-emerald-400 transition"><Home size={20} />Home</Link>
            <Link to="/search" className="flex items-center gap-1 text-black hover:text-emerald-400 transition"><Search size={20} />Search</Link>
            {localStorage.getItem("accessToken") ? (
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                {mounted && (
                  <button
                    onClick={handleNotificationBellClick}
                    className="relative p-2 rounded-lg bg-slate-200 transition hover:text-black text-emerald-400"
                    title="Notifications"
                  >
                    <Bell size={20} />
                    <NotificationBadge count={unreadCount} variant="dot" />
                  </button>
                )}
                
                <Link to="/myinvolv" className="flex items-center gap-1 text-black hover:text-emerald-400 transition">
                  My InVolv
                </Link>
              </div>
            ) : (
              <button 
                onClick={() => navigate("/userSignIn")}
                className="flex items-center gap-1 text-black hover:text-emerald-400 transition cursor-pointer"
              >
                My InVolv<Bell size={20} />
              </button>
            )}

            {/* Login Button */}
            <Link
              to="/userSignIn"
              className="px-4 py-2 text-sm font-bold text-slate-800 border border-black rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition"
            >
              Login
            </Link>

            {/* Register Button */}
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-[500] rounded-lg border text-white border-[#000075] bg-slate-800 hover:bg-white hover:text-slate-800 hover:border-black transition"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-black text-3xl"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden flex flex-col gap-4 bg-white px-4 pb-4 text-white font-[500]">
            <Link to="/" className="flex items-center text-black font-bold gap-1 hover:text-emerald-400 transition" onClick={() => setOpen(false)}><Home size={20} />Home</Link>
            <Link to="/search" className="flex items-center gap-1 text-black font-bold hover:text-emerald-400 transition" onClick={() => setOpen(false)}><Search size={20} />Search</Link>
            {localStorage.getItem("accessToken") ? (
              <>
                {/* Mobile Notification Bell */}
                {mounted && (
                  <button
                    onClick={() => {
                      handleNotificationBellClick();
                      setOpen(false);
                    }}
                    className="relative rounded-lg hover:bg-slate-100 transition text-black font-bold hover:text-emerald-400 flex items-center gap-1"
                  >
                    {/* Label */}
                    <span>Notifications</span>
                    <span className="relative inline-flex bg-slate-200 p-2 rounded-lg">
                      <Bell size={20} />
                      <span className="absolute -top-1 -right-1">
                        <NotificationBadge count={unreadCount} variant="dot" />
                      </span>
                    </span>

                  </button>
                )}
                
                <Link to="/myinvolv" className="flex items-center gap-1 text-black font-bold hover:text-emerald-400 transition" onClick={() => setOpen(false)}>My InVolv</Link>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/userSignIn");
                  setOpen(false);
                }}
                className="flex items-center gap-1 text-black font-bold hover:text-emerald-400 transition"
              >
                My InVolv<Bell size={20} />
              </button>
            )}

            <Link
              to="/userSignIn"
              className="px-3 py-2 text-emerald-400 border border-white bg-black font-bold rounded-lg text-center"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-3 py-2 border border-black rounded-lg bg-white text-black font-bold text-center"
              onClick={() => setOpen(false)}
            >
              Register
            </Link>
          </div>
        )}
      </nav>

      {/* Notification Popup */}
      {mounted && (
        <NotificationPopup 
          isOpen={showNotificationPopup} 
          onClose={() => setShowNotificationPopup(false)}
        />
      )}
    </>
  );
}
