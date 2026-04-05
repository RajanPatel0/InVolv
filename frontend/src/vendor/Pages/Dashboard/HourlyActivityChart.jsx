import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const HourlyActivityChart = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md">

      <h2 className="text-xl font-bold text-[#000075] mb-4">
        Hourly Performance
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timeLabel" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="searches"
            stroke="#1D44B5"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#30BC69"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="reserves"
            stroke="#FF7A00"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlyActivityChart;