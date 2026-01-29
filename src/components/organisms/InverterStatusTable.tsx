// src/components/organisms/InverterStatusTable.tsx
import React from "react";
import { StatusBadge } from "../atoms/StatusBadge";
import type { InverterList2Row } from "../../types/interface/inverterList.interface"; // 위에서 export한 타입 쓰거나, 타입 파일로 빼도 됨

type Props = {
  rows: InverterList2Row[];
};

function invNoLabel(invId: string) {
  // inv_id가 "1" / "01" / "INV01" 어떤 형태든 표시를 안정적으로
  const s = String(invId ?? "");
  const onlyNum = s.replaceAll(/[^0-9]/g, "");
  if (!onlyNum) return s || "-";
  return `INV${onlyNum.padStart(2, "0")}`;
}

export const InverterStatusTable: React.FC<Props> = ({ rows }) => {
  return (
    <section className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b font-semibold text-[14px]">인버터 현황</div>

      <div className="p-4">
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-medium px-3 py-2 w-[90px]">번호</th>
                <th className="text-left font-medium px-3 py-2 w-[90px]">상태</th>
                <th className="text-left font-medium px-3 py-2">용량</th>
                <th className="text-left font-medium px-3 py-2">금일 발전량</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                    인버터 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="bg-white">
                    <td className="px-3 py-2 border-t">{invNoLabel(r.invId)}</td>

                    {/* ✅ 상태는 실시간 inverter 테이블이 아니라 inverter_list2라서 애매.
                        일단 useYn으로 Run/Stop 느낌만 표시 (원하면 너 규칙대로 바꾸면 됨) */}
                    <td className="px-3 py-2 border-t">
                      <StatusBadge status={r.useYn === "Y" ? "Run" : "Stop"} />
                    </td>

                    <td className="px-3 py-2 border-t">{r.invCapacity} kW</td>
                    <td className="px-3 py-2 border-t">{r.todayGen} kWh</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
