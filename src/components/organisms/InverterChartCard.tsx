// src/components/dashboard/DashboardTrends.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";


const inverterLineData = [
  { t: "06", v: 0.0 },
  { t: "07", v: 0.1 },
  { t: "08", v: 0.5 },
  { t: "09", v: 1.6 },
  { t: "10", v: 1.5 },
  { t: "11", v: 1.6 },
  { t: "12", v: 1.2 },
  { t: "13", v: 0.7 },
  { t: "14", v: 0.6 },
  { t: "15", v: 0.4 },
  { t: "16", v: 0.2 },
];

export const InverterChartCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b font-semibold text-[14px]">그래프</div>

      <div className="p-4">
        {/* 인버터 일일 생산량 */}
        <div className="border rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-[13px] text-slate-800">인버터 일일 생산량</div>
            <button
              type="button"
              className="text-[12px] text-slate-500 hover:text-slate-800"
              onClick={() => navigate("/inverter")}
            >
              view
            </button>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inverterLineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="v" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
