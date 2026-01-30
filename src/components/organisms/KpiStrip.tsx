// src/components/organisms/KpiStrip.tsx
import React from "react";
import type { InverterList2Row } from "../../types/interface/inverterList.interface";
import { getDashboardKpiRequest } from "../../apis/index";
import type { DashboardKpi } from "../../types/interface/dashboardKpi.interface";

type Props = {
  token: string;
  invList2: InverterList2Row[]; // 드롭다운 옵션 소스
  plantId: number | null;
};

const ZERO_KPI: DashboardKpi = {
  genHours: 0,
  totalGenKwh: 0,
  monthGenKwh: 0,
  yesterdayGenKwh: 0,
  todayGenKwh: 0,
  currentPowerKw: 0,
};

function fmt(n: number, digits = 1) {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return "-";
  return v.toFixed(digits);
}

/**  invId 정규화: invId / inv_id 둘 다 대응 + 실패하면 null */
function toInvId(inv: any): number | null {
  const v = inv?.invId ?? inv?.inv_id;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ✅ ADD: capacity 정규화 (invCapacity / inv_capacity 둘 다 대응)
function toInvCapacityKw(inv: any): number {
  const v = inv?.invCapacity ?? inv?.inv_capacity ?? inv?.capacityKw ?? inv?.capacity_kw;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// ✅ ADD: clamp
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const KpiStrip: React.FC<Props> = ({ token, invList2, plantId}) => {
  const [selectedInvId, setSelectedInvId] = React.useState<number | null>(null);
  const [kpi, setKpi] = React.useState<DashboardKpi>(ZERO_KPI);
  const [loading, setLoading] = React.useState(false);

  /**  invList2(=현재 발전소의 인버터 목록)가 바뀌면 기본 선택을 잡아준다 */
  React.useEffect(() => {
    if (!invList2 || invList2.length === 0) {
      setSelectedInvId(null);
      setKpi(ZERO_KPI);
      return;
    }

    // invId가 유효한 첫 번째 인버터 찾기
    const firstValid = invList2.find((x: any) => toInvId(x) != null);
    const firstInvId = firstValid ? toInvId(firstValid) : null;

    if (firstInvId == null) {
      setSelectedInvId(null);
      setKpi(ZERO_KPI);
      return;
    }

    // 현재 선택된 invId가 목록에 없으면 첫 번째로 교체
    const exists =
      selectedInvId != null &&
      invList2.some((x: any) => toInvId(x) === selectedInvId);

    if (!exists) setSelectedInvId(firstInvId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invList2]);

  /**  selectedInvId 바뀔 때 KPI API 호출 */
  React.useEffect(() => {
    if (!token) return;
    if (selectedInvId == null) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const params = {
          invId: selectedInvId ?? undefined,
          plantId: plantId?? undefined,
        };

        const res = await getDashboardKpiRequest(token, params);

        if (cancelled) return;

        if (!res || (res as any).code !== "SU") {
          setKpi(ZERO_KPI);
          return;
        }

        const raw = (res as any).kpi ?? {};
        setKpi({
          genHours: Number(raw.genHours ?? 0),
          totalGenKwh: Number(raw.totalGenKwh ?? 0),
          monthGenKwh: Number(raw.monthGenKwh ?? 0),
          yesterdayGenKwh: Number(raw.yesterdayGenKwh ?? 0),
          todayGenKwh: Number(raw.todayGenKwh ?? 0),
          currentPowerKw: Number(raw.currentPowerKw ?? 0),
        });
      } catch {
        if (!cancelled) setKpi(ZERO_KPI);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, selectedInvId, plantId]);

  // ✅ ADD: 선택된 인버터 row(용량 계산용)
  const selectedInvRow = React.useMemo(() => {
    if (selectedInvId == null) return null;
    return invList2.find((x: any) => toInvId(x) === selectedInvId) ?? null;
  }, [invList2, selectedInvId]);

  // ✅ ADD: 퍼센트 = currentPowerKw / invCapacityKw
  const capacityKw = React.useMemo(() => toInvCapacityKw(selectedInvRow), [selectedInvRow]);
  const percent = React.useMemo(() => {
    if (!capacityKw) return 0;
    const p = (Number(kpi.currentPowerKw ?? 0) / capacityKw) * 100;
    return clamp(p, 0, 100);
  }, [kpi.currentPowerKw, capacityKw]);

  return (
    <section className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b font-semibold text-[14px] flex items-center justify-between">
        <span>실시간 발전량</span>

        {/*  KPI 내부에서 설비번호 select */}
        <div className="flex items-center gap-2">
          <div className="text-[12px] text-slate-600">설비번호</div>
          <select
            className="border rounded px-2 py-1 text-[12px] bg-white"
            value={selectedInvId ?? ""}
            onChange={(e) => setSelectedInvId(Number(e.target.value))}
            disabled={invList2.length === 0}
          >
            {invList2.length === 0 ? (
              <option value="">인버터 없음</option>
            ) : (
              invList2
                .map((inv: any) => {
                  const invId = toInvId(inv);
                  if (invId == null) return null;

                  const invName = (inv.invName ?? inv.inv_name ?? "") as string;
                  const key = inv.id ?? `${inv.plantId ?? inv.plant_id}-${invId}`;

                  return (
                    <option key={key} value={invId}>
                      {`INV${String(invId).padStart(2, "0")} (${invName})`}
                    </option>
                  );
                })
                .filter((x): x is JSX.Element => x !== null)
            )}
          </select>
        </div>
      </div>

      {/* ✅ ADD: 일자 바 게이지 (원래 화면의 퍼센트 느낌) */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-[12px] text-slate-600 mb-1">
          <div className="font-medium">
            {fmt(percent, 0)}%
            <span className="ml-2 text-slate-400">
              (현재 {fmt(kpi.currentPowerKw, 1)}kW / 용량 {capacityKw ? fmt(capacityKw, 1) : "-"}kW)
            </span>
          </div>
          {loading && <div className="text-slate-400">갱신 중…</div>}
        </div>

        <div className="h-[10px] rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        <Card title="현재 발전량" value={fmt(kpi.currentPowerKw, 1)} unit="kW" color="bg-orange-600" />
        <Card title="금일 발전량" value={fmt(kpi.todayGenKwh, 1)} unit="kWh" color="bg-pink-600" />
        <Card title="누적 발전량" value={fmt(kpi.totalGenKwh, 1)} unit="kWh" color="bg-slate-700" />
        <Card title="월간 생산량" value={fmt(kpi.monthGenKwh, 1)} unit="kWh" color="bg-teal-600" />
        <Card title="전일 발전량" value={fmt(kpi.yesterdayGenKwh, 1)} unit="kWh" color="bg-indigo-600" />
        <Card title="발전 시간" value={fmt(kpi.genHours, 1)} unit="h" color="bg-emerald-600" />
      </div>

      {loading && (
        <div className="px-4 pb-3 text-[12px] text-slate-500">KPI 갱신 중...</div>
      )}
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

export default KpiStrip;
