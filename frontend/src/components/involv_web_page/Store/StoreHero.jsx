import React from "react";
import { MapPin, Phone, Bookmark, CheckCircle } from "lucide-react";

const StoreHero = ({ store, eta, distance, phone, address, onGetDirections }) => {
  const isOpen = store?.isOpen;

  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xl shadow-neutral-200/50 dark:shadow-none">
      {/* Store Header Image or Placeholder */}
      <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 flex items-end">
        <div className="h-16 w-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-emerald-600">
          {store.name.charAt(0)}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {store.name}
          </h1>
          <CheckCircle className="text-emerald-500" size={20} />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {store.categories?.map((cat, i) => (
            <span
              key={i}
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-sm text-neutral-500">Status</span>
            <span
              className={`text-sm font-bold ${
                isOpen ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {isOpen ? "Open Now" : "Closed"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-sm text-neutral-500">Distance</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              {distance.toFixed(1)} km ({eta} mins)
            </span>
          </div>
        </div>

        {address && (
          <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 flex items-start gap-2">
            <MapPin size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{address}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={onGetDirections}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            Get Directions
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCall}
              className="flex text-neutral-900 dark:text-white items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              <Phone size={16} /> Call
            </button>
            <button className="flex text-neutral-900 dark:text-white items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
              <Bookmark size={16} /> Pre Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHero;
