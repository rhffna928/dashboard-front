// src/components/organisms/PlantTable.tsx
import React from "react";
import type { PlantList2Row } from "../../types/interface/plantList2.interface";
import { Button } from "../atoms/Button";

interface Props {
  plants: PlantList2Row[];
  onClickDetail: (plant: PlantList2Row) => void;
}
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
export const PlantTable: React.FC<Props> = ({ plants, onClickDetail }) => {
  return (
    
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="text-left font-medium px-4 py-3">번호</th>
          <th className="text-left font-medium px-4 py-3">발전소명</th>
          <th className="text-left font-medium px-4 py-3">소유주</th>
          <th className="text-left font-medium px-4 py-3">발전단가(원)</th>
          <th className="text-left font-medium px-4 py-3">주소</th>
          <th className="text-left font-medium px-4 py-3">위도</th>
          <th className="text-left font-medium px-4 py-3">경도</th>
          <th className="text-left font-medium px-4 py-3">활성화</th>
          <th className="text-left font-medium px-4 py-3">발전 시작</th>
          <th className="text-left font-medium px-4 py-3">준공년도</th>
          <th className="text-left font-medium px-4 py-3">인터버 개수</th>
          <th className="text-left font-medium px-4 py-3">등록일</th>
          <th className="text-left font-medium px-4 py-3">상세</th>
        </tr>
      </thead>

      <tbody>
        {plants.map((p, idx) => (
          <tr key={p.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
            <td className="px-4 py-3 text-slate-900">{idx + 1}</td>
            <td className="px-4 py-3 text-slate-900">
              {p.plantName}
            </td>
            <td className="px-4 py-3 text-slate-900">{p.userId}</td>
            <td className="px-4 py-3 text-slate-900">{p.plantPrice}</td>
            <td className="px-4 py-3 text-slate-900">{p.address}</td>
            <td className="px-4 py-3 text-slate-900">{p.lat}</td>
            <td className="px-4 py-3 text-slate-900">{p.lng}</td>
            <td className="px-4 py-3 text-slate-900">
              <span
                className={cn(
                  "inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium",
                  p.useYn === "Y" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                )}
              >
                {p.useYn}
              </span>
            </td>

            <td className="px-4 py-3 text-slate-900">{p.startYmd}</td>
            <td className="px-4 py-3 text-slate-900">{p.startYear}</td>
            <td className="px-4 py-3 text-slate-900">{p.invCount}</td>
            <td className="px-4 py-3 text-slate-900">{p.regDate}</td>
            <td className="px-4 py-3 text-slate-900">
              <Button
                variant="blue"
                className="border px-2 py-1 rounded"
                onClick={() => onClickDetail(p)}
              >
                상세
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
