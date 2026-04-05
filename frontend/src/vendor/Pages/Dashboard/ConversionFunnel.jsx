import { motion } from "framer-motion";

const ConversionFunnel = ({ data, period }) => {
  if (!data) return null;

  const { funnel, summary, insights } = data;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-[#000075]">
          Conversion Funnel ({period})
        </h2>
        <p className="text-sm text-gray-500">
          Track user journey from search → reserve
        </p>
      </div>

      <div className="space-y-4">
        {funnel.map((step, i) => {
            const safeWidth = Math.min(step.percentage, 100); // ✅ FIX

            return (
            <div key={i} className="w-full">
                {/* LABEL ROW */}
                <div className="flex justify-between text-sm mb-1">
                <span className="text-[#000075] font-medium">
                    {step.label}
                </span>
                <span className="font-semibold text-[#1D44B5]">
                    {step.count}
                </span>
                </div>

                {/* BAR CONTAINER */}
                <div className="w-full bg-[#EEF3FF] rounded-full h-10 overflow-hidden">

                {/* ANIMATED BAR */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${safeWidth}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-[#1D44B5] to-[#000075] flex items-center justify-between px-3 text-white text-xs font-medium"
                >
                    <span>{step.percentage}%</span>

                    {step.conversionRate && (
                    <span className="opacity-80">
                        Conv: {step.conversionRate}%
                    </span>
                    )}
                </motion.div>
                </div>
            </div>
            );
        })}
        </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Search → Click", value: summary.searchToClickRate },
          { label: "Click → Reserve", value: summary.clickToReserveRate },
          { label: "Search → Reserve", value: summary.searchToReserveRate },
        ].map((item, i) => (
          <div key={i} className="bg-[#EEF3FF] p-4 rounded-xl text-center">
            <p className="text-xs text-gray-500">{item.label}</p>
            <h3 className="text-lg font-bold text-[#1D44B5]">
              {item.value}%
            </h3>
          </div>
        ))}
      </div>

      {/* INSIGHTS */}
      {insights?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-sm font-semibold text-[#000075]">
            💡 {insights[0].message}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {insights[0].suggestion}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversionFunnel;