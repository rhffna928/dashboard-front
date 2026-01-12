import { useEffect, useState } from "react";
import { MainLayout } from "../templates/MainLayout";
import { InverterTable } from "../components/organisms/InverterTable";
import type { Inverter } from "../types/interface/inverter.interface";
import { fetchInvertersByPlant, fetchTodaySeries, fetchRecentSeries } from "../apis/inverter/inverter.api";
import { useCookies } from "react-cookie";

export const InverterPage = () => {
  const [cookies] = useCookies(["accessToken"]);

  const [rows, setRows] = useState<Inverter[]>([]);
  const [chartData, setChartData] = useState<Inverter[]>([]);

  // ✅ “열린 행”은 PK(id)로 관리 (중복 invId 문제 해결)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  // ✅ 그래프 API 호출은 invId로
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);

  const plantId = 1; // 테스트용

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
