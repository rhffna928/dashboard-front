// src/pages/AlarmPage.tsx
import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type { InverterList2Row } from "../types/interface/inverterList.interface";

import { getUserPlantList2Request, getUserInverterList2Request } from "../apis/index";
import { getAlramListRequest } from "../apis";

// ===== types =====
type AlarmRow = {
  id: number;
  plantId: number;
  deviceType: string; // "INV"
  deviceId: string;   // 서버가 내려주는 값 (예: "01")
  deviceName: string;
  alarmMessage: string;
  alarmFlag: string;  // "발생" | "해제" 등
  alertFlag: string;
  regDate: string; // ISO
};

const PAGE_SIZE = 15;

// YYYY-MM-DD
function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatRegDate(v: string) {
  if (!v) return "-";
  return v.replace("T", " ");
}

// ✅ 안전 배열: 객체면 빈 배열로 (이상한 shape가 섞여도 옵션이 망가지지 않게)
function safeArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  return [];
}

// ✅ INV 표시용: 이미 2자리 이상이면 그대로, 1자리면 0패딩
function prettyInvId(id: any) {
  const s = String(id ?? "");
  if (!s) return "-";
  if (s.length >= 2) return s;
  return s.padStart(2, "0");
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

  if (res?.alarms && Array.isArray(res.alarms)) {
    return {
      items: res.alarms as AlarmRow[],
      totalElements: Number(res.totalElements ?? res.alarms.length ?? 0),
      totalPages: Number(res.totalPages ?? 1),
      pageNumber: fallbackPage,
      size: fallbackSize,
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

export const AlarmPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  // ===== filters =====
  const today = React.useMemo(() => new Date(), []);
  const [from, setFrom] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInputValue(d);
  });
  const [to, setTo] = React.useState(() => toDateInputValue(today));

  // 발전소
  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [plantId, setPlantId] = React.useState<"ALL" | number>("ALL");

  // 설비구분(타입)
  const deviceTypeOptions = React.useMemo(
    () => [
      { value: "ALL", label: "전체" },
      { value: "INV", label: "인버터" },
    ],
    []
  );
  const [deviceType, setDeviceType] = React.useState<string>("INV");

  // ✅ 인버터 선택값은 string으로 유지 ("01" 같은 값 보존)
  const [invList2, setInvList2] = React.useState<InverterList2Row[]>([]);
  const [invId, setInvId] = React.useState<"ALL" | string>("ALL");

  // ===== list / status =====
  const [alarms, setAlarms] = React.useState<AlarmRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ===== paging =====
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  // plantId -> plantName lookup
  const plantNameById = React.useMemo(() => {
    const m = new Map<number, string>();
    plants.forEach((p: any) => {
      if (p?.plantId != null) m.set(Number(p.plantId), String(p?.plantName ?? ""));
    });
    return m;
  }, [plants]);

  // ✅ 발전소 선택에 따른 인버터 리스트 (plantId가 ALL이면 전체)
  const invRowsForPlantRaw = React.useMemo(() => {
    if (plantId === "ALL") return invList2;
    return invList2.filter((x: any) => Number(x.plantId) === Number(plantId));
  }, [invList2, plantId]);

  // ✅ 핵심: 옵션 중복 제거
  // - plantId=ALL일 때는 같은 invId가 plant마다 있을 수 있으니
  //   화면에는 "INV02"가 여러 번 보일 수 있음.
  //   여기서는 "INV02"만 보여주고 싶다면 invId 기준으로 유니크 처리.
  // - plantId가 특정 값이면 plantId+invId 기준으로 유니크 처리.
  const invRowsForPlant = React.useMemo(() => {
    const list = invRowsForPlantRaw;

    const seen = new Set<string>();
    const out: InverterList2Row[] = [];

    for (const inv of list as any[]) {
      const pid = Number(inv?.plantId ?? 0);
      const iid = String(inv?.invId ?? "");
      if (!iid) continue;

      const key =
        plantId === "ALL"
          ? `inv:${iid}`               // ✅ 전체에서는 invId만 유니크
          : `plant:${pid}-inv:${iid}`; // ✅ 특정 plant에서는 plantId+invId 유니크

      if (seen.has(key)) continue;
      seen.add(key);
      out.push(inv as InverterList2Row);
    }
    return out;
  }, [invRowsForPlantRaw, plantId]);

  // ===== 목록 1회 로드 =====
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

  // ===== 알람 조회 =====
  const fetchAlarms = React.useCallback(
    async (nextPage: number) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      // ✅ 서버로 보낼 deviceId
      // - 서버가 "01"을 기대하면 그대로(invId는 string으로 유지)
      // - 서버가 "1"을 기대하면 여기에서 변환
      const invIdParam = invId === "ALL" ? "ALL" : String(invId);

      const params = {
        plantId: plantId === "ALL" ? undefined : plantId,
        from,
        to,
        deviceType: deviceType ?? "ALL",
        deviceId: deviceType === "INV" ? invIdParam : "ALL",
        page: nextPage,
        size: PAGE_SIZE,
      };

      try {
        const res = await getAlramListRequest(token, params);

        if (res && (res as any).code === "SU") {
          const norm = normalizeAlarmList(res, nextPage, PAGE_SIZE);
          setAlarms(norm.items);
          setTotalElements(norm.totalElements);
          setTotalPages(norm.totalPages);
          setPage(norm.pageNumber);
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
    [token, plantId, from, to, deviceType, invId]
  );

  // token 들어오면 목록 로드
  React.useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // 발전소 바뀌면 invId 리셋 + page 리셋
  React.useEffect(() => {
    setInvId("ALL");
    setPage(0);
  }, [plantId]);

  // 자동조회: 필터 변경 시 0페이지 조회
  React.useEffect(() => {
    setPage(0);
    fetchAlarms(0);
  }, [plantId, deviceType, invId, from, to, fetchAlarms]);

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

    const rows = alarms.map((a, idx) => ({
      번호: idx + 1 + page * PAGE_SIZE,
      발전소: plantNameById.get(Number(a.plantId)) ?? `PLANT-${a.plantId}`,
      설비구분: a.deviceType,
      설비번호: a.deviceId,
      설비이름: a.deviceName,
      알람내역: a.alarmMessage,
      알람구분: a.alarmFlag,
      발생시각: formatRegDate(a.regDate),
    }));

    downloadCsv(`알람_${from}_${to}.csv`, rows);
  };

  return (
    <MainLayout activeMenu="/alarm">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="알람" pageSubtitle="Alarm" />

        {/* 필터 */}
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

            {/* 발전소구분 */}
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

            {/* 설비구분 */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">설비구분</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[140px]"
                value={deviceType}
                onChange={(e) => {
                  setDeviceType(e.target.value);
                  setInvId("ALL"); // 설비구분 바뀌면 설비번호 리셋
                }}
              >
                {deviceTypeOptions.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 설비번호 (invId) */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700">설비번호</div>
              <select
                className="border rounded px-3 py-2 text-sm w-[180px]"
                value={invId === "ALL" ? "ALL" : String(invId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setInvId(v === "ALL" ? "ALL" : v); // ✅ 문자열 유지
                }}
                disabled={deviceType !== "INV"}
              >
                <option value="ALL">전체</option>

                {invRowsForPlant.map((inv: any) => (
                  <option
                    key={
                      plantId === "ALL"
                        ? `inv:${String(inv.invId)}`
                        : `plant:${String(inv.plantId)}-inv:${String(inv.invId)}`
                    }
                    value={String(inv.invId)}
                  >
                    INV{prettyInvId(inv.invId)}
                    {inv.invName ? ` - ${inv.invName}` : ""}
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
        </section>

        {/* 테이블 */}
        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-900 font-semibold">알람 목록</div>
            <div className="text-sm text-slate-500">
              총 {totalElements}건 · {page + 1}/{Math.max(1, totalPages)} 페이지
            </div>
          </div>

          {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3 w-[80px]">번호</th>
                  <th className="text-left font-medium px-4 py-3 w-[160px]">발전소</th>
                  <th className="text-left font-medium px-4 py-3 w-[100px]">설비구분</th>
                  <th className="text-left font-medium px-4 py-3 w-[120px]">설비번호</th>
                  <th className="text-left font-medium px-4 py-3 w-[200px]">발생일시</th>
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
                ) : alarms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  alarms.map((a, idx) => (
                    <tr key={a.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="px-4 py-3 text-slate-900">{idx + 1 + page * PAGE_SIZE}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {plantNameById.get(Number(a.plantId)) ?? `PLANT-${a.plantId}`}
                      </td>
                      <td className="px-4 py-3 text-slate-900">{a.deviceType}</td>
                      <td className="px-4 py-3 text-slate-900">
                        {a.deviceType === "INV"
                          ? `INV${prettyInvId(a.deviceId)}`
                          : a.deviceId}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatRegDate(a.regDate)}</td>
                      <td className="px-4 py-3 text-slate-900">{a.alarmFlag}</td>
                      <td className="px-4 py-3 text-slate-700">{a.alarmMessage}</td>
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