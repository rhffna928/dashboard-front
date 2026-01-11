import { MainLayout } from "../templates/MainLayout";
import { InverterTable } from "../components/organisms/InverterTable";
import { InverterChart } from "../components/organisms/InverterChart";

export const InverterPage = () => {
  return (
    <MainLayout activeMenu="/inverter">
      <div className="space-y-6">
        
        {/* 타이틀 영역 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded">
          <h1 className="text-2xl font-bold">인버터 | Inverter</h1>
        </div>

        {/* 테이블 */}
        <InverterTable />

        {/* 그래프 */}
        <InverterChart />

      </div>
    </MainLayout>
  );
};
