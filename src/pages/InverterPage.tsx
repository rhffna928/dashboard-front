import React from "react";
import { useCookies } from "react-cookie";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import {
  getUserPlantList2Request,
  getUserInverterList2Request,
  getInverterLastestRequest,
  getInverterSeriesRequest,
} from "../apis";

import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";
import type { InverterLatestRow } from "../apis/response/inverter/get-inverter-latest.response.dto";
import type { InverterSeriesRow } from "../apis/response/inverter/get-inverter-series.response.dto";
import { InverterInfoModal } from "../components/organisms/InverterInfoModal";

const LINE_COLORS = [
  "#16a34a",
  "#2563eb",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#4f46e5",
  "#65a30d",
  "#db2777",
];

function safeArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  return [v as T];
}

function fmtNum(v: any, digits = 1) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(digits);
}

function fmtTime(v: string | null | undefined) {
  if (!v) return "-";
  return v.replace("T", " ");
}

function toInvLabel(invId: number) {
  const s = String(invId);
  return `INV${s.padStart(2, "0")}`;
}

function parseInvIdToNumber(invId: string) {
  const onlyDigits = invId.replaceAll(/[^\d]/g, "");
  const n = Number(onlyDigits);
  return Number.isFinite(n) ? n : null;
}

/**
 * "2026-03-19 15:00:00" -> "15:00"
 * "2026-03-19T15:00:00" -> "15:00"
 */
function bucketToHourLabel(bucketHour: string) {
  if (!bucketHour) return "-";

  const normalized = bucketHour.replace("T", " ");
  const m = normalized.match(/\s(\d{2}):(\d{2}):\d{2}$/);
  if (m) return `${m[1]}:${m[2]}`;

  return normalized;
}

type ChartSeriesMeta = {
  key: string;
  label: string;
  color: string;
  plantId: number;
  invId: number;
};

export const InverterPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken ?? "";

  const [loading, setLoading] = React.useState(false);
  const [seriesLoading, setSeriesLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 필터용 리스트
  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [invList2, setInvList2] = React.useState<InverterList2Row[]>([]);

  // 선택값
  const [plantId, setPlantId] = React.useState<number | "ALL">("ALL");
  const [invId, setInvId] = React.useState<number | "ALL">("ALL");

  // 화면 데이터
  const [latestRows, setLatestRows] = React.useState<InverterLatestRow[]>([]);
  const [seriesRows, setSeriesRows] = React.useState<InverterSeriesRow[]>([]);

  // 모달
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [selectedMeta, setSelectedMeta] = React.useState<InverterList2Row | null>(null);

  const plantNameById = React.useMemo(() => {
    const m = new Map<number, string>();
    plants.forEach((p: any) => {
      if (p?.plantId != null) {
        m.set(Number(p.plantId), String(p?.plantName ?? ""));
      }
    });
    return m;
  }, [plants]);

  const loadLists = React.useCallback(async () => {
    if (!token) return;
    setError(null);

    const [plantRes, invRes] = await Promise.all([
      getUserPlantList2Request(token),
      getUserInverterList2Request(token),
    ]);

    if (!plantRes || (plantRes as any).code !== "SU") {
      setPlants([]);
      setError((plantRes as any)?.message ?? "발전소 목록 조회 실패");
    } else {
      setPlants(safeArray<PlantList2Row>((plantRes as any).plantList2));
    }

    if (!invRes || (invRes as any).code !== "SU") {
      setInvList2([]);
      setError((prev) => prev ?? (invRes as any)?.message ?? "인버터 목록 조회 실패");
    } else {
      setInvList2(safeArray<InverterList2Row>((invRes as any).inverters));
    }
  }, [token]);

  const loadLatest = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getInverterLastestRequest(token, {
        plantId: plantId === "ALL" ? undefined : plantId,
        invId: invId === "ALL" ? undefined : invId,
      });

      if (!res) {
        setLatestRows([]);
        setError("서버 응답이 없습니다.");
        return;
      }

      if ((res as any).code !== "SU") {
        setLatestRows([]);
        setError((res as any).message ?? "인버터 최신값 조회 실패");
        return;
      }

      setLatestRows(safeArray<InverterLatestRow>((res as any).inverters));
    } catch (e: any) {
      setLatestRows([]);
      setError(e?.message ?? "인버터 최신값 조회 중 오류");
    } finally {
      setLoading(false);
    }
  }, [token, plantId, invId]);

  const loadSeries = React.useCallback(async () => {
    if (!token) {
      setSeriesRows([]);
      return;
    }

    setSeriesLoading(true);

    try {
      const requestParams = {
        plantId: plantId === "ALL" ? undefined : plantId,
        invId: invId === "ALL" ? undefined : invId,
      };

      const res = await getInverterSeriesRequest(token, requestParams as any);

      if (!res) {
        setSeriesRows([]);
        return;
      }

      if ((res as any).code !== "SU") {
        setSeriesRows([]);
        setError((prev) => prev ?? (res as any).message ?? "시계열 조회 실패");
        return;
      }

      const rows = safeArray<InverterSeriesRow>((res as any).series);
      const sorted = [...rows].sort((a, b) =>
        String(a.bucketHour).localeCompare(String(b.bucketHour))
      );

      setSeriesRows(sorted);
    } catch (e: any) {
      setSeriesRows([]);
      setError((prev) => prev ?? e?.message ?? "시계열 조회 중 오류");
    } finally {
      setSeriesLoading(false);
    }
  }, [token, plantId, invId]);

  React.useEffect(() => {
    loadLists();
  }, [loadLists]);

  React.useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  React.useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const invOptionsForPlant = React.useMemo(() => {
    if (plantId === "ALL") return invList2;
    return invList2.filter((x) => x.plantId === plantId);
  }, [invList2, plantId]);

  const invCapacityMap = React.useMemo(() => {
    const m = new Map<number, number>();
    invList2.forEach((x) => {
      const n = parseInvIdToNumber(x.invId);
      if (n != null) m.set(n, Number((x as any).invCapacity ?? 0));
    });
    return m;
  }, [invList2]);

  const openInfoModal = (row: InverterLatestRow) => {
    const meta =
      invList2.find((x) => parseInvIdToNumber(x.invId) === row.invId) ?? null;
    setSelectedMeta(meta);
    setInfoOpen(true);
  };

  const chartSeries = React.useMemo(() => {
    const map = new Map<string, ChartSeriesMeta>();
    let colorIndex = 0;

    for (const row of seriesRows) {
      const key = `p${row.plantId}_i${row.invId}`;

      if (!map.has(key)) {
        const plantName =
          plantNameById.get(Number(row.plantId)) ?? `PLANT${row.plantId}`;

        const label =
          plantId === "ALL"
            ? `${plantName} / ${toInvLabel(Number(row.invId))}`
            : `${toInvLabel(Number(row.invId))}`;

        map.set(key, {
          key,
          label,
          color: LINE_COLORS[colorIndex % LINE_COLORS.length],
          plantId: Number(row.plantId),
          invId: Number(row.invId),
        });

        colorIndex += 1;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.plantId !== b.plantId) return a.plantId - b.plantId;
      return a.invId - b.invId;
    });
  }, [seriesRows, plantId, plantNameById]);

  const chartData = React.useMemo(() => {
    const rowMap = new Map<string, any>();

    for (const row of seriesRows) {
      const bucketKey = String(row.bucketHour);
      const seriesKey = `p${row.plantId}_i${row.invId}`;

      if (!rowMap.has(bucketKey)) {
        rowMap.set(bucketKey, {
          bucketHour: row.bucketHour,
          hour: bucketToHourLabel(String(row.bucketHour)),
        });
      }

      const target = rowMap.get(bucketKey);
      target[seriesKey] = Number(row.hourGenKwh ?? 0);
    }

    const result = Array.from(rowMap.values()).sort((a, b) =>
      String(a.bucketHour).localeCompare(String(b.bucketHour))
    );

    for (const row of result) {
      for (const s of chartSeries) {
        if (row[s.key] == null) row[s.key] = 0;
      }
    }

    return result;
  }, [seriesRows, chartSeries]);

  const chartTargetText = React.useMemo(() => {
    if (chartSeries.length === 0) return "그래프 데이터가 없습니다.";
    if (chartSeries.length === 1) return `대상: ${chartSeries[0].label}`;
    return `대상: ${chartSeries.length}개 시리즈`;
  }, [chartSeries]);

  return (
    <MainLayout activeMenu="/inverter">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="인버터" pageSubtitle="Inverter" />

        <section className="bg-white border rounded p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-slate-900 font-semibold">인버터 현황</div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className="border rounded px-3 py-2 text-sm"
                value={plantId === "ALL" ? "ALL" : String(plantId)}
                onChange={(e) => {
                  const v = e.target.value;
                  const next = v === "ALL" ? "ALL" : Number(v);
                  setPlantId(next);
                  setInvId("ALL");
                }}
              >
                <option value="ALL">전체 발전소</option>
                {plants.map((p) => (
                  <option key={p.plantId} value={p.plantId}>
                    {p.plantId} - {p.plantName}
                  </option>
                ))}
              </select>

              <select
                className="border rounded px-3 py-2 text-sm"
                value={invId === "ALL" ? "ALL" : String(invId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setInvId(v === "ALL" ? "ALL" : Number(v));
                }}
              >
                <option value="ALL">전체 인버터</option>
                {invOptionsForPlant
                  .map((x) => parseInvIdToNumber(x.invId))
                  .filter((x): x is number => x != null)
                  .sort((a, b) => a - b)
                  .map((n) => (
                    <option key={n} value={n}>
                      {toInvLabel(n)}
                    </option>
                  ))}
              </select>

              <Button
                onClick={() => {
                  loadLatest();
                  loadSeries();
                }}
                className="px-3 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm"
              >
                새로고침
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded border border-rose-200 bg-rose-50 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div className="mt-5 border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3 text-left font-medium">번호</th>
                  <th className="px-3 py-3 text-left font-medium">상태</th>
                  <th className="px-3 py-3 text-left font-medium">알람</th>

                  <th className="px-3 py-3 text-right font-medium">전압(V)</th>
                  <th className="px-3 py-3 text-right font-medium">전류(A)</th>
                  <th className="px-3 py-3 text-right font-medium">전력(kW)</th>

                  <th className="px-3 py-3 text-right font-medium">RS전압(V)</th>
                  <th className="px-3 py-3 text-right font-medium">ST전압(V)</th>
                  <th className="px-3 py-3 text-right font-medium">TR전압(V)</th>

                  <th className="px-3 py-3 text-right font-medium">R전류(A)</th>
                  <th className="px-3 py-3 text-right font-medium">S전류(A)</th>
                  <th className="px-3 py-3 text-right font-medium">T전류(A)</th>

                  <th className="px-3 py-3 text-right font-medium">전력(kW)</th>
                  <th className="px-3 py-3 text-right font-medium">변환효율(%)</th>
                  <th className="px-3 py-3 text-right font-medium">이용률(%)</th>

                  <th className="px-3 py-3 text-right font-medium">주파수(Hz)</th>
                  <th className="px-3 py-3 text-right font-medium">금일발전(kWh)</th>
                  <th className="px-3 py-3 text-right font-medium">누적발전(MWh)</th>
                  <th className="px-3 py-3 text-left font-medium">마지막 수신</th>
                  <th className="px-3 py-3 text-center font-medium">상세</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={20} className="px-4 py-10 text-center text-slate-400">
                      불러오는 중...
                    </td>
                  </tr>
                ) : latestRows.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="px-4 py-10 text-center text-slate-400">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  latestRows.map((r, idx) => {
                    const inP = Number((r as any).inPower ?? 0);
                    const outP = Number((r as any).outPower ?? 0);

                    const eff = inP > 0 && outP >= 0 ? (outP / inP) * 100 : 0;

                    const cap = invCapacityMap.get((r as any).invId) ?? 0;
                    const util = cap > 0 ? (outP / cap) * 100 : 0;

                    return (
                      <tr
                        key={`${(r as any).id}-${idx}`}
                        className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                      >
                        <td className="px-3 py-2 text-slate-900">{idx + 1}</td>
                        <td className="px-3 py-2 text-slate-900">{(r as any).invStatus}</td>
                        <td className="px-3 py-2 text-slate-700">{(r as any).invFault}</td>

                        <td className="px-3 py-2 text-right">{fmtNum((r as any).inVolt, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum((r as any).inCurrent, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum((r as any).inPower, 1)}</td>

                        <td className="px-3 py-2 text-right">{fmtNum((r as any).outVolt1, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum((r as any).outVolt2, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum((r as any).outVolt3, 1)}</td>

                        <td className="px-3 py-2 text-right">{fmtNum((r as any).outCurrent1, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum((r as any).outCurrent2, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum((r as any).outCurrent3, 1)}</td>

                        <td className="px-3 py-2 text-right">{fmtNum((r as any).outPower, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(eff, 2)}</td>
                        <td className="px-3 py-2 text-right">
                          {cap > 0 ? fmtNum(util, 2) : "-"}
                        </td>

                        <td className="px-3 py-2 text-right">{fmtNum((r as any).hz, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum((r as any).todayGen, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum((r as any).totalGen, 2)}</td>
                        <td className="px-3 py-2 text-slate-700">{fmtTime((r as any).recvTime)}</td>

                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => openInfoModal(r)}
                            className="px-3 py-1.5 rounded bg-slate-700 text-white hover:bg-slate-800"
                          >
                            상세정보
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between">
            <div className="text-slate-900 font-semibold">그래프</div>
            <div className="text-xs text-slate-500">{chartTargetText}</div>
          </div>

          <div className="mt-4 h-[420px]">
            {seriesLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                그래프 불러오는 중...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                그래프 데이터가 없습니다.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${fmtNum(value, 1)} kWh`,
                      String(name),
                    ]}
                    labelFormatter={(label: any, payload: any) => {
                      const row = payload?.[0]?.payload;
                      return row?.bucketHour ? fmtTime(row.bucketHour) : String(label);
                    }}
                  />

                  {chartSeries.map((series) => (
                    <Line
                      key={series.key}
                      type="monotone"
                      dataKey={series.key}
                      name={series.label}
                      stroke={series.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {chartSeries.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {chartSeries.map((series) => (
                <div key={series.key} className="flex items-center gap-2 text-xs text-slate-600">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: series.color }}
                  />
                  <span>{series.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <InverterInfoModal
        open={infoOpen}
        inverter={selectedMeta}
        onClose={() => setInfoOpen(false)}
      />
    </MainLayout>
  );
};