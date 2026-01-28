// src/pages/InverterHistoryPage.tsx
import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import { getInverterHistoryRequest } from "../apis";
import type { GetInverterHistoryRequestDto } from "../apis/request/inverter";

// 서버가 inverters에 담아주는 row (느슨하게 최소만)
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

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// datetime-local 기본값: YYYY-MM-DDTHH:mm
function toDateTimeLocalValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// 표시용
function formatDateTime(v: string) {
  if (!v) return "-";
  return v.replace("T", " ");
}

// SUCCESS/SU 둘 다 허용
function isSuccessCode(code: any) {
  return code === "SU" || code === "SUCCESS";
}

// 응답 normalize: 서버가 {inverters,totalElements,totalPages}로 준다고 했으니 그거 우선
function normalizeHistory(res: any, fallbackPage: number, fallbackSize: number) {
  // 1) 니 서버 형태: { code, message, inverters, totalElements, totalPages }
  if (Array.isArray(res?.inverters)) {
    return {
      items: res.inverters as InverterHistoryRow[],
      totalElements: Number(res.totalElements ?? res.inverters.length ?? 0),
      totalPages: Number(res.totalPages ?? 1),
      pageNumber: fallbackPage,
      size: fallbackSize,
    };
  }

  // 2) 혹시 Spring Page 감싼 형태도 대비(나중에 바뀔 수 있으니)
  const data = res?.data;
  if (data?.content && Array.isArray(data.content)) {
    return {
      items: data.content as InverterHistoryRow[],
      totalElements: Number(data.totalElements ?? 0),
      totalPages: Number(data.totalPages ?? 1),
      pageNumber: Number(data.number ?? fallbackPage),
      size: Number(data.size ?? fallbackSize),
    };
  }

  return {
    items: [],
    totalElements: 0,
    totalPages: 1,
    pageNumber: fallbackPage,
    size: fallbackSize,
  };
}

const PAGE_SIZE = 20;

export const HistoryPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  // ✅ 필터 기본값 (최근 24시간)
  const today = React.useMemo(() => new Date(), []);

  const [from, setFrom] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInputValue(d);
  });
  const [to, setTo] = React.useState(() => toDateInputValue(today));



  const [plantId, setPlantId] = React.useState<number | "">("");
  const [invId, setInvId] = React.useState<number | "">("");

  const bucketOptions = React.useMemo(
    () => [
      { value: 60, label: "60초" },
      { value: 300, label: "5분" },
      { value: 900, label: "15분" },
      { value: 1800, label: "30분" },
      { value: 3600, label: "1시간" },
    ],
    []
  );
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
      // 토큰 없으면 화면에 바로 표시(빈 화면 방지)
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

      // datetime-local 은 보통 seconds 없어서 붙여줌 (서버 LocalDateTime 파싱 안정화)
      const fromVal = from.length === 16 ? `${from}:00` : from;
      const toVal = to.length === 16 ? `${to}:00` : to;

      const params: GetInverterHistoryRequestDto = {
        plantId: plantId === "" ? undefined : Number(plantId),
        invId: invId === "" ? undefined : Number(invId),
        from: fromVal,
        to: toVal,
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
          setPage(norm.pageNumber);
        } else if (res) {
          setRows([]);
          setTotalElements(0);
          setTotalPages(1);
          setError((res as any)?.message ?? "인버터 기록 조회 실패");
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
        setError(e?.message ?? "인버터 기록 조회 실패");
      } finally {
        setLoading(false);
      }
    },
    [token, from, to, plantId, invId, bucketSec, page]
  );

  // ✅ 최초 로드
  React.useEffect(() => {
    fetchHistory(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <MainLayout activeMenu="/inverter-history">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="인버터 기록" pageSubtitle="Inverter History" />

        {/* ✅ 필터 */}
        <section className="bg-white border rounded p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700 w-[44px]">날짜</div>
              <input
                type="date"
                className="border rounded px-3 py-2 text-sm"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <span className="text-slate-500">~</span>
              <input
                type="date"
                className="border rounded px-3 py-2 text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">plantId</div>
              <input
                type="number"
                className="border rounded px-3 py-2 text-sm w-[120px]"
                value={plantId}
                onChange={(e) => setPlantId(e.target.value ? Number(e.target.value) : "")}
                placeholder="선택"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">invId</div>
              <input
                type="number"
                className="border rounded px-3 py-2 text-sm w-[120px]"
                value={invId}
                onChange={(e) => setInvId(e.target.value ? Number(e.target.value) : "")}
                placeholder="선택"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">간격</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[140px]"
                value={bucketSec}
                onChange={(e) => setBucketSec(Number(e.target.value))}
              >
                {bucketOptions.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="dark" onClick={onClickView}>
                보기
              </Button>
            </div>
          </div>

          {/* 토큰/에러 표시: 빈 화면 방지 */}
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
            <div className="text-slate-900 font-semibold">인버터 기록 목록</div>
            <div className="text-sm text-slate-500">
              총 {totalElements}건 · {page + 1}/{Math.max(1, totalPages)} 페이지
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3 w-[80px]">번호</th>
                  <th className="text-left font-medium px-4 py-3 w-[180px]">기록시각</th>
                  <th className="text-left font-medium px-4 py-3 w-[90px]">plant</th>
                  <th className="text-left font-medium px-4 py-3 w-[90px]">inv</th>
                  <th className="text-left font-medium px-4 py-3 w-[110px]">상태</th>
                  <th className="text-left font-medium px-4 py-3 w-[110px]">Fault</th>
                  <th className="text-left font-medium px-4 py-3 w-[90px]">inV</th>
                  <th className="text-left font-medium px-4 py-3 w-[90px]">inA</th>
                  <th className="text-left font-medium px-4 py-3 w-[100px]">inP</th>
                  <th className="text-left font-medium px-4 py-3 w-[100px]">outP</th>
                  <th className="text-left font-medium px-4 py-3 w-[80px]">Hz</th>
                  <th className="text-left font-medium px-4 py-3 w-[120px]">todayGen</th>
                  <th className="text-left font-medium px-4 py-3 w-[120px]">totalGen</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-10 text-center text-slate-400">
                      불러오는 중...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-10 text-center text-slate-400">
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                      <td className="px-4 py-3 text-slate-900">{idx + 1 + page * PAGE_SIZE}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(r.regdate)}</td>
                      <td className="px-4 py-3 text-slate-900">{r.plantId}</td>
                      <td className="px-4 py-3 text-slate-900">{r.invId}</td>
                      <td className="px-4 py-3 text-slate-900">{r.invStatus}</td>
                      <td className="px-4 py-3 text-slate-700">{r.invFault ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{r.inVolt}</td>
                      <td className="px-4 py-3 text-slate-700">{r.inCurrent}</td>
                      <td className="px-4 py-3 text-slate-700">{r.inPower}</td>
                      <td className="px-4 py-3 text-slate-700">{r.outPower}</td>
                      <td className="px-4 py-3 text-slate-700">{r.hz}</td>
                      <td className="px-4 py-3 text-slate-700">{r.todayGen}</td>
                      <td className="px-4 py-3 text-slate-700">{r.totalGen}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ 페이징 */}
          <div className="flex items-center justify-end mt-4 gap-2">
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
        </section>
      </div>
    </MainLayout>
  );
};