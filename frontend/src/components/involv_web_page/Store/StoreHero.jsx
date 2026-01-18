import React from "react";
import { MapPin, Phone, Bookmark, CheckCircle } from "lucide-react";

const StoreHero = ({ store, eta, distance }) => {
  const isOpen = store?.isOpen;

  return (
    <div className="sticky top-16 z-[60] bg-white dark:bg-neutral-900
    border-b border-neutral-200 dark:border-neutral-800">

      <div className="max-w-7xl mx-auto px-4 ">
        <div className="rounded-2xl shadow-sm bg-white dark:bg-neutral-900 p-4 md:p-5 transition-all">

          {/* TOP ROW */}
          <div className="flex items-start justify-between gap-4">
            {/* LEFT */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-white">
                  {store.name}
                </h1>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle size={14} />
                  Verified
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {store.categories?.map((cat, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  isOpen ? "text-emerald-600" : "text-red-500"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpen
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                />
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>

          {/* META */}
          <div className="mt-3 flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {distance} km • {eta} min
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02]">
              <MapPin size={16} />
              Get Directions
            </button>

            <button onClick={() =>
                document
                    .getElementById("store-actions")
                    ?.scrollIntoView({ behavior: "smooth" })
                } className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 py-2.5 text-sm font-medium text-neutral-900 dark:text-white transition-transform hover:scale-[1.02]">
              <Bookmark size={16} />
              Pre-book
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 py-2.5 text-sm font-medium text-neutral-900 dark:text-white transition-transform hover:scale-[1.02]">
              <Phone size={16} />
              Call Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHero;
