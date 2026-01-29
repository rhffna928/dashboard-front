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

import type { Inverter } from "../types/interface/inverter.interface";
import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";
import {getUserPlantList2Request, getUserInverterList2Request, getUserInverterLastRequest} from "../apis/index"



export const DashboardPage: React.FC = () => {


  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);


  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [invList2, setInvList2] = React.useState<InverterList2Row[]>([]);
  const [invLast, setInvLast] = React.useState<Inverter[]>([]);

  const [selectedPlantId, setSelectedPlantId] = React.useState<number | null>(null);

  const fetchAll = React.useCallback(async () =>{

    if(!token){
      setError("accessToken이 없습니다. 로그인 후 다시 시도하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [plantRes, invRes, invLastRes] = await Promise.all([ 
        getUserPlantList2Request(token),
        getUserInverterList2Request(token),
        getUserInverterLastRequest(token),

      ]);
      
      if (!plantRes || (plantRes as any).code !== "SU"){
        setPlants([]);
        setSelectedPlantId(null);
        setError((plantRes as any)?.message ?? "발전소 목록 조회 실패");
      }else{
        const list = ((plantRes as any).plantList2 ?? []) as PlantList2Row[];
        setPlants(list);

        const firstId = list?.[0]?.plantId ?? null;
        setSelectedPlantId((prev) => prev ?? firstId);
      }

      if (!invRes || (invRes as any).code !== "SU"){
        setInvList2([]);
        setError((prev) => prev ?? (invRes as any).message ?? "인버터 목록 조회 실패");
      }else{
        const list = ((invRes as any).inverters ?? []) as InverterList2Row[];
        setInvList2(list);
      }

      if(!invLastRes || (invLastRes as any).code !== "SU"){
        setInvLast([]);
        setError((prev )=> prev ?? (invLast as any).message ?? "인버터 조회 실패");
      }else{
        const list = ((invLastRes as any).inverter ?? []) as Inverter[];
        setInvLast(list);
      }

    }catch(e:any){
      setError(e?.message ?? "대시보드 데이터 조회 중 오류");
      setPlants([]);
      setInvList2([]);
      setSelectedPlantId(null);
    }finally{
      setLoading(false);
    }

  }, [token]);


  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // 현재 선택된 plant
  const selectedPlant = React.useMemo(() => {
    if (!selectedPlantId) return plants[0];
    return plants.find((p) => p.plantId === selectedPlantId) ?? plants[0];
  }, [plants, selectedPlantId]);

  // 선택된 plant의 인버터만 테이블에 표시
  const invRowsForPlant = React.useMemo(() => {
    const pid = selectedPlant?.plantId;
    if (!pid) return invList2;
    return invList2.filter((x) => x.plantId === pid);
  }, [invList2, selectedPlant]);

  const invLastForPlant = React.useMemo(() => {
    const pid = selectedPlant?.plantId;
    if (!pid) return invLast;
    return invLast.filter((x: any) => Number(x.plantId) === Number(pid));
  }, [invLast, selectedPlant]);

  return (
    <MainLayout activeMenu="dashboard">
      <div className="space-y-4">
        <PageHeaderMetrics pageTitle="대시보드" pageSubtitle="Dashboard" />

        {/* 에러/로딩 표시(최소) */}
        {error && <div className="text-sm text-rose-600">{error}</div>}
        {loading && <div className="text-sm text-slate-500">불러오는 중...</div>}

        <div className="grid grid-cols-12 gap-4">
          {/* LEFT */}
          <div className="col-span-12 xl:col-span-5 space-y-4">
            {/* ✅ 여기! props로 주입 */}
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
            <KpiStrip invList2={invRowsForPlant} invLastList={invLastForPlant} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <DashboardTrends />

              <InverterChartCard
                data={invLast}
                title={invLast}
                chartPath="/inverter"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
