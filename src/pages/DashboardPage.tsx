// src/pages/DashboardPage.tsx
import React from "react";
import { useCookies } from "react-cookie";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";

import { PlantOverviewCard } from "../components/organisms/PlantOverviewCard";
import { InverterStatusTable } from "../components/organisms/InverterStatusTable";
import { KpiStrip, } from "../components/organisms/KpiStrip";
import { DashboardTrends } from "../components/organisms/DashboardTrends";
import { InverterChartCard } from "../components/organisms/InverterChartCard";

import type { Inverter, }  from "../types/interface/inverter.interface";
import type { DashboardKpi } from "../types/interface/dashboardKpi.interface";
import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";
import {getUserPlantList2Request, getUserInverterList2Request, getDashboardKpiRequest} from "../apis/index"


function safeArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  return [v as T];
}

export const DashboardPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [invList2, setInvList2] = React.useState<InverterList2Row[]>([]);
  const [selectedPlantId, setSelectedPlantId] = React.useState<number | null>(null);

  const fetchAll = React.useCallback(async () => {
    if (!token) {
      setError("accessToken이 없습니다. 로그인 후 다시 시도하세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [plantRes, invRes] = await Promise.all([
        getUserPlantList2Request(token),
        getUserInverterList2Request(token),
      ]);

      if (!plantRes || (plantRes as any).code !== "SU") {
        setPlants([]);
        setSelectedPlantId(null);
        setError((plantRes as any)?.message ?? "발전소 목록 조회 실패");
      } else {
        const list = safeArray<PlantList2Row>((plantRes as any).plantList2);
        setPlants(list);

        const firstId = list?.[0]?.plantId ?? null;
        setSelectedPlantId((prev) => prev ?? firstId);
      }

      if (!invRes || (invRes as any).code !== "SU") {
        setInvList2([]);
        setError((prev) => prev ?? (invRes as any)?.message ?? "인버터 목록 조회 실패");
      } else {
        const list = safeArray<InverterList2Row>((invRes as any).inverters);
        setInvList2(list);
      }
    } catch (e: any) {
      setError(e?.message ?? "대시보드 데이터 조회 중 오류");
      setPlants([]);
      setInvList2([]);
      setSelectedPlantId(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const selectedPlant = React.useMemo(() => {
    if (!plants.length) return undefined;
    if (!selectedPlantId) return plants[0];
    return plants.find((p) => p.plantId === selectedPlantId) ?? plants[0];
  }, [plants, selectedPlantId]);

  const invRowsForPlant = React.useMemo(() => {
    const pid = selectedPlant?.plantId;
    if (!pid) return invList2;
    return invList2.filter((x) => x.plantId === pid);
  }, [invList2, selectedPlant]);

  return (
    <MainLayout activeMenu="dashboard">
      <div className="space-y-4">
        <PageHeaderMetrics pageTitle="대시보드" pageSubtitle="Dashboard" />

        {error && <div className="text-sm text-rose-600">{error}</div>}
        {loading && <div className="text-sm text-slate-500">불러오는 중...</div>}

        <div className="grid grid-cols-12 gap-4">
          {/* LEFT */}
          <div className="col-span-12 xl:col-span-5 space-y-4">
            <PlantOverviewCard
              plant={selectedPlant}
              plants={plants}
              selectedPlantId={selectedPlant?.plantId ?? null}
              onChangePlantId={(id) => setSelectedPlantId(id)}
            />
            <InverterStatusTable rows={invRowsForPlant} />
          </div>

          {/* RIGHT */}
          <div className="col-span-12 xl:col-span-7 space-y-4">
            {/*  기존 인버터 목록을 그대로 드롭다운에 사용 */}
            <KpiStrip token={token} invList2={invRowsForPlant} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <DashboardTrends />

              {/* 최신값/시계열 안 쓰면 차트는 placeholder로 */}
              <InverterChartCard
                data={[]}
                title={`${selectedPlant?.plantName ?? "발전소"} 추이`}
                chartPath="/inverter"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};