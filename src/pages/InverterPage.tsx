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

import { getUserPlantList2Request, getUserInverterList2Request, getInverterLastestRequest, getInverterSeriesRequest } from "../apis";

import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";
import type { InverterLatestRow } from "../apis/response/inverter/get-inverter-latest.response.dto";
import type { InverterSeriesRow } from "../apis/response/inverter/get-inverter-series.response.dto";
import { InverterInfoModal } from "../components/organisms/InverterInfoModal";

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
  // "2021-10-29T11:17:57" or "2021-10-29 11:17:57" 모두 대응
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

function bucketToHourLabel(bucketHour: string) {
  // 예: "2026-03-03 11" -> "11:00"
  const m = bucketHour.match(/(\d{2})$/);
  if (m?.[1]) return `${m[1]}:00`;
  return bucketHour;
}

export const InverterPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  const [loading, setLoading] = React.useState(false);
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

  const loadSeries = React.useCallback(
    async (targetInvId: number | null) => {
      if (!token || !targetInvId) {
        setSeriesRows([]);
        return;
      }

      try {
        const res = await getInverterSeriesRequest(token, {
          plantId: plantId === "ALL" ? undefined : plantId,
          invId: targetInvId,
        });

        if (!res) {
          setSeriesRows([]);
          return;
        }

        if ((res as any).code !== "SU") {
          setSeriesRows([]);
          setError((prev) => prev ?? (res as any).message ?? "시계열 조회 실패");
          return;
        }

        setSeriesRows(safeArray<InverterSeriesRow>((res as any).series));
      } catch (e: any) {
        setSeriesRows([]);
        setError((prev) => prev ?? e?.message ?? "시계열 조회 중 오류");
      }
    },
    [token, plantId]
  );

  React.useEffect(() => {
    loadLists();
  }, [loadLists]);

  React.useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  // 최신값이 바뀌면: (1) invId가 ALL이고 row가 1개면 자동으로 그 invId로 그래프 로드
  //              (2) invId가 선택돼 있으면 그걸로 그래프 로드
  React.useEffect(() => {
    if (invId !== "ALL") {
      loadSeries(invId);
      return;
    }
    if (latestRows.length === 1) {
      loadSeries(latestRows[0].invId);
      return;
    }
    setSeriesRows([]);
  }, [invId, latestRows, loadSeries]);

  const invOptionsForPlant = React.useMemo(() => {
    if (plantId === "ALL") return invList2;
    return invList2.filter((x) => x.plantId === plantId);
  }, [invList2, plantId]);

  const invCapacityMap = React.useMemo(() => {
    const m = new Map<number, number>();
    invList2.forEach((x) => {
      const n = parseInvIdToNumber(x.invId);
      if (n != null) m.set(n, Number(x.invCapacity ?? 0));
    });
    return m;
  }, [invList2]);

  const openInfoModal = (row: InverterLatestRow) => {
    // 최신 row.invId(숫자) -> invList2.invId(문자열) 매칭
    const meta =
      invList2.find((x) => parseInvIdToNumber(x.invId) === row.invId) ?? null;
    setSelectedMeta(meta);
    setInfoOpen(true);
  };

  const chartData = React.useMemo(() => {
    return seriesRows.map((s) => ({
      hour: bucketToHourLabel(s.bucketHour),
      value: Number(s.hourGenKwh ?? 0),
      samples: s.samples,
    }));
  }, [seriesRows]);

  return (
    <MainLayout activeMenu="/inverter">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="인버터" pageSubtitle="Inverter" />

        {/* 상단 필터/액션 */}
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
                  setInvId("ALL"); // 발전소 바꾸면 인버터 선택 리셋
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
                onClick={loadLatest}
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

          {/* 테이블 */}
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
                    const inP = Number(r.inPower ?? 0);
                    const outP = Number(r.outPower ?? 0);

                    const eff =
                      inP > 0 && outP >= 0 ? (outP / inP) * 100 : 0;

                    const cap = invCapacityMap.get(r.invId) ?? 0;
                    const util = cap > 0 ? (outP / cap) * 100 : 0;

                    return (
                      <tr key={`${r.id}-${idx}`} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                        <td className="px-3 py-2 text-slate-900">{idx + 1}</td>
                        <td className="px-3 py-2 text-slate-900">{r.invStatus}</td>
                        <td className="px-3 py-2 text-slate-700">{r.invFault}</td>

                        <td className="px-3 py-2 text-right">{fmtNum(r.inVolt, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.inCurrent, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.inPower, 1)}</td>

                        <td className="px-3 py-2 text-right">{fmtNum(r.outVolt1, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.outVolt2, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.outVolt3, 1)}</td>

                        <td className="px-3 py-2 text-right">{fmtNum(r.outCurrent1, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.outCurrent2, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.outCurrent3, 1)}</td>

                        <td className="px-3 py-2 text-right">{fmtNum(r.outPower, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(eff, 2)}</td>
                        <td className="px-3 py-2 text-right">
                          {cap > 0 ? fmtNum(util, 2) : "-"}
                        </td>

                        <td className="px-3 py-2 text-right">{fmtNum(r.hz, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.todayGen, 1)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.totalGen, 2)}</td>
                        <td className="px-3 py-2 text-slate-700">{fmtTime(r.recvTime)}</td>

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

        {/* 그래프 */}
        <section className="bg-white border rounded p-1">
          <div className="flex items-center justify-between">
            <div className="text-slate-900 font-semibold">그래프</div>
            <div className="text-xs text-slate-500">
              {invId === "ALL"
                ? (latestRows.length === 1 ? `대상: ${toInvLabel(latestRows[0].invId)}` : "인버터를 선택하면 그래프가 표시됩니다.")
                : `대상: ${toInvLabel(invId)}`}
            </div>
          </div>

          <div className="mt-4 h-[360px]">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                그래프 데이터가 없습니다.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" dot />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {/* 상세정보 모달 */}
      <InverterInfoModal
        open={infoOpen}
        inverter={selectedMeta}
        onClose={() => setInfoOpen(false)}
      />
    </MainLayout>
  );
};