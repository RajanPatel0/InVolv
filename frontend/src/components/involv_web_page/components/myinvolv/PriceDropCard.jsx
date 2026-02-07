import { TrendingDown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CancelConfirmModal from "./CancelConfirmModal.jsx";

export default function PriceDropCard({ intent, onCancel, index = 0 }) {
  const navigate = useNavigate();
  const triggered = intent.status === "TRIGGERED";
  const [showConfirm, setShowConfirm] = useState(false);

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
            transition-all duration-300 p-4
            ${triggered
              ? "bg-gradient-to-br from-sky-700/30 to-[#020617] border-sky-400/50 hover:border-sky-300/70 hover:shadow-lg hover:shadow-sky-500/15"
              : "bg-gradient-to-br from-slate-800/40 to-[#020617] border-slate-600/50 hover:border-slate-500/70 hover:shadow-lg hover:shadow-slate-500/10"
            }
          `}
        >
          {/* LEFT ACCENT STRIP */}
          <div className={`absolute inset-y-4 left-0 w-1 rounded-full
            ${triggered ? "bg-sky-400" : "bg-slate-500"}`} />

          <div className="flex flex-col gap-3">
            {/* HEADER */}
            <div className="flex justify-between items-start gap-2 pr-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm group-hover:text-sky-300 transition">
                  {intent.productId.pdtName}
                </h3>
                <p className={`text-xs mt-1.5 ${triggered ? "text-sky-300/80" : "text-slate-300/80"}`}>
                  {triggered ? "Price Update Detected" : "Monitoring Price Changes"}
                </p>
              </div>

              <span className={`rounded-full text-xs px-2.5 py-1 border font-medium flex-shrink-0 whitespace-nowrap
                ${triggered
                  ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
                  : "bg-slate-500/20 text-slate-300 border-slate-400/40"
                }`}>
                {triggered ? "🎉 Dropped" : "Monitoring"}
              </span>
            </div>

            {/* PRICE BANNER */}
            <div className={`rounded-xl p-3 ${
              triggered 
                ? "bg-gradient-to-r from-sky-500/80 to-sky-600/60" 
                : "bg-gradient-to-r from-slate-700/50 to-slate-800/50"
            }`}>
              <div className="flex justify-between items-center gap-2">
                <span className="text-white font-bold text-base">
                  ₹{intent.productId.price}
                </span>
                <span className="text-xs text-white/90 bg-black/20 px-2 py-1 rounded-lg">
                  {intent.productId.stock} available
                </span>
              </div>
            </div>

            {/* STATUS INFO */}
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium
                ${triggered ? "text-sky-300" : "text-slate-300"}`}>
                <TrendingDown className="h-4 w-4 flex-shrink-0" />
                <span>Price Alert Active</span>
              </div>
              {triggered && (
                <span className="text-xs text-sky-300 font-semibold animate-pulse">✓ Notified</span>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate(`/store/${intent.storeId?._id || '#'}`)}
                className={`flex-1 rounded-lg text-sm font-medium py-2.5
                transition-all duration-200 active:scale-[0.98]
                flex items-center justify-center gap-2
                ${triggered
                  ? "bg-sky-500 text-white hover:bg-sky-400"
                  : "bg-slate-700 text-white hover:bg-slate-600"
                }`}
              >
                View Store
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleCancelClick}
                className={`rounded-lg px-3 py-2.5 border
                transition-all duration-200 active:scale-[0.95]
                ${triggered
                  ? "border-sky-400/40 text-sky-300 hover:bg-sky-500/10 hover:border-sky-400/60"
                  : "border-slate-500/40 text-slate-300 hover:bg-slate-500/10 hover:border-slate-400/60"
                }`}
                title="Remove Alert"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <CancelConfirmModal
        show={showConfirm}
        type="PRICE_DROP"
        productName={intent.productId.pdtName}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
