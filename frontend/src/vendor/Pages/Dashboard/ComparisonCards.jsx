import { TrendingUp, TrendingDown } from "lucide-react";

const ComparisonCards = ({ data }) => {
  if (!data) return null;

  const { current, previous, growth, period } = data;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">

      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold text-[#000075]">
          {period.toUpperCase()} Comparison
        </h3>
        <p className="text-sm text-gray-500">
          Performance vs previous {period}
        </p>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-4">

        {[
          {
            label: "Searches",
            value: current.searches,
            prev: previous.searches,
            growth: growth.searches,
          },
          {
            label: "Clicks",
            value: current.productClicks,
            prev: previous.productClicks,
            growth: growth.clicks,
          },
          {
            label: "Reserves",
            value: current.reserves,
            prev: previous.reserves,
            growth: growth.reserves,
          },
        ].map((item, i) => {
          const isUp = item.growth.status === "up";

          return (
            <div
              key={i}
              className="p-4 rounded-xl border hover:shadow-md transition"
            >
              <p className="text-sm text-gray-500">{item.label}</p>

              <h2 className="text-xl font-bold text-[#000075]">
                {item.value}
              </h2>

              <div className="flex items-center gap-1 mt-2 text-sm">
                {isUp ? (
                  <TrendingUp className="text-green-500" size={16} />
                ) : (
                  <TrendingDown className="text-red-500" size={16} />
                )}

                <span
                  className={`font-semibold ${
                    isUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.growth.value}%
                </span>

                <span className="text-gray-400">
                  vs {period}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonCards;