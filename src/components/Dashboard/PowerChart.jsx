import Card from "../common/Card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

export default function PowerChart({ data = [] }) {
  return (
    <Card title="일일 발전량">
      {/* ResponsiveContainer 부모 높이 반드시 지정 */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="kwh" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
