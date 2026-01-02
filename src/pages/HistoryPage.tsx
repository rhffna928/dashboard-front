// src/pages/HistoryPage.tsx
import React from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";

export const HistoryPage: React.FC = () => {
  return (
    <MainLayout activeMenu="/history">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="기록" pageSubtitle="History" />

        <div className="bg-white border rounded p-6 h-[420px] flex items-center justify-center text-slate-400">
          기록 테이블 영역
        </div>
      </div>
    </MainLayout>
  );
};
