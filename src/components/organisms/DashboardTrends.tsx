// src/components/dashboard/DashboardTrends.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// 더미 데이터(너 API 붙이면 교체)
const dailyBarData = [
  { t: "06", v: 0.0 },
  { t: "07", v: 0.2 },
  { t: "08", v: 0.8 },
  { t: "09", v: 1.6 },
  { t: "10", v: 1.5 },
  { t: "11", v: 1.5 },
  { t: "12", v: 1.0 },
  { t: "13", v: 0.6 },
  { t: "14", v: 0.5 },
  { t: "15", v: 0.3 },
  { t: "16", v: 0.2 },
];

export const DashboardTrends: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b font-semibold text-[14px]">트렌드</div>

      <div className="p-4">
        <div className="border rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-[13px] text-slate-800">일일 발전량</div>
            <button
              type="button"
              className="text-[12px] text-slate-500 hover:text-slate-800"
              onClick={() => navigate("/trend")}
            >
              view
            </button>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="v" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
