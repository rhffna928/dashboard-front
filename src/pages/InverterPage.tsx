import React from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from '../components/organisms/PageHeader';
import InverterPowerChart from "../components/organisms/InverterPowerChart";
import type { InverterPowerPoint } from "../components/organisms/InverterPowerChart";

const mockData: InverterPowerPoint[] = [
  { timestamp: "2025-12-26T05:00:00+09:00", powerKw: 0.0 },
  { timestamp: "2025-12-26T06:00:00+09:00", powerKw: 0.0 },
  { timestamp: "2025-12-26T07:00:00+09:00", powerKw: 0.3 },
  { timestamp: "2025-12-26T08:00:00+09:00", powerKw: 0.8 },
  { timestamp: "2025-12-26T09:00:00+09:00", powerKw: 1.7 },
  { timestamp: "2025-12-26T10:00:00+09:00", powerKw: 1.6 },
  { timestamp: "2025-12-26T11:00:00+09:00", powerKw: 1.6 },
  { timestamp: "2025-12-26T12:00:00+09:00", powerKw: 1.1 },
  { timestamp: "2025-12-26T13:00:00+09:00", powerKw: 0.6 },
  { timestamp: "2025-12-26T14:00:00+09:00", powerKw: 0.6 },
  { timestamp: "2025-12-26T15:00:00+09:00", powerKw: 0.4 },
  { timestamp: "2025-12-26T16:00:00+09:00", powerKw: 0.2 },
];

export const InverterPage: React.FC = () => {
  return (
    <MainLayout activeMenu="/inverter">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="인버터" pageSubtitle="Inverter" />

        <InverterPowerChart
          title="인버터 전력 그래프"
          data={mockData}
        />
      </div>
    </MainLayout>
  );
};
