// src/pages/DeviceManagementPage.tsx
import React from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";

export const DeviceMngtPage: React.FC = () => {
  return (
    <MainLayout activeMenu="/device-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="설비 관리" pageSubtitle="Device Management" />

        <div className="bg-white border rounded p-6 h-[420px] flex items-center justify-center text-slate-400">
          설비 관리 테이블
        </div>
      </div>
    </MainLayout>
  );
};
