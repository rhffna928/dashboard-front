// src/pages/DashboardPage.tsx
import React from "react";
import { useCookies } from "react-cookie";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";

import { PlantOverviewCard } from "../components/organisms/PlantOverviewCard";
import { InverterStatusTable } from "../components/organisms/InverterStatusTable";
import { KpiStrip } from "../components/organisms/KpiStrip";
import { DashboardTrends } from "../components/organisms/DashboardTrends";
import { InverterChartCard } from "../components/organisms/InverterChartCard";

import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";
import { getUserPlantList2Request, getUserInverterList2Request } from "../apis/index";

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
      {/* ✅ 화면에 딱 맞게(헤더 fixed 48px 가정) */}
      <div className="overflow-hidden flex flex-col gap-3 p-4">
        {/* 상단 타이틀 */}
        <div className="shrink-0">
          <PageHeaderMetrics pageTitle="대시보드" pageSubtitle="Dashboard" />
          {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
          {loading && <div className="mt-1 text-sm text-slate-500">불러오는 중...</div>}
        </div>

        {/* 본문 2컬럼 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">
          {/* LEFT (PPT: 발전소현황 + 인버터현황) */}
          <div className="col-span-12 xl:col-span-5 min-h-0 flex flex-col gap-4">
            {/* 발전소 카드(고정 높이) */}
            <div className="shrink-0">
              <PlantOverviewCard
                plant={selectedPlant}
                plants={plants}
                selectedPlantId={selectedPlant?.plantId ?? null}
                onChangePlantId={(id) => setSelectedPlantId(id)}
              />
            </div>

            {/* ✅ 인버터 테이블: 남은 공간 먹고 내부 스크롤 */}
            <div className="flex-1 min-h-0 overflow-auto">
              <InverterStatusTable rows={invRowsForPlant} />
            </div>
          </div>

          {/* RIGHT (PPT: 실시간발전량 + 차트2개) */}
          <div className="col-span-12 xl:col-span-7 min-h-0 flex flex-col gap-4">
            {/* ✅ 실시간 발전량: 오른쪽 상단 (고정) */}
            <div className="shrink-0">
              <KpiStrip token={token} invList2={invRowsForPlant} plantId={selectedPlantId}/>
            </div>

            {/* ✅ 차트 영역: 남은 공간을 2등분 */}
            <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
              <div className="min-h-0 overflow-hidden">
                <div className="h-full">
                  <DashboardTrends />
                </div>
              </div>

              <div className="min-h-0 overflow-hidden">
                <div className="h-full">
                  <InverterChartCard
                    data={[]}
                    title={`${selectedPlant?.plantName ?? "발전소"} 추이`}
                    chartPath="/inverter"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};
