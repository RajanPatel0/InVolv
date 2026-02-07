import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Bell, TrendingDown, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { createIntent } from "../../../api/userApi/myinvolvApis.js";

const ActionCard = ({ icon: Icon, title, desc, buttontext, onClick, isLoading, colorScheme }) => {
  const colors = {
    reserve: {
      bg: "from-emerald-600/20 to-emerald-800/10",
      border: "border-emerald-500/40",
      icon: "bg-emerald-500/20 text-emerald-400",
      hover: "hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-400/60",
      badge: "bg-emerald-500"
    },
    price: {
      bg: "from-sky-600/20 to-sky-800/10",
      border: "border-sky-500/40",
      icon: "bg-sky-500/20 text-sky-400",
      hover: "hover:shadow-lg hover:shadow-sky-500/20 hover:border-sky-400/60",
      badge: "bg-sky-500"
    },
    stock: {
      bg: "from-purple-600/20 to-purple-800/10",
      border: "border-purple-500/40",
      icon: "bg-purple-500/20 text-purple-400",
      hover: "hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/60",
      badge: "bg-purple-500"
    }
  };

  const scheme = colors[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${scheme.bg} blur-lg opacity-50 -z-10`} />
      
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`group w-full rounded-2xl border ${scheme.border}
        bg-gradient-to-br from-slate-900/80 to-slate-950/50 p-5 text-left transition-all
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        ${scheme.hover}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
            ${scheme.icon} transition-transform group-hover:scale-110`}
          >
            {isLoading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Icon size={20} />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition">
              {title}
            </h3>
            <p className="mt-1 text-xs text-slate-400 group-hover:text-slate-300 transition">
              {desc}
            </p>
            <div className="mt-3">
              <span className={`inline-block px-4 py-2 rounded-lg text-xs font-medium 
                ${scheme.badge} text-white opacity-80 group-hover:opacity-100 transition cursor-pointer`}>
                {buttontext}
              </span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

const StoreActions = ({ storeId, productId, onIntentCreated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isUserLoggedIn = () => {
    const token = localStorage.getItem("accessToken");
    return token && token.trim().length > 0;
  };

  const handleIntent = async (type) => {
    // Validate that we have a valid productId
    if (!productId) {
      showToast("Product information is not available. Please refresh and try again.", "error");
      console.error("Missing productId for intent creation");
      return;
    }

    if (!isUserLoggedIn()) {
      showToast("Please login to create intents", "warning");
      navigate("/userSignIn");
      return;
    }

    setLoading(type);
    try {
      const response = await createIntent({
        storeId,
        productId,
        intentType: type,
      });

      const typeText = {
        "RESERVE": "Reservation",
        "PRICE_DROP": "Price Alert",
        "STOCK_CHANGE": "Stock Alert"
      }[type];

      showToast(`${typeText} created successfully! 🎉`, "success");

      if (onIntentCreated) {
        onIntentCreated(type);
      }

      setTimeout(() => {
        navigate("/myinvolv");
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create intent";
      showToast(errorMessage, "error");
      console.error("Intent creation error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <section
        id="store-actions"
        className="mt-12 scroll-mt-28"
      >
        <div className="rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-[#020617] p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Actions you can take
            </h2>
            <p className="text-sm text-slate-400">
              Save your intents and we'll keep you updated. No payment required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              icon={Bookmark}
              title="Reserve this Product"
              desc="We'll inform the store and hold it for 24 hours"
              buttontext="Reserve/Pre-Book"
              onClick={() => handleIntent("RESERVE")}
              isLoading={loading === "RESERVE"}
              colorScheme="reserve"
            />

            <ActionCard
              icon={TrendingDown}
              title="Notify if price drops"
              desc="Get instant alerts when the price becomes better"
              buttontext="Notify Price Drop"
              onClick={() => handleIntent("PRICE_DROP")}
              isLoading={loading === "PRICE_DROP"}
              colorScheme="price"
            />

            <ActionCard
              icon={Bell}
              title="Notify if stock changes"
              desc="Track inventory and get alerted on updates"
              buttontext="Notify Stock Changes"
              onClick={() => handleIntent("STOCK_CHANGE")}
              isLoading={loading === "STOCK_CHANGE"}
              colorScheme="stock"
            />
          </div>

          <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <p className="text-xs text-slate-300">
              💡 <span className="font-medium">Pro Tip:</span> You can manage all your intents from your MyInvolv dashboard. Create multiple intents to stay on top of your wishlist!
            </p>
          </div>
        </div>
      </section>

      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-4 right-4 z-[9999] rounded-lg border backdrop-blur-sm p-4 flex items-center gap-3
            ${toastMessage.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : ''}
            ${toastMessage.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : ''}
            ${toastMessage.type === 'warning' ? 'bg-orange-500/90 text-white border-orange-400' : ''}
          `}
        >
          <span className="text-sm font-medium">{toastMessage.message}</span>
        </motion.div>
      )}
    </>
  );
};

export default StoreActions;
