import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { hour: "05:00", kw: 0.0 },
  { hour: "06:00", kw: 0.05 },
  { hour: "07:00", kw: 0.3 },
  { hour: "08:00", kw: 0.9 },
  { hour: "09:00", kw: 1.7 },
  { hour: "10:00", kw: 1.6 },
  { hour: "11:00", kw: 1.6 },
  { hour: "12:00", kw: 1.1 },
  { hour: "13:00", kw: 0.6 },
  { hour: "14:00", kw: 0.65 },
  { hour: "15:00", kw: 0.4 },
  { hour: "16:00", kw: 0.2 },
];

export const InverterChart = () => {
  return (
    <div className="bg-white p-4 border rounded">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis unit="kW" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="kw"
            stroke="#2563eb"
            strokeWidth={3}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
