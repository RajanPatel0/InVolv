import { CheckCircle2, Clock } from "lucide-react";

export default function ProductAvailability({ product }) {
  if (!product) return null;

  // Calculate minutes since update
  const getUpdatedMins = () => {
    // Use createdAt or updatedAt from product
    const timestamp = product.updatedAt || product.createdAt || new Date();
    if (!timestamp) return "just now";
    const now = new Date();
    const updated = new Date(timestamp);
    const mins = Math.floor((now - updated) / (1000 * 60));
    if (mins === 0) return "just now";
    if (mins === 1) return "1 min ago";
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    return "today";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <div
        className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between
        gap-6 rounded-2xl border border-emerald-200/30 bg-emerald-50/60
        dark:bg-emerald-950/30 dark:border-emerald-500/20
        p-6 transition-all duration-300 hover:-translate-y-[2px]
        hover:shadow-lg hover:shadow-emerald-500/10"
      >
        {/* Left Accent */}
        <span className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-emerald-500" />

        {/* Product Info */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {product.name || product.pdtName || "Product"}
          </h3>

          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            ₹{(product.price || 0)?.toLocaleString("en-IN") || "N/A"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              In stock ({product.stock || 0} units)
            </span>

            {/* Updated Time with Tooltip */}
            <span className="relative group inline-flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <Clock className="h-4 w-4" />
              Updated {getUpdatedMins()}

              {/* Tooltip */}
              <span
                className="pointer-events-none absolute left-1/2 top-full z-20 mt-2
                w-max -translate-x-1/2 rounded-md bg-neutral-900 px-2 py-1
                text-xs text-white opacity-0 transition-opacity
                group-hover:opacity-100"
              >
                Stock updated by vendor
              </span>
            </span>
          </div>
        </div>

        {/* Optional Right Hint (desktop only) */}
        <div className="hidden sm:block text-sm text-neutral-500 dark:text-neutral-400">
          Available for immediate pickup
        </div>
      </div>
    </section>
  );
}
