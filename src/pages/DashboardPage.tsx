import React from "react";
import { useCookies } from "react-cookie";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";

import { PlantOverviewCard } from "../components/organisms/PlantOverviewCard";
import { InverterStatusTable } from "../components/organisms/InverterStatusTable";
import { KpiStrip } from "../components/organisms/KpiStrip";
import { InverterChartCard } from "../components/organisms/InverterChartCard";
import {
  GenerationBarChart,
  type GenerationChartItem,
} from "../components/organisms/GenerationBarChart";

import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";

import {
  getUserPlantList2Request,
  getUserInverterList2Request,
  getInverterDailyRequest,
} from "../apis/index";

type DailyReportItem = {
  hour: number;
  plantId: number;
  invId: number;
  totalValue: number;
  samples: number;
};

const POLLING_MS = 10000;

function safeArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  return [v as T];
}

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toNumber(value: any, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeDailyRows(res: any) {
  const items = safeArray<DailyReportItem>(res?.day);
  return items.map((item) => ({
    hour: toNumber(item.hour),
    plantId: toNumber(item.plantId),
    invId: toNumber(item.invId),
    totalValue: toNumber(item.totalValue),
    samples: toNumber(item.samples),
  }));
}

export const DashboardPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken ?? "";

  const [loading, setLoading] = React.useState(false);
  const [liveLoading, setLiveLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [invList2, setInvList2] = React.useState<InverterList2Row[]>([]);
  const [selectedPlantId, setSelectedPlantId] = React.useState<number | null>(null);

  const [generationChartData, setGenerationChartData] = React.useState<GenerationChartItem[]>([]);

  const pollingRef = React.useRef<number | null>(null);
  const isFetchingLiveRef = React.useRef(false);

  // 1) 최초 1회: 발전소 목록 + 초기 인버터 목록
  const fetchStaticData = React.useCallback(async () => {
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
        const plantList = safeArray<PlantList2Row>((plantRes as any).plantList2);
        setPlants(plantList);

        const firstId = plantList?.[0]?.plantId ?? null;
        setSelectedPlantId((prev) => prev ?? firstId);
      }

      if (!invRes || (invRes as any).code !== "SU") {
        setInvList2([]);
        setError((prev) => prev ?? (invRes as any)?.message ?? "인버터 목록 조회 실패");
      } else {
        setInvList2(safeArray<InverterList2Row>((invRes as any).inverters));
      }
    } catch (e: any) {
      setError(e?.message ?? "대시보드 초기 데이터 조회 중 오류");
      setPlants([]);
      setInvList2([]);
      setSelectedPlantId(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 2) 실시간 갱신: 인버터 상태 + 금일 그래프
  const fetchLiveData = React.useCallback(async () => {
    if (!token) return;
    if (isFetchingLiveRef.current) return;

    isFetchingLiveRef.current = true;
    setLiveLoading(true);

    try {
      const today = toDateInputValue(new Date());

      const [invRes, dailyRes] = await Promise.all([
        getUserInverterList2Request(token),
        getInverterDailyRequest(token, {
          plantId: selectedPlantId ?? undefined,
          invId: undefined,
          targetDate: today,
        } as any),
      ]);

      // 인버터 상태 갱신
      if (invRes && (invRes as any).code === "SU") {
        setInvList2(safeArray<InverterList2Row>((invRes as any).inverters));
      }

      // 금일 발전 그래프 갱신
      if (dailyRes && (dailyRes as any).code === "SU") {
        const rows = normalizeDailyRows(dailyRes);
        const hourMap = new Map<number, number>();

        for (const row of rows) {
          hourMap.set(row.hour, (hourMap.get(row.hour) ?? 0) + row.totalValue);
        }

        const chartData: GenerationChartItem[] = Array.from({ length: 24 }, (_, hour) => ({
          label: `${String(hour).padStart(2, "0")}:00`,
          value: toNumber(hourMap.get(hour) ?? 0),
        }));

        setGenerationChartData(chartData);
      } else {
        setGenerationChartData([]);
      }
    } catch (e: any) {
      console.error("실시간 대시보드 갱신 실패:", e);
    } finally {
      isFetchingLiveRef.current = false;
      setLiveLoading(false);
    }
  }, [token, selectedPlantId]);

  // 최초 로딩
  React.useEffect(() => {
    fetchStaticData();
  }, [fetchStaticData]);

  // 선택된 발전소가 바뀌면 즉시 1회 갱신
  React.useEffect(() => {
    if (!token) return;
    if (!selectedPlantId) return;

    fetchLiveData();
  }, [token, selectedPlantId, fetchLiveData]);

  // 폴링 시작 / 정리
  React.useEffect(() => {
    if (!token) return;
    if (!selectedPlantId) return;

    fetchLiveData();

    pollingRef.current = window.setInterval(() => {
      // 탭이 숨겨져 있으면 굳이 호출 안 함
      if (document.hidden) return;
      fetchLiveData();
    }, POLLING_MS);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [token, selectedPlantId, fetchLiveData]);

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
      <div className="overflow-hidden flex flex-col gap-3 p-4">
        <div className="shrink-0">
          <PageHeaderMetrics pageTitle="대시보드" pageSubtitle="Dashboard" />
          {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
          {loading && <div className="mt-1 text-sm text-slate-500">초기 데이터 불러오는 중...</div>}
          {!loading && liveLoading && (
            <div className="mt-1 text-xs text-slate-400">실시간 데이터 갱신 중...</div>
          )}
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-5 min-h-0 flex flex-col gap-4">
            <div className="shrink-0">
              <PlantOverviewCard
                plant={selectedPlant}
                plants={plants}
                selectedPlantId={selectedPlant?.plantId ?? null}
                onChangePlantId={(id) => setSelectedPlantId(id)}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <InverterStatusTable rows={invRowsForPlant} />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-7 min-h-0 flex flex-col gap-4">
            <div className="shrink-0">
              <KpiStrip token={token} invList2={invRowsForPlant} plantId={selectedPlantId} />
            </div>

            <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
              <div className="min-h-0 overflow-hidden">
                <GenerationBarChart
                  title={`${selectedPlant?.plantName ?? "발전소"} 금일 발전 그래프`}
                  data={generationChartData}
                  loading={liveLoading && generationChartData.length === 0}
                  height={260}
                  unit="kWh"
                  className="h-full"
                />
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