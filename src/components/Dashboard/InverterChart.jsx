import Card from "../common/Card";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

export default function InverterChart({ data = [] }) {
  return (
    <Card title="인버터 일일생산량">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="kw" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
