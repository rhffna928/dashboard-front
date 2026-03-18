// src/pages/ReportPage.tsx
import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";

import {
  getUserPlantList2Request,
  getUserInverterList2Request,
  getInverterDailyRequest,
  getInverterMonthlyRequest,
  getInverterYearlyRequest,
} from "../apis";

type ReportType = "DAILY" | "MONTHLY" | "YEARLY";

type DailyReportItem = {
  hour: number;
  plantId: number;
  invId: number;
  totalValue: number;
  samples: number;
};

type MonthlyReportItem = {
  day: number;
  plantId: number;
  invId: number;
  totalValue: number;
  samples: number;
};

type YearlyReportItem = {
  month: number;
  plantId: number;
  invId: number;
  totalValue: number;
  samples: number;
};

type RawReportRow = {
  period: number;
  plantId: number;
  invId: number;
  totalValue: number;
  samples: number;
};

type PivotSeries = {
  key: string;
  label: string;
  plantId: number;
  invId: number;
};

type PivotRow = {
  period: number;
  label: string;
  values: Record<string, number>;
  total: number;
  samples: number;
};

function safeArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  return [v as T];
}

function toNumber(value: any, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function padInv(invId: number | string) {
  return String(invId).padStart(2, "0");
}

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toMonthInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function formatPeriodLabel(period: number, type: ReportType) {
  if (type === "DAILY") return `${String(period).padStart(2, "0")}:00`;
  if (type === "MONTHLY") return `${period}일`;
  return `${period}월`;
}

function formatNumber(value: number) {
  return Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function downloadCsv(filename: string, rows: Array<Record<string, any>>) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = String(v ?? "");
    const escaped = s.replaceAll('"', '""');
    return `"${escaped}"`;
  };

  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];

  const csv = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function normalizeReportList(res: any, type: ReportType): RawReportRow[] {
  if (type === "DAILY") {
    const items = safeArray<DailyReportItem>(res?.day);
    return items.map((item) => ({
      period: toNumber(item.hour),
      plantId: toNumber(item.plantId),
      invId: toNumber(item.invId),
      totalValue: toNumber(item.totalValue),
      samples: toNumber(item.samples),
    }));
  }

  if (type === "MONTHLY") {
    const items = safeArray<MonthlyReportItem>(res?.monthly);
    return items.map((item) => ({
      period: toNumber(item.day),
      plantId: toNumber(item.plantId),
      invId: toNumber(item.invId),
      totalValue: toNumber(item.totalValue),
      samples: toNumber(item.samples),
    }));
  }

  const items = safeArray<YearlyReportItem>(res?.year);
  return items.map((item) => ({
    period: toNumber(item.month),
    plantId: toNumber(item.plantId),
    invId: toNumber(item.invId),
    totalValue: toNumber(item.totalValue),
    samples: toNumber(item.samples),
  }));
}

export const ReportPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken ?? "";

  const today = React.useMemo(() => new Date(), []);

  const [reportType, setReportType] = React.useState<ReportType>("DAILY");
  const [targetDate, setTargetDate] = React.useState(() => toDateInputValue(today));
  const [targetYearMonth, setTargetYearMonth] = React.useState(() => toMonthInputValue(today));
  const [targetYear, setTargetYear] = React.useState(() => String(today.getFullYear()));

  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [plantId, setPlantId] = React.useState<"ALL" | number>("ALL");

  const [invList2, setInvList2] = React.useState<InverterList2Row[]>([]);
  const [invId, setInvId] = React.useState<"ALL" | string>("ALL");

  const [rows, setRows] = React.useState<RawReportRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const plantNameById = React.useMemo(() => {
    const m = new Map<number, string>();
    plants.forEach((p: any) => {
      if (p?.plantId != null) m.set(Number(p.plantId), String(p?.plantName ?? ""));
    });
    return m;
  }, [plants]);

  const invRowsForPlant = React.useMemo(() => {
    if (plantId === "ALL") {
      const seen = new Set<string>();
      const out: InverterList2Row[] = [];

      for (const x of invList2) {
        const raw = String((x as any).invId ?? "");
        if (!raw) continue;
        if (seen.has(raw)) continue;
        seen.add(raw);
        out.push(x);
      }
      return out;
    }

    return invList2.filter((x: any) => Number(x.plantId) === plantId);
  }, [invList2, plantId]);

  const fetchLists = React.useCallback(async () => {
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

  const fetchReports = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const commonParams = {
      plantId: plantId === "ALL" ? undefined : plantId,
      invId: invId === "ALL" ? undefined : Number(invId),
    };

    try {
      let res: any = null;

      if (reportType === "DAILY") {
        res = await getInverterDailyRequest(token, {
          ...commonParams,
          targetDate,
        } as any);
      } else if (reportType === "MONTHLY") {
        res = await getInverterMonthlyRequest(token, {
          ...commonParams,
          targetYearMonth,
        } as any);
      } else {
        res = await getInverterYearlyRequest(token, {
          ...commonParams,
          targetYear: Number(targetYear),
        } as any);
      }

      if (res && (res as any).code === "SU") {
        setRows(normalizeReportList(res, reportType));
      } else {
        setRows([]);
        setError((res as any)?.message ?? "보고서 조회 실패");
      }
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? "보고서 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [token, plantId, invId, reportType, targetDate, targetYearMonth, targetYear]);

  React.useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  React.useEffect(() => {
    setInvId("ALL");
  }, [plantId]);

  React.useEffect(() => {
    if (!token) return;
    fetchReports();
  }, [token, reportType, fetchReports]);

  const { series, pivotRows } = React.useMemo(() => {
    const seriesMap = new Map<string, PivotSeries>();
    const rowMap = new Map<number, PivotRow>();

    for (const row of rows) {
      const seriesKey =
        plantId === "ALL"
          ? `plant-${row.plantId}-inv-${row.invId}`
          : `inv-${row.invId}`;

      const seriesLabel =
        plantId === "ALL"
          ? `${plantNameById.get(row.plantId) ?? `PLANT-${row.plantId}`} / INV${padInv(row.invId)}`
          : `INV${padInv(row.invId)}`;

      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, {
          key: seriesKey,
          label: seriesLabel,
          plantId: row.plantId,
          invId: row.invId,
        });
      }

      if (!rowMap.has(row.period)) {
        rowMap.set(row.period, {
          period: row.period,
          label: formatPeriodLabel(row.period, reportType),
          values: {},
          total: 0,
          samples: 0,
        });
      }

      const target = rowMap.get(row.period)!;
      target.values[seriesKey] = toNumber(target.values[seriesKey]) + row.totalValue;
      target.total += row.totalValue;
      target.samples += row.samples;
    }

    const sortedSeries = Array.from(seriesMap.values()).sort((a, b) => {
      if (a.plantId !== b.plantId) return a.plantId - b.plantId;
      return a.invId - b.invId;
    });

    const sortedRows = Array.from(rowMap.values()).sort((a, b) => a.period - b.period);

    for (const row of sortedRows) {
      for (const s of sortedSeries) {
        if (row.values[s.key] == null) row.values[s.key] = 0;
      }
    }

    return {
      series: sortedSeries,
      pivotRows: sortedRows,
    };
  }, [rows, plantId, plantNameById, reportType]);

  const chartData = React.useMemo(() => {
    return pivotRows.map((row) => ({
      label: row.label,
      total: row.total,
    }));
  }, [pivotRows]);

  const maxChartValue = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((item) => item.total), 0);
  }, [chartData]);

  const summary = React.useMemo(() => {
    const grandTotal = pivotRows.reduce((acc, cur) => acc + cur.total, 0);
    const maxRow = pivotRows.reduce<PivotRow | null>((acc, cur) => {
      if (!acc) return cur;
      return cur.total > acc.total ? cur : acc;
    }, null);

    return {
      grandTotal,
      periodCount: pivotRows.length,
      maxLabel: maxRow?.label ?? "-",
      maxValue: maxRow?.total ?? 0,
    };
  }, [pivotRows]);

  const onClickSearch = () => {
    fetchReports();
  };

  const onClickExcel = () => {
    if (!pivotRows || pivotRows.length === 0) return;

    const csvRows = pivotRows.map((row, idx) => {
      const base: Record<string, any> = {
        번호: idx + 1,
        구분: row.label,
      };

      for (const s of series) {
        base[s.label] = row.values[s.key] ?? 0;
      }

      base["전체"] = row.total;
      return base;
    });

    const baseName =
      reportType === "DAILY"
        ? targetDate
        : reportType === "MONTHLY"
        ? targetYearMonth
        : targetYear;

    downloadCsv(`보고서_${reportType}_${baseName}.csv`, csvRows);
  };

  return (
    <MainLayout activeMenu="/report">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="보고서" pageSubtitle="Report" />

        {/* 필터 */}
        <section className="bg-white border rounded p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">조회구분</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`px-3 py-2 rounded text-sm border ${
                    reportType === "DAILY"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                  onClick={() => setReportType("DAILY")}
                >
                  일간
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 rounded text-sm border ${
                    reportType === "MONTHLY"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                  onClick={() => setReportType("MONTHLY")}
                >
                  월간
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 rounded text-sm border ${
                    reportType === "YEARLY"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                  onClick={() => setReportType("YEARLY")}
                >
                  연간
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700 w-[60px]">
                {reportType === "DAILY"
                  ? "기준일"
                  : reportType === "MONTHLY"
                  ? "기준월"
                  : "기준년도"}
              </div>

              {reportType === "DAILY" && (
                <input
                  type="date"
                  className="border rounded px-3 py-2 text-sm"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              )}

              {reportType === "MONTHLY" && (
                <input
                  type="month"
                  className="border rounded px-3 py-2 text-sm"
                  value={targetYearMonth}
                  onChange={(e) => setTargetYearMonth(e.target.value)}
                />
              )}

              {reportType === "YEARLY" && (
                <input
                  type="number"
                  className="border rounded px-3 py-2 text-sm w-[120px]"
                  min={2000}
                  max={2100}
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">발전소구분</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[180px]"
                value={plantId === "ALL" ? "ALL" : String(plantId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setPlantId(v === "ALL" ? "ALL" : Number(v));
                }}
              >
                <option value="ALL">전체</option>
                {plants.map((p: any) => (
                  <option key={p.plantId} value={String(p.plantId)}>
                    {p.plantName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">인버터</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[220px]"
                value={invId}
                onChange={(e) => setInvId(e.target.value)}
              >
                <option value="ALL">전체</option>
                {invRowsForPlant.map((inv: any) => {
                  const raw = String(inv.invId ?? "");
                  if (!raw) return null;

                  const key =
                    plantId === "ALL"
                      ? `inv:${raw}`
                      : `plant:${String(inv.plantId)}-inv:${raw}`;

                  const label = `INV${raw.padStart(2, "0")}${inv.invName ? ` - ${inv.invName}` : ""}`;

                  return (
                    <option key={key} value={raw}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="green" onClick={onClickSearch}>
                조회
              </Button>
              <Button variant="green" onClick={onClickExcel}>
                엑셀 저장
              </Button>
            </div>
          </div>
        </section>

        {/* 요약 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-slate-500">전체 합계</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {formatNumber(summary.grandTotal)}
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <div className="text-sm text-slate-500">최대 구간</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {summary.maxLabel}
            </div>
            <div className="text-sm text-slate-500">{formatNumber(summary.maxValue)}</div>
          </div>

          <div className="bg-white border rounded p-4">
            <div className="text-sm text-slate-500">구간 수</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.periodCount}
            </div>
          </div>
        </section>

        {/* 바그래프 */}
        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-900 font-semibold">
              {reportType === "DAILY"
                ? "일간 발전 그래프"
                : reportType === "MONTHLY"
                ? "월간 발전 그래프"
                : "연간 발전 그래프"}
            </div>
            <div className="text-sm text-slate-500">
              기준:{" "}
              {reportType === "DAILY"
                ? targetDate
                : reportType === "MONTHLY"
                ? targetYearMonth
                : targetYear}
            </div>
          </div>

          {loading ? (
            <div className="h-[320px] flex items-center justify-center text-slate-400">
              불러오는 중...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-slate-400">
              조회 결과가 없습니다.
            </div>
          ) : (
            <div className="border rounded p-4 overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="h-[300px] flex items-end gap-3">
                  {chartData.map((item, idx) => {
                    const height =
                      maxChartValue > 0 ? Math.max((item.total / maxChartValue) * 240, 4) : 4;

                    return (
                      <div
                        key={`${item.label}-${idx}`}
                        className="flex-1 min-w-[32px] flex flex-col items-center justify-end"
                        title={`${item.label} / ${formatNumber(item.total)}`}
                      >
                        <div className="text-[11px] text-slate-500 mb-2">
                          {formatNumber(item.total)}
                        </div>
                        <div
                          className="w-full max-w-[42px] bg-emerald-500 rounded-t transition-all"
                          style={{ height: `${height}px` }}
                        />
                        <div className="mt-2 text-[11px] text-slate-600 text-center break-all">
                          {item.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 테이블 */}
        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-900 font-semibold">
              {reportType === "DAILY"
                ? "일간 발전 보고서"
                : reportType === "MONTHLY"
                ? "월간 발전 보고서"
                : "연간 발전 보고서"}
            </div>
            <div className="text-sm text-slate-500">총 {pivotRows.length}건</div>
          </div>

          {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}

          <div className="border rounded overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3 w-[100px]">
                    {reportType === "DAILY"
                      ? "시간"
                      : reportType === "MONTHLY"
                      ? "일"
                      : "월"}
                  </th>

                  {series.map((s) => (
                    <th
                      key={s.key}
                      className="text-right font-medium px-4 py-3 min-w-[120px]"
                    >
                      {s.label}
                    </th>
                  ))}

                  <th className="text-right font-medium px-4 py-3 min-w-[120px]">전체</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={series.length + 2}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      불러오는 중...
                    </td>
                  </tr>
                ) : pivotRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={series.length + 2}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  pivotRows.map((row, idx) => (
                    <tr
                      key={`${reportType}-${row.period}-${idx}`}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                    >
                      <td className="px-4 py-3 text-slate-900 font-medium">{row.label}</td>

                      {series.map((s) => (
                        <td key={s.key} className="px-4 py-3 text-right text-slate-700">
                          {formatNumber(row.values[s.key] ?? 0)}
                        </td>
                      ))}

                      <td className="px-4 py-3 text-right text-slate-900 font-semibold">
                        {formatNumber(row.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};