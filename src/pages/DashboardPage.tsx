// src/pages/DashboardPage.tsx
import React from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { DashboardMetrics } from "../components/organisms/DashboardMetrics";

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout activeMenu="dashboard">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="대시보드" pageSubtitle="Dashboard" />
        <DashboardMetrics />
      </div>
    </MainLayout>
  );
};
