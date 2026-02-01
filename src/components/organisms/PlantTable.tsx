// src/components/organisms/PlantTable.tsx
import React from "react";
import type { Plant } from "../../types/interface/plant.interface";
import { Button } from "../atoms/Button";

interface Props {
  plants: Plant[];
  onClickDetail: (plant: Plant) => void;
}

export const PlantTable: React.FC<Props> = ({ plants, onClickDetail }) => {
  return (
    <table className="border-collapse w-full text-sm">
      <thead className="bg-slate-100">
        <tr>
          <th className="border px-2 py-1">번호</th>
          <th className="border px-2 py-1">발전소명</th>
          <th className="border px-2 py-1">접속 URL</th>
          <th className="border px-2 py-1">발전용량(kW)</th>
          <th className="border px-2 py-1">발전단가(원)</th>
          <th className="border px-2 py-1">주소</th>
          <th className="border px-2 py-1">위도</th>
          <th className="border px-2 py-1">경도</th>
          <th className="border px-2 py-1">활성화</th>
          <th className="border px-2 py-1">계량기</th>
          <th className="border px-2 py-1">센서망</th>
          <th className="border px-2 py-1">접속IP</th>
          <th className="border px-2 py-1">등록일</th>
          <th className="border px-2 py-1">상세</th>
        </tr>
      </thead>

      <tbody>
        {plants.map((p, idx) => (
          <tr key={p.id}>
            <td className="border px-2 py-1 text-center">{idx + 1}</td>
            <td className="border px-2 py-1 text-center text-red-600 underline cursor-pointer">
              {p.name}
            </td>
            <td className="border px-2 py-1 text-center">{p.connectUrl}</td>
            <td className="border px-2 py-1 text-center">{p.capacityKw}</td>
            <td className="border px-2 py-1 text-center">{p.plantPrice}</td>
            <td className="border px-2 py-1">{p.address}</td>
            <td className="border px-2 py-1 text-center">{p.lat}</td>
            <td className="border px-2 py-1 text-center">{p.lng}</td>
            <td className="border px-2 py-1 text-center">{p.activeYn}</td>
            <td className="border px-2 py-1 text-center">{p.meterYn}</td>
            <td className="border px-2 py-1 text-center">{p.sensorYn}</td>
            <td className="border px-2 py-1 text-center">{p.accessIpYn}</td>
            <td className="border px-2 py-1 text-center">{p.createdAt}</td>
            <td className="border px-2 py-1 text-center">
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
