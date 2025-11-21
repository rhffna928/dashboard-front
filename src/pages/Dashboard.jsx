import Card from "../components/common/Card";
import SummaryCards from "../components/Dashboard/SummaryCards";
import PowerChart from "../components/Dashboard/PowerChart";
import InverterTable from "../components/Dashboard/InverterTable";
import InverterChart from "../components/Dashboard/InverterChart";

const img =
  "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop";

export default function Dashboard() {
  // 더미 데이터 (API 연동 시 교체)
  const stats = { current: "0.0", today: "5.6", yesterday: "9.8", month: "188.8", total: "19.7", hours: "1.87" };
  const barData = [
    { time: "5:00", kwh: 0.0 }, { time: "6:00", kwh: 0.3 }, { time: "7:00", kwh: 0.6 },
    { time: "8:00", kwh: 1.2 }, { time: "9:00", kwh: 1.8 }, { time: "10:00", kwh: 2.1 },
    { time: "11:00", kwh: 2.0 }, { time: "12:00", kwh: 1.9 }, { time: "13:00", kwh: 1.2 },
    { time: "14:00", kwh: 0.8 }, { time: "15:00", kwh: 0.5 }, { time: "16:00", kwh: 0.2 },
  ];
  const lineData = barData.map(({ time, kwh }) => ({ time, kw: Math.max(0, kwh - 0.1) }));
  const inverterRows = [{ no: "INV01", status: "RUN", power: "2.5kW", today: "5.5kW" }];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />
      <Nav/>
      <div className="space-y-6">
        {/* 타이틀 바 */}
        <div className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-5 text-white shadow">
          <h1 className="text-2xl font-bold">대시보드 <span className="opacity-90">| Dashboard</span></h1>
        </div>

        {/* 1. 발전소 현황 + 사진 */}
        <Card title="발전소 현황">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <table className="h-fit min-w-[300px] text-sm">
              <tbody>
                <tr className="border-b"><td className="w-28 py-2 text-gray-500">준공연도</td><td className="py-2">2021. 1.</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">주소</td><td className="py-2">광주광역시</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">발전용량</td><td className="py-2">3 kW</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">인버터</td><td className="py-2">3kW × 1대</td></tr>
                <tr><td className="py-2 text-gray-500">모듈정보</td><td className="py-2">250W × 12장</td></tr>
              </tbody>
            </table>
            <img src={img} alt="solar" className="h-60 w-full rounded-lg object-cover" />
          </div>
        </Card>

        {/* 2. 요약 카드 */}
        <SummaryCards stats={stats} />

        {/* 3. 그래프 2종 */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PowerChart data={barData} />
          <InverterChart data={lineData} />
        </div>

        {/* 4. 인버터 표 */}
        <InverterTable rows={inverterRows} />
      </div>
    </div>
  );
}
