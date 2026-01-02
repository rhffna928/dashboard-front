// src/pages/AlertPage.tsx
import React from "react";
import { MainLayout } from "../templates/MainLayout";
import {PageHeaderMetrics} from "../components/organisms/PageHeader";

export const AlertPage: React.FC = () => {
  return (
    <MainLayout activeMenu="/alert">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="알림" pageSubtitle="Alert" />

        <div className="bg-white border rounded p-6 h-[360px] flex items-center justify-center text-slate-400">
          알림 목록 테이블
        </div>
      </div>
    </MainLayout>
  );
}
