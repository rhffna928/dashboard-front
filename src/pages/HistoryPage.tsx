// src/pages/HistoryPage.tsx
import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import { getInverterHistoryRequest } from "../apis";
import type { GetInverterHistoryRequestDto } from "../apis/request/inverter";

// ✅ 서버가 inverters에 담아주는 row 기준
type InverterHistoryRow = {
  id: number;
  plantId: number;
  invId: number;
  invStatus: string;
  invFault?: string | null;

  inVolt: number;
  inCurrent: number;
  inPower: number;

  outVolt1: number;
  outVolt2: number;
  outVolt3: number;

  outCurrent1: number;
  outCurrent2: number;
  outCurrent3: number;

  outPower: number;
  hz: number;

  todayGen: number;
  totalGen: number;

  recvTime: string;
  regdate: string;
};

type ResponseDto = { code: string; message?: string };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// YYYY-MM-DD
function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// "2026-01-27" -> "2026-01-27"
function toDateTimeStart(dateStr: string) {
  return `${dateStr}`;
}

// to는 < 조건이므로 다음날 00:00:00로 보내는 게 안전
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
      pageNumber: Number(res.page ?? fallbackPage), // 서버가 page를 따로 안주면 fallback
      size: Number(res.size ?? fallbackSize),
    };
  }
  return { items: [], totalElements: 0, totalPages: 1, pageNumber: fallbackPage, size: fallbackSize };
}

// CSV 다운로드(엑셀 저장)
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

  const csv = "\uFEFF" + lines.join("\n"); // BOM(한글 깨짐 방지)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function arraysEqualNumber(a: number[], b: number[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

const PAGE_SIZE = 20;

export const HistoryPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  // ✅ UI: 날짜(스샷처럼)
  const today = React.useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // 기본 7일
    return toDateInputValue(d);
  });
  const [toDate, setToDate] = React.useState(() => toDateInputValue(today));

  // ✅ 설비구분: 지금은 INV 고정 (UI용)
  const deviceType: "INV" = "INV";

  // ✅ 설비번호: ALL 또는 특정 invId (드롭다운)
  const [invId, setInvId] = React.useState<"ALL" | number>("ALL");
  const [invIdOptions, setInvIdOptions] = React.useState<number[]>([]);

  // ✅ 시간간격(분 UI → bucketSec)
  const intervalOptions = [
    { label: "1", min: 60 },
    { label: "5", min: 300 },
    { label: "15", min: 900 },
    { label: "30", min: 1800 },
    { label: "60", min: 3600 },
  ];
  const [bucketSec, setBucketSec] = React.useState<number>(60);

  // ✅ 목록/상태
  const [rows, setRows] = React.useState<InverterHistoryRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ 페이징
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  const fetchHistory = React.useCallback(
    async (nextPage?: number) => {
      if (!token) {
        setError("accessToken이 없습니다. 로그인 후 다시 시도하세요.");
        setRows([]);
        setTotalElements(0);
        setTotalPages(1);
        return;
      }

      const p = typeof nextPage === "number" ? nextPage : page;

      setLoading(true);
      setError(null);

      const params: GetInverterHistoryRequestDto = {
        invId: invId === "ALL" ? undefined : invId,
        from: toDateTimeStart(fromDate),
        to: toDateTimeExclusiveEnd(toDate),
        bucketSec,
        page: p,
        size: PAGE_SIZE,
      };

      try {
        const res = await getInverterHistoryRequest(token, params);

        if (res && isSuccessCode((res as any).code)) {
          const norm = normalizeHistory(res, p, PAGE_SIZE);
          setRows(norm.items);
          setTotalElements(norm.totalElements);
          setTotalPages(norm.totalPages);
          setPage(p); // 서버가 page 안 주는 구조라 클라 기준으로 유지
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
    [token, fromDate, toDate, invId, bucketSec, page]
  );

  // ✅ 최초 1회 로드
  React.useEffect(() => {
    fetchHistory(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 핵심: "전체(ALL) 조회 결과"에서 invId 옵션을 누적 수집
  // - invId가 ALL일 때만
  // - rows 변경 시에만
  // - 실제 옵션이 바뀔 때만 setState (무한 렌더/렉 방지)
  React.useEffect(() => {
    if (invId !== "ALL") return;
    if (!rows || rows.length === 0) return;

    const next = Array.from(new Set(rows.map((r) => Number(r.invId)))).sort((a, b) => a - b);

    setInvIdOptions((prev) => {
      // 누적(이전 + 이번 페이지)로 원하면 아래처럼:
      const merged = Array.from(new Set([...prev, ...next])).sort((a, b) => a - b);
      if (arraysEqualNumber(prev, merged)) return prev; // ✅ 변경 없으면 set 안 함
      return merged;
    });
  }, [rows, invId]);

  const onClickView = () => {
    setPage(0);
    fetchHistory(0);
  };

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

    const csvRows = rows.map((r, idx) => ({
      번호: idx + 1 + page * PAGE_SIZE,
      설비구분: deviceType,
      설비번호: `INV${String(r.invId).padStart(2, "0")}`,
      기록시각: formatDateTime(r.regdate),
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

        {/* ✅ 필터 */}
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
                    <option key={op.min} value={op.min}>{op.label}</option>
                  ))}
                </select>
                <span className="text-sm text-slate-600">분</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">설비구분</div>
              <select className="border rounded px-3 py-2 text-sm w-[120px]" value={deviceType}>
                <option value="INV">인버터</option>
              </select>
            </div>

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
                {invIdOptions.map((id) => (
                  <option key={id} value={String(id)}>
                    INV{String(id).padStart(2, "0")}
                  </option>
                ))}
              </select>
              {/* ✅ 옵션이 비어있으면: 먼저 "전체(ALL)"로 한번 조회(보기)해서 invId를 모으면 됨 */}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="dark" onClick={onClickView}>
                보기
              </Button>
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

        {/* ✅ 테이블 */}
        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-900 font-semibold">
              [{deviceType === "INV" ? "인버터" : deviceType}] -{" "}
              {invId === "ALL" ? "전체" : `INV${String(invId).padStart(2, "0")}`}
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
                  <th className="text-left font-medium px-4 py-3 w-[160px]">기록시각</th>
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
                    <td colSpan={17} className="px-4 py-10 text-center text-slate-400">
                      불러오는 중...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="px-4 py-10 text-center text-slate-400">
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                      <td className="px-4 py-3 text-slate-900">{idx + 1 + page * PAGE_SIZE}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(r.regdate)}</td>
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

          {/* ✅ 페이징 */}
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
}
