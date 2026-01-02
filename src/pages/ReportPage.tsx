// src/pages/ReportPage.tsx
import React from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from '../components/organisms/PageHeader';

export const ReportPage: React.FC = () => {
  return (
    <MainLayout activeMenu="/report">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="보고서" pageSubtitle="Report" />

        <div className="bg-white border rounded p-6 h-[360px] flex items-center justify-center text-slate-400">
          보고서 차트 영역
        </div>

        <div className="bg-white border rounded p-6 h-[260px] flex items-center justify-center text-slate-400">
          보고서 테이블 영역
        </div>
      </div>
    </MainLayout>
  );
};
