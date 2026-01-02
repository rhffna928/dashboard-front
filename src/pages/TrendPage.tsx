import React from 'react';
import { MainLayout } from '../templates/MainLayout';
import { PageHeaderMetrics } from '../components/organisms/PageHeader';

type Mode = "daily" | "monthly" | "yearly";

export default function TrendPage() {
  const [mode, setMode] = useState<Mode>("daily");
  const [date, setDate] = useState("2021-10-20");

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageTitleBar title="트렌드" subtitle="Trend" />

      {/* 필터바 */}
      <div className="px-8 py-4">
        <div className="bg-white border rounded p-4 flex items-center gap-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode === "daily"} onChange={() => setMode("daily")} />
              <span>일간</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode === "monthly"} onChange={() => setMode("monthly")} />
              <span>월간</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode === "yearly"} onChange={() => setMode("yearly")} />
              <span>연간</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button className="px-4 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-700">
              보기
            </button>
          </div>
        </div>
      </div>

      {/* 차트 자리 */}
      <div className="px-8 pb-10">
        <div className="bg-white border rounded p-6">
          <div className="text-center text-slate-500 mb-4">
            일일 발전량 : {date}
          </div>

          <div className="h-[420px] flex items-center justify-center text-slate-400 border rounded">
            (차트 영역 - 나중에 Recharts BarChart 넣기)
          </div>
        </div>
      </div>
    </div>
  );
}
