import React from "react";

export type InverterPowerPoint = {
  timestamp: string; // ISO
  powerKw: number;
};

type Props = {
  title?: string;
  data: InverterPowerPoint[];
};

export default function InverterPowerChart({ title, data }: Props) {
  return (
    <section className="bg-white border rounded p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <div className="h-[360px] flex items-center justify-center text-slate-400 border rounded">
        (여기에 실제 차트 렌더링 - Recharts로 교체 예정)
        <span className="ml-2 text-slate-500">데이터 {data.length}개</span>
      </div>
    </section>
  );
}
