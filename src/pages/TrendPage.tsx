// src/pages/TrendPage.tsx
import React, { useState } from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from '../components/organisms/PageHeader';

type Mode = "daily" | "monthly" | "yearly";

export const TrendPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("daily");
  const [date, setDate] = useState("2021-10-20");

  return (
    <MainLayout activeMenu="/trend">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="트렌드" pageSubtitle="Trend" />

        <div className="bg-white border rounded p-4 flex items-center gap-6">
          <div className="flex gap-4">
            {(["daily", "monthly", "yearly"] as Mode[]).map(m => (
              <label key={m} className="flex items-center gap-2">
                <input type="radio" checked={mode === m} onChange={() => setMode(m)} />
                <span>{m === "daily" ? "일간" : m === "monthly" ? "월간" : "연간"}</span>
              </label>
            ))}
          </div>

          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1" />
          <button className="px-4 py-1.5 rounded bg-slate-800 text-white">보기</button>
        </div>

        <div className="bg-white border rounded p-6 h-[420px] flex items-center justify-center text-slate-400">
          차트 영역 (Trend)
        </div>
      </div>
    </MainLayout>
  );
};
