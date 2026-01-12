import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import type { Inverter } from "../../types/interface/inverter.interface";

interface Props {
  data: Inverter[];
  title: string;
  onClose: () => void;
}

export const InverterChart: React.FC<Props> = ({ data, title, onClose }) => {
  const points = useMemo(() => {
    return (data ?? [])
      .map((r) => {
        // recvTime 포맷이 "2021-10-29 11:17:57" 이거나 "2021-10-29T11:17:57" 둘 다 대응
        const raw = String(r.recvTime ?? "");
        const time =
          raw.includes("T") ? raw.substring(11, 16) :
          raw.length >= 16 ? raw.substring(11, 16) :
          raw; // fallback

        const outPower = Number(r.outPower ?? 0);

        return { time, outPower };
      })
      // time이 이상한 값이면 제거
      .filter((p) => p.time && !Number.isNaN(p.outPower));
  }, [data]);

  return (
    <div className="bg-white p-4 border rounded">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold">
          인버터 {title} 발전 그래프
          <span className="ml-2 text-xs text-slate-500">
            (points: {points.length})
          </span>
        </div>
        <button className="border px-3 py-1 rounded" onClick={onClose}>
          닫기
        </button>
      </div>

      {points.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-slate-500">
          데이터가 없습니다. (API 응답이 비었거나 recvTime/outPower 파싱 실패)
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="outPower" stroke="#2563eb" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
