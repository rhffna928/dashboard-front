// src/pages/PlantManagementPage.tsx
import React from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";

export const PlantMngtPage: React.FC = () => {
  return (
    <MainLayout activeMenu="/plant-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="발전소 관리" pageSubtitle="Plant Management" />

        <div className="bg-white border rounded p-6 h-[420px] flex items-center justify-center text-slate-400">
          발전소 관리 테이블
        </div>
      </div>
    </MainLayout>
  );
};
