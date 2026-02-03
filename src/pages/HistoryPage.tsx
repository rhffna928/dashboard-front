// src/pages/HistoryPage.tsx
import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import { getInverterHistoryRequest } from "../apis";
import { getUserPlantList2Request, getUserInverterList2Request } from "../apis/index";

import type { GetInverterHistoryRequestDto } from "../apis/request/inverter";
import type { InverterHistoryRow } from "../types/interface/inverterHistory.interface";
import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 서버는 >= from, < toExclusive 형태가 안전하므로 그대로 유지
function toDateTimeStart(dateStr: string) {
  return `${dateStr}`;
}

function toDateTimeExclusiveEnd(dateStr: string) {
  const d = new Date(`${dateStr}`);
  d.setDate(d.getDate() + 1);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTime(v: string) {
  if (!v) return "-";
  return v.replace("T", " ");
}

function isSuccessCode(code: any) {
  return code === "SU" || code === "SUCCESS";
}

function normalizeHistory(
  res: any,
  fallbackPage: number,
  fallbackSize: number
): {
  items: InverterHistoryRow[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  size: number;
} {
  if (Array.isArray(res?.inverters)) {
    return {
      items: res.inverters as InverterHistoryRow[],
      totalElements: Number(res.totalElements ?? res.inverters.length ?? 0),
      totalPages: Number(res.totalPages ?? 1),
      pageNumber: Number(res.page ?? fallbackPage),
      size: Number(res.size ?? fallbackSize),
    };
  }
  return { items: [], totalElements: 0, totalPages: 1, pageNumber: fallbackPage, size: fallbackSize };
}

function downloadCsv(filename: string, rows: Array<Record<string, any>>) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = String(v ?? "");
    const escaped = s.replaceAll('"', '""');
    return `"${escaped}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  const csv = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function safeArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  return [v as T];
}

const PAGE_SIZE = 20;

export const HistoryPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  const today = React.useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInputValue(d);
  });
  const [toDate, setToDate] = React.useState(() => toDateInputValue(today));

  const deviceType: "INV" = "INV";

  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [invList2, setInvList2] = React.useState<InverterList2Row[]>([]);

  const [plantId, setPlantId] = React.useState<"ALL" | number>("ALL");
  const [invId, setInvId] = React.useState<"ALL" | number>("ALL");

  // label(분) / value(초)
  const intervalOptions = [
    { label: "1", sec: 1 },
    { label: "5", sec: 5 },
    { label: "15", sec: 15 },
    { label: "30", sec: 30 },
    { label: "60", sec: 60 },
  ];
  const [bucketSec, setBucketSec] = React.useState<number>(60);

  const [rows, setRows] = React.useState<InverterHistoryRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  // plantId -> plantName 빠르게 찾기
  const plantNameById = React.useMemo(() => {
    const m = new Map<number, string>();
    plants.forEach((p) => {
      if (p?.plantId != null) m.set(Number(p.plantId), String((p as any).plantName ?? ""));
    });
    return m;
  }, [plants]);

  // 발전소 선택에 따라 인버터 드롭다운 즉시 바뀜(서버 재조회 불필요)
  const invRowsForPlant = React.useMemo(() => {
    if (plantId === "ALL") return invList2;
    return invList2.filter((x) => Number(x.plantId) === plantId);
  }, [invList2, plantId]);

  // 목록(발전소/인버터) 로드는 token 바뀔 때 1번만
  const fetchLists = React.useCallback(async () => {
    if (!token) return;

    const [plantRes, invRes] = await Promise.all([
      getUserPlantList2Request(token),
      getUserInverterList2Request(token),
    ]);

    if (!plantRes || (plantRes as any).code !== "SU") {
      setPlants([]);
      setError((plantRes as any)?.message ?? "발전소 목록 조회 실패");
    } else {
      const list = safeArray<PlantList2Row>((plantRes as any).plantList2);
      setPlants(list);
    }

    if (!invRes || (invRes as any).code !== "SU") {
      setInvList2([]);
      setError((prev) => prev ?? (invRes as any)?.message ?? "인버터 목록 조회 실패");
    } else {
      const list = safeArray<InverterList2Row>((invRes as any).inverters);
      setInvList2(list);
    }
  }, [token]);

  const fetchHistory = React.useCallback(
    async (nextPage: number) => {
      if (!token) {
        setError("accessToken이 없습니다. 로그인 후 다시 시도하세요.");
        setRows([]);
        setTotalElements(0);
        setTotalPages(1);
        return;
      }

      setLoading(true);
      setError(null);

      const params: GetInverterHistoryRequestDto = {
        plantId: plantId === "ALL" ? undefined : plantId,
        invId: invId === "ALL" ? undefined : invId,
        from: toDateTimeStart(fromDate),
        to: toDateTimeExclusiveEnd(toDate),
        bucketSec,
        page: nextPage,
        size: PAGE_SIZE,
      };

      try {
        const res = await getInverterHistoryRequest(token, params);

        if (res && isSuccessCode((res as any).code)) {
          const norm = normalizeHistory(res, nextPage, PAGE_SIZE);
          setRows(norm.items);
          setTotalElements(norm.totalElements);
          setTotalPages(norm.totalPages);
          setPage(nextPage);
        } else if (res) {
          setRows([]);
          setTotalElements(0);
          setTotalPages(1);
          setError((res as any)?.message ?? "기록 조회 실패");
        } else {
          setRows([]);
          setTotalElements(0);
          setTotalPages(1);
          setError("서버 응답이 없습니다.");
        }
      } catch (e: any) {
        setRows([]);
        setTotalElements(0);
        setTotalPages(1);
        setError(e?.message ?? "기록 조회 실패");
      } finally {
        setLoading(false);
      }
    },
    [token, plantId, invId, fromDate, toDate, bucketSec]
  );

  // token 들어오면 목록 1회 로드
  React.useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // 필터 바뀌면 0페이지로 자동 조회
  React.useEffect(() => {
    setPage(0);
    fetchHistory(0);
  }, [plantId, invId, bucketSec, fromDate, toDate, fetchHistory]);

  const goPrev = () => {
    const next = Math.max(0, page - 1);
    fetchHistory(next);
  };

  const goNext = () => {
    const next = Math.min(totalPages - 1, page + 1);
    fetchHistory(next);
  };

  const onClickExcel = () => {
    if (!rows || rows.length === 0) return;

    const csvRows = rows.map((r: any, idx) => ({
      번호: idx + 1 + page * PAGE_SIZE,
      발전소: r.plantName ?? plantNameById.get(Number(r.plantId)) ?? `PLANT-${r.plantId}`,
      설비구분: deviceType,
      설비번호: `INV${String(r.invId).padStart(2, "0")}`,
      기록시각: formatDateTime(r.bucketTime),
      상태: r.invStatus,
      알람: r.invFault ?? "",
      전압_V: r.inVolt,
      전류_A: r.inCurrent,
      전력_kW: r.inPower,
      RS전압_V: r.outVolt1,
      ST전압_V: r.outVolt2,
      TR전압_V: r.outVolt3,
      R전류_A: r.outCurrent1,
      S전류_A: r.outCurrent2,
      T전류_A: r.outCurrent3,
      출력전력_kW: r.outPower,
      주파수_Hz: r.hz,
      금일발전_kWh: r.todayGen,
      누적발전_kWh: r.totalGen,
    }));

    downloadCsv(`History_${fromDate}_${toDate}.csv`, csvRows);
  };

  return (
    <MainLayout activeMenu="/history">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="기록" pageSubtitle="History" />

        {/* 필터 */}
        <section className="bg-white border rounded p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700 w-[44px]">날짜</div>
              <input
                type="date"
                className="border rounded px-3 py-2 text-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <span className="text-slate-500">~</span>
              <input
                type="date"
                className="border rounded px-3 py-2 text-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">시간간격</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[90px]"
                value={bucketSec}
                onChange={(e) => setBucketSec(Number(e.target.value))}
              >
                {intervalOptions.map((op) => (
                  <option key={op.sec} value={op.sec}>
                    {op.label}
                  </option>
                ))}
              </select>
              <span className="text-sm text-slate-600">분</span>
            </div>

            {/* 발전소구분 */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">발전소구분</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[180px]"
                value={plantId === "ALL" ? "ALL" : String(plantId)}
                onChange={(e) => {
                  const v = e.target.value;
                  const next = v === "ALL" ? "ALL" : Number(v);
                  setPlantId(next);
                  setInvId("ALL"); // 발전소 바뀌면 인버터 선택 리셋
                }}
              >
                <option value="ALL">전체</option>
                {plants.map((p) => (
                  <option key={p.plantId} value={String(p.plantId)}>
                    {(p as any).plantName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">설비구분</div>
              <select className="border rounded px-3 py-2 text-sm w-[120px]" value={deviceType}>
                <option value="INV">인버터</option>
              </select>
            </div>

            {/* 설비번호 */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">설비번호</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[180px]"
                value={invId === "ALL" ? "ALL" : String(invId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setInvId(v === "ALL" ? "ALL" : Number(v));
                }}
              >
                <option value="ALL">전체</option>
                {invRowsForPlant.map((inv) => (
                  <option key={inv.invId} value={String(inv.invId)}>
                    INV{String(inv.invId).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="green" onClick={onClickExcel}>
                엑셀 저장
              </Button>
            </div>
          </div>

          {!token && (
            <div className="mt-3 text-sm text-rose-600">
              accessToken이 없습니다. 로그인 상태를 확인하세요.
            </div>
          )}
          {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
        </section>

        {/* 테이블 */}
        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-900 font-semibold">
              [{deviceType}] -{" "}
              {plantId === "ALL" ? "발전소: 전체" : `발전소: ${plantId}`} ·{" "}
              {invId === "ALL" ? "인버터: 전체" : `인버터: INV${String(invId).padStart(2, "0")}`}
            </div>
            <div className="text-sm text-slate-500">
              총 {totalElements}건 · {page + 1}/{Math.max(1, totalPages)} 페이지
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3 w-[80px]">번호</th>
                  <th className="text-left font-medium px-4 py-3 w-[160px]">발전소</th>
                  <th className="text-left font-medium px-4 py-3 w-[100px]">인버터</th>
                  <th className="text-left font-medium px-4 py-3 w-[200px]">기록시각</th>
                  <th className="text-left font-medium px-4 py-3 w-[90px]">상태</th>
                  <th className="text-left font-medium px-4 py-3 w-[180px]">알람</th>

                  <th className="text-right font-medium px-4 py-3 w-[90px]">전압(V)</th>
                  <th className="text-right font-medium px-4 py-3 w-[90px]">전류(A)</th>
                  <th className="text-right font-medium px-4 py-3 w-[90px]">전력(kW)</th>

                  <th className="text-right font-medium px-4 py-3 w-[90px]">RS(V)</th>
                  <th className="text-right font-medium px-4 py-3 w-[90px]">ST(V)</th>
                  <th className="text-right font-medium px-4 py-3 w-[90px]">TR(V)</th>

                  <th className="text-right font-medium px-4 py-3 w-[90px]">R(A)</th>
                  <th className="text-right font-medium px-4 py-3 w-[90px]">S(A)</th>
                  <th className="text-right font-medium px-4 py-3 w-[90px]">T(A)</th>

                  <th className="text-right font-medium px-4 py-3 w-[100px]">출력(kW)</th>
                  <th className="text-right font-medium px-4 py-3 w-[90px]">주파수</th>

                  <th className="text-right font-medium px-4 py-3 w-[120px]">금일발전</th>
                  <th className="text-right font-medium px-4 py-3 w-[120px]">누적발전</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={19} className="px-4 py-10 text-center text-slate-400">
                      불러오는 중...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="px-4 py-10 text-center text-slate-400">
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((r: any, idx) => (
                    <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="px-4 py-3 text-slate-900">{idx + 1 + page * PAGE_SIZE}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.plantName ?? plantNameById.get(Number(r.plantId)) ?? `PLANT-${r.plantId}`}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        INV{String(r.invId).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(r.bucketTime)}</td>
                      <td className="px-4 py-3 text-slate-900">{r.invStatus}</td>
                      <td className="px-4 py-3 text-slate-700">{r.invFault ?? "-"}</td>

                      <td className="px-4 py-3 text-right">{r.inVolt}</td>
                      <td className="px-4 py-3 text-right">{r.inCurrent}</td>
                      <td className="px-4 py-3 text-right">{r.inPower}</td>

                      <td className="px-4 py-3 text-right">{r.outVolt1}</td>
                      <td className="px-4 py-3 text-right">{r.outVolt2}</td>
                      <td className="px-4 py-3 text-right">{r.outVolt3}</td>

                      <td className="px-4 py-3 text-right">{r.outCurrent1}</td>
                      <td className="px-4 py-3 text-right">{r.outCurrent2}</td>
                      <td className="px-4 py-3 text-right">{r.outCurrent3}</td>

                      <td className="px-4 py-3 text-right">{r.outPower}</td>
                      <td className="px-4 py-3 text-right">{r.hz}</td>

                      <td className="px-4 py-3 text-right">{r.todayGen}</td>
                      <td className="px-4 py-3 text-right">{r.totalGen}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이징 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              총 {totalElements}건 · {page + 1}/{Math.max(1, totalPages)} 페이지
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                onClick={goPrev}
                disabled={page <= 0 || loading}
                type="button"
              >
                이전
              </button>
              <button
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                onClick={goNext}
                disabled={page >= totalPages - 1 || loading}
                type="button"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};
