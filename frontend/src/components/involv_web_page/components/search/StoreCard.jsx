import {
  Clock,
  Phone,
  Navigation,
  Package,
  ChevronRight,
  Ruler
} from "lucide-react";
import { motion } from "framer-motion";

export default function StoreCard({
  store,
  onSelect,
  onNavigate,
  index = 0,
  variant = "rich",
  isSelected = false,
}) {
  const categoryColor = {
    grocery: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    electronics: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    clothing: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    general: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  };

  const isCompact = variant === "compact";

  const formatDistance = (distanceInMeters) => {
    if (distanceInMeters == null) return null;

    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} meters`;
    }

    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <div
        onClick={() => onSelect(store)}
        className={`
          group cursor-pointer rounded-2xl border bg-gradient-to-br
          from-[#064e3b] to-[#020617]
          transition-all duration-300
          ${isCompact ? "p-3" : "p-4"}

          ${
            isSelected
              ? "border-emerald-500 shadow-[0_0_0_8px_rgba(0,185,0,1)]"
              : "border-slate-700 hover:border-emerald-700 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
          }
        `}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* ICON */}
          <div
            className={`relative overflow-hidden rounded-xl bg-slate-900
              ${isCompact ? "h-14 w-14" : "h-20 w-20"}
              self-start sm:self-auto`}
          >
            {store.image ? (
              <img
                src={store.image}
                alt={store.product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package
                  className={`text-slate-400 ${
                    isCompact ? "h-6 w-6" : "h-8 w-8"
                  }`}
                />
              </div>
            )}
          </div>


          {/* CONTENT */}
          <div className="flex-1 min-w-0">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <h3
                  className={`truncate font-semibold text-white group-hover:text-emerald-300 transition
                  ${isCompact ? "text-sm" : "text-base"}
                `}
                >
                  {store.name}
                </h3>

                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                    categoryColor[store.product.productCategory] || categoryColor.general
                  }`}>
                    {store.product.productCategory || "general"}
                  </span>

                  <span className="inline-block rounded-full border px-2 py-0.5 text-xs text-white">
                    {store.address}
                  </span>
                </div>

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
              <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs text-white/90">
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
                {store.distance != null && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    {formatDistance(store.distance)}
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
