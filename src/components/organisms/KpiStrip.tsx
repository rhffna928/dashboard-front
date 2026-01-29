// src/components/organisms/KpiStrip.tsx
import React from "react";
import type { Inverter } from "../../types/interface/inverter.interface";
import type { InverterList2Row } from "../../types/interface/inverterList.interface";

type Props = {
  invList2: InverterList2Row[];    // 설비번호 드롭다운 용
  invLastList: Inverter[];         // 인버터별 마지막값(리스트)
};

function fmt(n: number, digits = 1) {
  if (Number.isNaN(n)) return "-";
  return n.toFixed(digits);
}

export const KpiStrip: React.FC<Props> = ({ invList2, invLastList }) => {
  // ✅ 기본 선택: 첫 인버터
  const [selectedInvId, setSelectedInvId] = React.useState<string>("ALL");

  React.useEffect(() => {
    // invList2 로딩되면 첫 값 자동 선택
    if (selectedInvId !== "ALL") return;
    const first = invList2?.[0]?.invId;
    if (first) setSelectedInvId(String(first));
  }, [invList2, selectedInvId]);

  // ✅ 선택된 invId의 마지막값 찾기
  const selectedLast = React.useMemo(() => {
    if (selectedInvId === "ALL") return invLastList?.[0] ?? null;
    return (
      invLastList.find((x: any) => String(x.invId) === String(selectedInvId)) ?? null
    );
  }, [invLastList, selectedInvId]);

  const kpi = React.useMemo(() => {
    const outPower = Number((selectedLast as any)?.outPower ?? 0);
    const todayGen = Number((selectedLast as any)?.todayGen ?? 0);
    const totalGen = Number((selectedLast as any)?.totalGen ?? 0);
    const hz = Number((selectedLast as any)?.hz ?? 0);

    return { outPower, todayGen, totalGen, hz };
  }, [selectedLast]);

  return (
    <section className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b font-semibold text-[14px] flex items-center justify-between">
        <span>현재 발전량</span>

        {/* ✅ KPI 내부에서 설비번호 select */}
        <div className="flex items-center gap-2">
          <div className="text-[12px] text-slate-600">설비번호</div>
          <select
            className="border rounded px-2 py-1 text-[12px]"
            value={selectedInvId}
            onChange={(e) => setSelectedInvId(e.target.value)}
          >
            {/* 필요하면 ALL(첫번째/대표) 옵션 */}
            {/* <option value="ALL">전체</option> */}
            {invList2.map((inv) => (
              <option key={inv.id} value={String(inv.invId)}>
                {`INV${String(inv.invId).padStart(2, "0")} (${inv.invName})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        <Card title="현재 발전량" value={fmt(kpi.outPower, 2)} unit="kW" color="bg-orange-600" />
        <Card title="금일 발전량" value={fmt(kpi.todayGen, 1)} unit="kWh" color="bg-pink-600" />
        <Card title="누적 발전량" value={fmt(kpi.totalGen, 1)} unit="kWh" color="bg-slate-700" />
        <Card title="주파수" value={fmt(kpi.hz, 1)} unit="Hz" color="bg-teal-600" />
        <Card title="-" value="-" unit="" color="bg-slate-400" />
        <Card title="-" value="-" unit="" color="bg-slate-500" />
      </div>
    </section>
  );
};

const Card = ({
  title,
  value,
  unit,
  color,
}: {
  title: string;
  value: string;
  unit: string;
  color: string;
}) => {
  return (
    <div className={`rounded-md text-white px-3 py-2 h-[74px] w-full flex flex-col justify-between shadow-sm ${color}`}>
      <div className="text-[12px] leading-4 opacity-95">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-[22px] font-bold leading-none">{value}</div>
        <div className="text-[11px] opacity-90 text-right">{unit}</div>
      </div>
    </div>
  );
};
