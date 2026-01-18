import React from "react";
import { Bookmark, Bell, TrendingDown } from "lucide-react";

const ActionCard = ({ icon: Icon, title, desc, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-neutral-200 dark:border-neutral-800
      bg-white dark:bg-neutral-900 p-4 text-left transition-all
      hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
          bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200
          group-hover:bg-emerald-100 group-hover:text-emerald-600 transition"
        >
          <Icon size={18} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
            {desc}
          </p>
        </div>
      </div>
    </button>
  );
};

const StoreActions = ({ storeId, productId }) => {
  const handleIntent = (type) => {
    // 🔗 Later → POST /api/intents
    console.log({
      storeId,
      productId,
      intentType: type,
    });

    // toast.success("We'll notify you 👍");
  };

  return (
    <section
      id="store-actions"
      className="mt-10 scroll-mt-28"
    >
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800
        bg-neutral-50 dark:bg-neutral-950 p-5 md:p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
          Actions you can take
        </h2>

        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          No payment now. We’ll just save your intent.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <ActionCard
            icon={Bookmark}
            title="Reserve this product"
            desc="We’ll inform the store and hold it for you"
            onClick={() => handleIntent("RESERVE")}
          />

          <ActionCard
            icon={TrendingDown}
            title="Notify if price drops"
            desc="Get alerted when the price becomes better"
            onClick={() => handleIntent("PRICE_DROP")}
          />

          <ActionCard
            icon={Bell}
            title="Notify if stock changes"
            desc="Useful if this product goes out of stock"
            onClick={() => handleIntent("STOCK_CHANGE")}
          />
        </div>
      </div>
    </section>
  );
};

export default StoreActions;
