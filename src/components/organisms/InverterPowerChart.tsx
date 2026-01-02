import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export type InverterPowerPoint = {
  // "2025-12-26T09:00:00+09:00" 같은 ISO 문자열 권장
  timestamp: string;
  // 전력(kW)
  powerKw: number;
};

type Props = {
  title?: string;
  unit?: string; // 기본: kW
  data: InverterPowerPoint[];
};

function formatHourLabel(iso: string) {
  // 간단 라벨: "09:00"
  // (서버에서 이미 "09:00" 형태로 내려줘도 됩니다)
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  return `${hh}:00`;
}

export default function InverterPowerChart({
  title = "전력 그래프",
  unit = "kW",
  data,
}: Props) {
  const chartData = useMemo(
    () =>
      data
        .slice()
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((p) => ({
          ...p,
          hourLabel: formatHourLabel(p.timestamp),
        })),
    [data]
  );

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
      </div>

      <div style={{ height: 420, padding: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hourLabel" />
            <YAxis
              tickFormatter={(v) => `${v}`}
              label={{ value: `출력전력 (${unit})`, angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: unknown) => [`${value} ${unit}`, "전력"]}
              labelFormatter={(label) => `시간: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="powerKw"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {chartData.length === 0 && (
          <div style={{ paddingTop: 12, color: "#6b7280" }}>
            데이터가 없습니다. (API 연동 예정)
          </div>
        )}
      </div>
    </div>
  );
}
