import { PackageCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CancelConfirmModal from "./CancelConfirmModal.jsx";

export default function StockChangeCard({ intent, onCancel, index = 0 }) {
  const navigate = useNavigate();
  const triggered = intent.status === "TRIGGERED";
  const stockLevel = intent.productId.stock;
  const isLowStock = stockLevel < 5;
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
              ? "bg-gradient-to-br from-purple-700/30 to-[#020617] border-purple-400/50 hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-500/15"
              : "bg-gradient-to-br from-violet-800/30 to-[#020617] border-violet-500/40 hover:border-violet-400/60 hover:shadow-lg hover:shadow-violet-500/10"
            }
          `}
        >
          {/* LEFT ACCENT STRIP */}
          <div className={`absolute inset-y-4 left-0 w-1 rounded-full
            ${triggered ? "bg-purple-400" : "bg-violet-400"}`} />

          <div className="flex flex-col gap-3">
            {/* HEADER */}
            <div className="flex justify-between items-start gap-2 pr-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm group-hover:text-purple-300 transition">
                  {intent.productId.pdtName}
                </h3>
                <p className={`text-xs mt-1.5 ${triggered ? "text-purple-300/80" : "text-violet-300/80"}`}>
                  {triggered ? "Stock Level Updated" : "Monitoring Stock Changes"}
                </p>
              </div>

              <span className={`rounded-full text-xs px-2.5 py-1 border font-medium flex-shrink-0 whitespace-nowrap
                ${triggered
                  ? "bg-purple-500/20 text-purple-300 border-purple-400/40"
                  : "bg-violet-500/20 text-violet-300 border-violet-400/40"
                }`}>
                {triggered ? "✓ Updated" : "Monitoring"}
              </span>
            </div>

            {/* STOCK BANNER */}
            <div className={`rounded-xl p-3 ${
              triggered
                ? "bg-gradient-to-r from-purple-500/80 to-purple-600/60"
                : isLowStock
                ? "bg-gradient-to-r from-orange-500/70 to-orange-600/60"
                : "bg-gradient-to-r from-violet-600/70 to-violet-700/60"
            }`}>
              <div className="flex justify-between items-center gap-2">
                <span className="text-white font-bold text-base">
                  {stockLevel} Units
                </span>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium
                  ${isLowStock ? "bg-orange-900/40 text-orange-200" : "bg-black/20 text-white/90"}`}>
                  {isLowStock ? "⚠ Low Stock" : "In Stock"}
                </span>
              </div>
            </div>

            {/* STATUS INFO */}
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium
                ${triggered ? "text-purple-300" : "text-violet-300"}`}>
                <PackageCheck className="h-4 w-4 flex-shrink-0" />
                <span>Stock Alert Active</span>
              </div>
              {triggered && (
                <span className="text-xs text-purple-300 font-semibold animate-pulse">✓ Notified</span>
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
                  ? "bg-purple-500 text-white hover:bg-purple-400"
                  : "bg-violet-600 text-white hover:bg-violet-500"
                }`}
              >
                View Product
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleCancelClick}
                className={`rounded-lg px-3 py-2.5 border
                transition-all duration-200 active:scale-[0.95]
                ${triggered
                  ? "border-purple-400/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/60"
                  : "border-violet-400/40 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400/60"
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
        type="STOCK_CHANGE"
        productName={intent.productId.pdtName}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
