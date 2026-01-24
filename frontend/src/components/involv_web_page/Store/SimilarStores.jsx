import { motion } from "framer-motion";
import StoreCard from "../components/search/StoreCard";

export default function SimilarStores({ stores = [] }) {
  if (!stores || stores.length === 0) return null;

  return (
    <section className="mt-10 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
          Similar Nearby Stores
        </h2>

        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {stores.length} store{stores.length !== 1 ? "s" : ""} available
        </span>
      </div>

      {/* Horizontal Scroll */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="
          flex gap-4 overflow-x-auto pb-3
          scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700
          scrollbar-track-transparent
        "
      >
        {stores.map((store, index) => (
          <div
            key={store.id || index}
            className="min-w-[280px] sm:min-w-[320px]"
          >
            <StoreCard
              store={store}
              index={index}
              variant="compact"
              onSelect={() => {}}
              onNavigate={() => {}}
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
