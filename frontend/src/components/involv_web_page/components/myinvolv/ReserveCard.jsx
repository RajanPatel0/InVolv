import { motion } from "framer-motion";
import { Clock, Store, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CancelConfirmModal from "./CancelConfirmModal.jsx";

export default function ReserveCard({ intent, onCancel, index = 0 }) {
  const navigate = useNavigate();
  const { productId, storeId, expiresAt } = intent;
  const [showConfirm, setShowConfirm] = useState(false);

  const formatRemainingTime = (expiresAt) => {
    const diff = new Date(expiresAt) - Date.now();
    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const remainingTime = formatRemainingTime(expiresAt);
  const isExpiringSoon = new Date(expiresAt) - Date.now() < 2 * 60 * 60 * 1000;

  const handleCancelClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
    onCancel(intent._id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.04 }}
        className="relative flex-shrink-0 w-full md:w-auto"
      >
        <div
          className={`
            relative group cursor-pointer rounded-2xl border
            bg-gradient-to-br from-[#064e3b] to-[#020617]
            transition-all duration-300 p-4
            border-emerald-400/40
            hover:border-emerald-300/60
            hover:shadow-lg hover:shadow-emerald-500/15
          `}
        >
          {/* LEFT ACCENT STRIP */}
          <div className="absolute inset-y-4 left-0 w-1 rounded-full bg-emerald-400" />

          <div className="flex flex-col gap-3">
            {/* HEADER */}
            <div className="flex justify-between items-start gap-2 pr-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm group-hover:text-emerald-300 transition">
                  {productId.pdtName}
                </h3>
                <p className="text-xs text-emerald-300/80 flex items-center gap-1 mt-1.5">
                  <Store className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{storeId.storeName}</span>
                </p>
              </div>

              <span className={`rounded-full text-xs px-2.5 py-1 border font-medium flex-shrink-0 whitespace-nowrap
                ${isExpiringSoon 
                  ? "bg-orange-500/20 text-orange-300 border-orange-400/40" 
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                }`}>
                Reserved
              </span>
            </div>

            {/* PRODUCT INFO BANNER */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-500/80 to-emerald-600/60 p-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-white font-bold text-base">
                  ₹{productId.price}
                </span>
                <span className="text-xs text-white/90 bg-black/20 px-2 py-1 rounded-lg">
                  {productId.stock} in stock
                </span>
              </div>
            </div>

            {/* TIME REMAINING */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-emerald-300/90">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">
                  {remainingTime}
                </span>
              </div>
              {isExpiringSoon && remainingTime !== "Expired" && (
                <span className="text-xs text-orange-300 font-semibold">⚠ Expiring Soon</span>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate(`/store/${storeId._id}`)}
                className={`flex-1 rounded-lg bg-white text-black text-sm font-medium py-2.5
                hover:bg-emerald-400 transition-all duration-200 active:scale-[0.98]
                flex items-center justify-center gap-2`}
              >
                View Store
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleCancelClick}
                className={`rounded-lg px-3 py-2.5 border border-red-400/40
                text-red-300 hover:bg-red-500/10 hover:border-red-400/60
                transition-all duration-200 active:scale-[0.95]`}
                title="Cancel Reservation"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <CancelConfirmModal
        show={showConfirm}
        type="RESERVE"
        productName={productId.pdtName}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
