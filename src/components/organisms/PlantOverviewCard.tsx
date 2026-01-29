// src/components/organisms/PlantOverviewCard.tsx
import React from "react";
import swpenal from "../../assets/swpenal.png";
import type { PlantList2Row } from "../../types/interface/plantList2.interface";

type Props = {
  plant?: PlantList2Row;
  plants?: PlantList2Row[];
  selectedPlantId: number | null;
  onChangePlantId?: (plantId: number) => void;
};

export const PlantOverviewCard: React.FC<Props> = ({
  plant,
  plants = [],
  selectedPlantId,
  onChangePlantId,
}) => {
  return (
    <section className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b font-semibold text-[14px] flex items-center justify-between">
        <div>발전소 현황</div>

        {/* ✅ 발전소 여러개면 드롭다운 */}
        {plants.length > 1 ? (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedPlantId ?? ""}
            onChange={(e) => onChangePlantId?.(Number(e.target.value))}
          >
            {plants.map((p) => (
              <option key={p.plantId} value={p.plantId}>
                {p.plantName}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="p-4 space-y-3">
        {!plant ? (
          <div className="text-sm text-slate-500">발전소 정보가 없습니다.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-slate-600">발전소명</div>
              <div className="text-slate-900">{plant.plantName}</div>

              <div className="text-slate-600">주소</div>
              <div className="text-slate-900">{plant.address}</div>

              <div className="text-slate-600">발전용량</div>
              <div className="text-slate-900">{plant.plantCapacity}</div>

              <div className="text-slate-600">인버터 개수</div>
              <div className="text-slate-900">{plant.invCount}</div>

              <div className="text-slate-600">발전단가</div>
              <div className="text-slate-900">{plant.plantPrice}</div>
            </div>

            <div className="w-full rounded-md overflow-hidden border">
              <img src={swpenal} alt="solar" className="w-full h-[220px] object-cover" />
            </div>
          </>
        )}
      </div>
    </section>
  );
};
