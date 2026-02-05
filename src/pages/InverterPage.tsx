import React from "react";
import { useEffect, useState } from "react";
import { MainLayout } from "../templates/MainLayout";
import { InverterTable } from "../components/organisms/InverterTable";
import type { Inverter } from "../types/interface/inverter.interface";
import { getUserPlantList2Request, getUserInverterList2Request } from "../apis/index";
import { fetchInvertersByPlant, fetchTodaySeries, fetchRecentSeries } from "../apis/inverter/inverter.api";
import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";
import { useCookies } from "react-cookie";


function safeArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  return [v as T];
}




export const InverterPage = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [rows, setRows] = useState<Inverter[]>([]);
  const [chartData, setChartData] = useState<Inverter[]>([]);

  // ✅ “열린 행”은 PK(id)로 관리 (중복 invId 문제 해결)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  // ✅ 그래프 API 호출은 invId로
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);

  const [plantId, setPlantId] = React.useState<"ALL" | number>("ALL");
  const [invId, setInvId] = React.useState<"ALL" | number>("ALL");
  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [invList2, setInvList2] = React.useState<InverterList2Row[]>([]);

  const fetchLists = React.useCallback(async () => {
    if (!token) return;

    const [plantRes, invRes] = await Promise.all([
      getUserPlantList2Request(token),
      getUserInverterList2Request(token),
    ]);

    if (!plantRes || (plantRes as any).code !== "SU") {
      setPlants([]);
      setError((plantRes as any)?.message ?? "발전소 목록 조회 실패");
    } else {
      const list = safeArray<PlantList2Row>((plantRes as any).plantList2);
      setPlants(list);
    }

    if (!invRes || (invRes as any).code !== "SU") {
      setInvList2([]);
      setError((prev) => prev ?? (invRes as any)?.message ?? "인버터 목록 조회 실패");
    } else {
      const list = safeArray<InverterList2Row>((invRes as any).inverters);
      setInvList2(list);
    }
  }, [token]);


  useEffect(() => {
    fetchInvertersByPlant(cookies.accessToken, plantId).then((data) => {
      setRows(data);
    });
  }, []);

  // ✅ row 클릭 시: 같은 row면 닫기 / 아니면 열고 그래프 로드
  const handleSelectRow = async (rowId: number, invId: number) => {
    // 토글 닫기
    if (selectedRowId === rowId) {
      setSelectedRowId(null);
      setSelectedInvId(null);
      setChartData([]);
      return;
    }

    setSelectedRowId(rowId);
    setSelectedInvId(invId);

  const series = await fetchRecentSeries(cookies.accessToken, plantId, invId, 200);
  setChartData(series);

  };

  const handleCloseChart = () => {
    setSelectedRowId(null);
    setSelectedInvId(null);
    setChartData([]);
  };

  return (
    <MainLayout activeMenu="/inverter">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded">
          <h1 className="text-2xl font-bold">인버터 | Inverter</h1>
        </div>

        <InverterTable
          rows={rows}
          selectedRowId={selectedRowId}
          selectedInvId={selectedInvId}
          chartData={chartData}
          onSelectRow={handleSelectRow}
          onCloseChart={handleCloseChart}
        />
      </div>
    </MainLayout>
  );
};
