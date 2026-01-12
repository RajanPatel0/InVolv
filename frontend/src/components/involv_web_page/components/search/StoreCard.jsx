import {
  Clock,
  Phone,
  Navigation,
  Package,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function StoreCard({
  store,
  onSelect,
  onNavigate,
  index = 0,
  variant = "rich", // 👈 NEW
}) {
  const categoryColor = {
    grocery: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    electronics: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    clothing: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    general: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  };

  const isCompact = variant === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <div
        onClick={() => onSelect(store)}
        className={`group cursor-pointer rounded-2xl border bg-gradient-to-br from-[#064e3b] to-[#020617]
        transition-all hover:border-emerald-700 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)]
        ${isCompact ? "p-3" : "p-4"}
        `}
      >
        <div className="flex gap-4">
          {/* ICON */}
          <div
            className={`flex-shrink-0 rounded-xl bg-slate-900 flex items-center justify-center
            ${isCompact ? "h-14 w-14" : "h-20 w-20"}
          `}
          >
            <Package
              className={`text-slate-400 ${
                isCompact ? "h-6 w-6" : "h-8 w-8"
              }`}
            />
          </div>

          {/* CONTENT */}
          <div className="flex-1 min-w-0">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className={`truncate font-semibold text-white group-hover:text-emerald-300 transition
                  ${isCompact ? "text-sm" : "text-base"}
                `}
                >
                  {store.storeName}
                </h3>

                <span
                  className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs
                  ${
                    categoryColor[store.category] ||
                    categoryColor.general
                  }`}
                >
                  {store.category || "general"}
                </span>
              </div>

              {!isCompact && (
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-400 transition" />
              )}
            </div>

            {/* PRODUCT */}
            <div
              className={`mt-2 rounded-lg bg-emerald-500
              ${isCompact ? "p-2" : "p-3"}
            `}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`font-medium text-white truncate
                  ${isCompact ? "text-sm" : "text-base"}
                `}
                >
                  {store.product.name}
                </span>

                <span
                  className={`font-bold text-white
                  ${isCompact ? "text-sm" : "text-lg"}
                `}
                >
                  ₹{store.product.price}
                </span>
              </div>

              <p className="text-xs text-white/90">
                {store.product.stock} in stock
              </p>
            </div>

            {/* META (hide in compact) */}
            {!isCompact && (
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/90">
                {store.openingHours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {store.openingHours}
                  </span>
                )}
                {store.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {store.phone}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.(store);
          }}
          className={`mt-3 w-full rounded-xl font-medium transition active:scale-[0.98]
          ${
            isCompact
              ? "py-2 text-sm bg-white text-black hover:bg-emerald-500"
              : "py-2.5 text-sm bg-white text-black hover:bg-emerald-600"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Navigation className="h-4 w-4" />
            Get Directions
          </span>
        </button>
      </div>
    </motion.div>
  );
}
