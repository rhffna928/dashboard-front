// src/components/organisms/DashboardMetrics.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { StatusBadge } from "../atoms/StatusBadge";
import swpenal from "../../assets/swpenal.png";

type MetricCardProps = {
  title: string;
  value: string;
  unit: string;
  colorClass: string;
  subtitle?: string;
};

const KeyMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  colorClass,
  subtitle,
}) => {
  return (
    <div
      className={[
        "rounded-md text-white",
        "px-3 py-2",
        "h-[74px] w-full",
        "flex flex-col justify-between",
        "shadow-sm",
        colorClass,
      ].join(" ")}
    >
      <div className="text-[12px] leading-4 opacity-95">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-[22px] font-bold leading-none">{value}</div>
        <div className="text-[11px] opacity-90 text-right">
          {unit}
          {subtitle ? <div className="opacity-80">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  );
};

// 더미 데이터(너 API 붙이면 여기만 교체)
const dailyBarData = [
  { t: "06", v: 0.0 },
  { t: "07", v: 0.2 },
  { t: "08", v: 0.8 },
  { t: "09", v: 1.6 },
  { t: "10", v: 1.5 },
  { t: "11", v: 1.5 },
  { t: "12", v: 1.0 },
  { t: "13", v: 0.6 },
  { t: "14", v: 0.5 },
  { t: "15", v: 0.3 },
  { t: "16", v: 0.2 },
];

const inverterLineData = [
  { t: "06", v: 0.0 },
  { t: "07", v: 0.1 },
  { t: "08", v: 0.5 },
  { t: "09", v: 1.6 },
  { t: "10", v: 1.5 },
  { t: "11", v: 1.6 },
  { t: "12", v: 1.2 },
  { t: "13", v: 0.7 },
  { t: "14", v: 0.6 },
  { t: "15", v: 0.4 },
  { t: "16", v: 0.2 },
];

export const DashboardMetrics: React.FC = () => {
  // react-router-dom 없는 프로젝트면 아래 2줄 대신 window.location.href 쓰면 됨
  const navigate = useNavigate();

  // ✅ “스크롤 덜 나게” 높이 다이어트 포인트:
  // - 이미지 h-44~h-52 정도
  // - 우측 차트 각각 h-40 내외
  // - 카드 높이 74px로 고정
  // 화면이 더 작으면 어쩔 수 없이 아래로 내려갈 수 있음(반응형)
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* LEFT: 발전소 현황 */}
      <section className="col-span-12 xl:col-span-5 bg-white border rounded-lg">
        <div className="px-4 py-3 border-b font-semibold text-[14px]">
          발전소 현황
        </div>

        <div className="p-4 space-y-3">
          {/* 정보 테이블(스크린샷처럼 2열) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="text-slate-600">준공연도</div>
            <div className="text-slate-900">2021. 1</div>

            <div className="text-slate-600">주소</div>
            <div className="text-slate-900">광주광역...</div>

            <div className="text-slate-600">발전용량</div>
            <div className="text-slate-900">3 kW</div>

            <div className="text-slate-600">인버터</div>
            <div className="text-slate-900">3 kW × 1대</div>

            <div className="text-slate-600">모듈정보</div>
            <div className="text-slate-900">250W × 12장</div>
          </div>

          {/* 이미지 */}
          <div className="w-full rounded-md overflow-hidden border">
            <img
              src={swpenal}
              alt="solar"
              className="w-full h-[220px] object-cover"
            />
          </div>

          {/* 인버터 현황 */}
          <div>
            <div className="font-semibold text-[14px] mb-2">인버터 현황</div>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-3 py-2 w-[90px]">
                      번호
                    </th>
                    <th className="text-left font-medium px-3 py-2 w-[90px]">
                      상태
                    </th>
                    <th className="text-left font-medium px-3 py-2">
                      출력전력
                    </th>
                    <th className="text-left font-medium px-3 py-2">
                      금일 발전량
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-3 py-2 border-t">INV01</td>
                    <td className="px-3 py-2 border-t">
                      <StatusBadge status="Run" />
                    </td>
                    <td className="px-3 py-2 border-t">2.5 kW</td>
                    <td className="px-3 py-2 border-t">5.5 kWh</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: 현재 발전량 + 그래프(같은 박스 안에 2개) */}
      <section className="col-span-12 xl:col-span-7 bg-white border rounded-lg">
        <div className="px-4 py-3 border-b font-semibold text-[14px]">
          현재 발전량
        </div>

        <div className="p-4 space-y-3">
          {/* 6개 카드: 한 줄 고정(스크린샷 느낌) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
            <KeyMetricCard title="현재 발전량" value="00" unit="kW" colorClass="bg-orange-600" />
            <KeyMetricCard title="금일 발전량" value="5.6" unit="kWh" colorClass="bg-pink-600" />
            <KeyMetricCard title="전일 발전량" value="9.8" unit="kWh" colorClass="bg-teal-600" />
            <KeyMetricCard title="월간 생산량" value="188.8" unit="kWh" colorClass="bg-blue-600" />
            <KeyMetricCard title="누적 발전량" value="19.7" unit="MWh" colorClass="bg-slate-700" />
            <KeyMetricCard title="발전 시간" value="1.87" unit="시간" colorClass="bg-slate-800" subtitle="가동시간" />
          </div>

          {/* 퍼센트 바 (작게) */}
          <div className="space-y-1">
            <div className="h-[10px] w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-[12%] bg-blue-600" />
            </div>
            <div className="text-[12px] text-slate-500 flex justify-between">
              <span>12%</span>
              <span>목표 대비</span>
            </div>
          </div>

          {/* 그래프 2개 (우측 패널 내부에 “위/아래”로) */}
          <div className="space-y-3">
            {/* 일일 발전량 */}
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-[13px] text-slate-800">
                  일일 발전량
                </div>
                <button
                  type="button"
                  className="text-[12px] text-slate-500 hover:text-slate-800"
                  onClick={() => navigate("/trend/daily")}
                >
                  view
                </button>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="v" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 인버터 일일 생산량 */}
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-[13px] text-slate-800">
                  인버터 일일 생산량
                </div>
                <button
                  type="button"
                  className="text-[12px] text-slate-500 hover:text-slate-800"
                  onClick={() => navigate("/trend/inverter")}
                >
                  view
                </button>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inverterLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="v" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
