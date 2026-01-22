// src/pages/AlarmPage.tsx
import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import { getAlramListRequest, getAlramDeviceTypeListRequest } from "../apis";

// 네 프로젝트의 apis/response 구조에 맞게 타입 import 경로를 조정해줘.
// (여기서는 페이지 컴포넌트 내부에서 "느슨하게" 대응하도록 any를 쓰지 않기 위해 최소 타입만 정의)
type ResponseDto = { code: string; message?: string };

type AlarmRow = {
  id: number;
  plantId: number;
  deviceType: string; // ex) "INV"
  deviceId: string;   // ex) "01"
  deviceName: string;
  alarmMessage: string;
  alarmFlag: string;  // "발생" | "해제" 등
  alertFlag: string; 
  regDate: string; // ISO
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const PAGE_SIZE = 15;

// YYYY-MM-DD
function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatregDate(isoOrDateTime: string) {
  // 백엔드가 "2022-05-13T05:57" 같이 올 수도 있어서 안전 처리
  if (!isoOrDateTime) return "-";
  return isoOrDateTime.replace("T", " ");
}

/**
 * 백엔드 응답이
 * A) { code, message, data: { content, totalElements, totalPages, number, size } }
 * B) { code, message, alarms, totalElements, totalPages }
 * 둘 중 무엇이든 AlarmPage가 동일하게 쓰도록 표준 형태로 변환
 */
function normalizeAlarmList(
  res: any,
  fallbackPage: number,
  fallbackSize: number
): {
  items: AlarmRow[];
  totalElements: number;
  totalPages: number;
  pageNumber: number; // 0-based
  size: number;
} {
  // A) data.content 형태
  const data = res?.data;
  if (data?.content && Array.isArray(data.content)) {
    return {
      items: data.content as AlarmRow[],
      totalElements: Number(data.totalElements ?? 0),
      totalPages: Number(data.totalPages ?? 1),
      pageNumber: Number(data.number ?? fallbackPage),
      size: Number(data.size ?? fallbackSize),
    };
  }

  // B) alarms 형태
  if (res?.alarms && Array.isArray(res.alarms)) {
    return {
      items: res.alarms as AlarmRow[],
      totalElements: Number(res.totalElements ?? res.alarms.length ?? 0),
      totalPages: Number(res.totalPages ?? 1),
      pageNumber: fallbackPage,
      size: fallbackSize,
    };
  }

  // empty
  return {
    items: [],
    totalElements: 0,
    totalPages: 1,
    pageNumber: fallbackPage,
    size: fallbackSize,
  };
}

function downloadCsv(filename: string, rows: Array<Record<string, any>>) {
  const headers = Object.keys(rows[0] ?? {});
  const escape = (v: any) => {
    const s = String(v ?? "");
    // 쉼표/따옴표/개행 방어
    const escaped = s.replaceAll('"', '""');
    return `"${escaped}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];
  const csv = "\uFEFF" + lines.join("\n"); // 엑셀 한글 깨짐 방지 BOM
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export const AlarmPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  // ✅ 필터 기본값
  const today = React.useMemo(() => new Date(), []);
  const [from, setFrom] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInputValue(d);
  });
  const [to, setTo] = React.useState(() => toDateInputValue(today));

  // 설비구분(디바이스 타입): 우선 고정 옵션
  const deviceTypeOptions = React.useMemo(
    () => [
      { value: "ALL", label: "전체" },
      { value: "INV", label: "인버터" },
      // 필요 시 확장:
      // { value: "MTR", label: "계측기" },
      // { value: "ETC", label: "기타" },
    ],
    []
  );
  const [deviceType, setDeviceType] = React.useState<string>("INV");

  // 설비번호(디바이스 ID) 옵션: API로 받아오기
  const [deviceIds, setDeviceIds] = React.useState<string[]>([]);
  const [deviceId, setDeviceId] = React.useState<string>("ALL");

  // ✅ 목록/상태
  const [alarms, setAlarms] = React.useState<AlarmRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ 페이징(서버 페이징)
  const [page, setPage] = React.useState(0); // 0-based
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  // plantId가 필요하면 여기에 state 추가해서 params에 넣으면 됨
  const plantId: number | null = null;

  const fetchDeviceIds = React.useCallback(async () => {
    if (!token) return;

    try {
      const res = await getAlramDeviceTypeListRequest(token, {
        plantId,
        from,
        to,
        deviceType: deviceType ?? "ALL",
      } as any);

      if (res && (res as any).code === "SU") {
        // 응답이 data?: string[] 형태거나, deviceIds 형태일 수 있어서 둘 다 대응
        const list: string[] =
          (res as any).data ??
          (res as any).deviceIds ??
          [];

        setDeviceIds(list);
        // 현재 선택값이 옵션에 없으면 ALL로 리셋
        if (deviceId !== "ALL" && !list.includes(deviceId)) {
          setDeviceId("ALL");
        }
      } else {
        // 옵션 조회 실패해도 페이지는 살려두되, 옵션은 비움
        setDeviceIds([]);
        setDeviceId("ALL");
      }
    } catch {
      setDeviceIds([]);
      setDeviceId("ALL");
    }
  }, [token, plantId, from, to, deviceType, deviceId]);

  const fetchAlarms = React.useCallback(
    async (nextPage?: number) => {
      if (!token) return;
      
      const p = typeof nextPage === "number" ? nextPage : page;

      setLoading(true);
      setError(null);
      const params = {
        plantId: plantId ?? undefined,
        from,
        to,
        deviceType: deviceType ?? "ALL",
        deviceId: deviceId ?? "ALL",
        page: p,
        size: PAGE_SIZE
      }
      
      try {
        const res = await getAlramListRequest(token,params);

        if (res && (res as any).code === "SU") {
          
          const norm = normalizeAlarmList(res, p, PAGE_SIZE);

          setAlarms(norm.items);
          setTotalElements(norm.totalElements);
          setTotalPages(norm.totalPages);
          setPage(norm.pageNumber); // 서버가 number 주면 거기 맞춤
        } else {
          setAlarms([]);
          setTotalElements(0);
          setTotalPages(1);
          setError((res as any)?.message ?? "알람 목록 조회 실패");
        }
      } catch (e: any) {
        setAlarms([]);
        setTotalElements(0);
        setTotalPages(1);
        setError(e?.message ?? "알람 목록 조회 실패");
      } finally {
        setLoading(false);
      }
    },
    [token, plantId, from, to, deviceType, deviceId, page]
  );

  // ✅ 최초 로드: 옵션 + 목록
  React.useEffect(() => {
    fetchDeviceIds();
    fetchAlarms(0);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 설비구분/날짜 변경 시: 설비번호 옵션 갱신 + 페이지 0으로
  React.useEffect(() => {
    setPage(0);
    fetchDeviceIds();
    // deviceId는 fetchDeviceIds 내부에서 존재성 체크로 유지/리셋 처리
  }, [from, to, deviceType, fetchDeviceIds]);

  const onClickView = () => {
    fetchAlarms(0);
  };

  const goPrev = () => {
    const next = Math.max(0, page - 1);
    fetchAlarms(next);
  };

  const goNext = () => {
    const next = Math.min(totalPages - 1, page + 1);
    fetchAlarms(next);
  };

  const onClickExcel = () => {
    if (!alarms || alarms.length === 0) return;

    // 화면 테이블과 동일 컬럼으로 CSV 생성
    const rows = alarms.map((a, idx) => ({
      번호: idx + 1 + page * PAGE_SIZE,
      설비구분: a.deviceType,
      설비번호: a.deviceId,
      설비이름: a.deviceName,
      알람내역: a.alarmMessage, // 백엔드가 별도 필드 없어서 동일 값으로 채움(추후 분리 가능)
      알람구분: a.alarmFlag,
      발생시각: formatregDate(a.regDate),
    }));

    downloadCsv(`알람_${from}_${to}.csv`, rows);
  };

  return (
    <MainLayout activeMenu="/alarm">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="알람" pageSubtitle="Alarm" />

        {/* ✅ 필터 영역 */}
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
              <div className="text-sm text-slate-700">설비구분</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[140px]"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
              >
                {deviceTypeOptions.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">설비번호</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[160px]"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              >
                <option value="ALL">전체</option>
                {deviceIds.map((id) => (
                  <option key={id} value={id}>
                    INV{id}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="dark"
                onClick={onClickView}
              >
                보기
              </Button>

              <Button
                variant="green"
                onClick={onClickExcel}
              >
                엑셀 저장
              </Button>
            </div>
          </div>
        </section>

        {/* ✅ 테이블 */}
        <section className="bg-white border rounded p-6">
          <div className="text-slate-900 font-semibold mb-4">알람 목록</div>

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3 w-[80px]">번호</th>
                  <th className="text-left font-medium px-4 py-3 w-[120px]">설비구분</th>
                  <th className="text-left font-medium px-4 py-3 w-[120px]">설비번호</th>
                  <th className="text-left font-medium px-4 py-3 w-[180px]">발생일시</th>
                  <th className="text-left font-medium px-4 py-3 w-[120px]">알람구분</th>
                  <th className="text-left font-medium px-4 py-3">알람내역</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      불러오는 중...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-rose-600">
                      {error}
                    </td>
                  </tr>
                ) : alarms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  alarms.map((a, idx) => (
                    <tr key={a.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                      <td className="px-4 py-3 text-slate-900">
                        {idx + 1 + page * PAGE_SIZE}
                      </td>
                      <td className="px-4 py-3 text-slate-900">{a.deviceType}</td>
                      <td className="px-4 py-3 text-slate-900">{a.deviceId}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatregDate(a.regDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-900">{a.alarmFlag}</td>
                      <td className="px-4 py-3 text-slate-700">{a.alarmMessage}</td>
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
              >
                이전
              </button>
              <button
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                onClick={goNext}
                disabled={page >= totalPages - 1 || loading}
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
