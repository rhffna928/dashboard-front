// src/pages/UserManagementPage.tsx
import React from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";

export const UserManagementPage: React.FC = () => {
  return (
    <MainLayout activeMenu="/user-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="사용자 관리" pageSubtitle="User Management" />

        <div className="bg-white border rounded p-6 h-[360px] flex items-center justify-center text-slate-400">
          사용자 관리 테이블
        </div>
      </div>
    </MainLayout>
  );
};
