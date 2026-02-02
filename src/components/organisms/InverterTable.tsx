import React, { useEffect, useMemo, useState } from "react";
import type { Inverter } from "../../types/interface/inverter.interface";
import { InverterChart } from "./InverterChart";
import { Button } from "../atoms/Button"; // 경로는 네 구조에 맞게 조정

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ✅ AlarmPage와 동일 CSV 다운로드 유틸
function downloadCsv(filename: string, rows: Array<Record<string, any>>) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0] ?? {});
  const escape = (v: any) => {
    const s = String(v ?? "");
    const escaped = s.replaceAll('"', '""');
    return `"${escaped}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  const csv = "\uFEFF" + lines.join("\n"); // ✅ BOM(엑셀 한글 깨짐 방지)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

type Props = {
  rows: Inverter[];
  selectedRowId: number | null;
  selectedInvId: number | null;
  chartData: Inverter[];
  onSelectRow: (rowId: number, invId: number) => void;
  onCloseChart: () => void;
  onClickView?: () => void; // (선택) 나중에 서버조회용
};

export const InverterTable: React.FC<Props> = ({
  rows,
  selectedRowId,
  selectedInvId,
  chartData,
  onSelectRow,
  onCloseChart,
  onClickView,
}) => {
  // ✅ 필터 껍데기
  const deviceTypeOptions = useMemo(
    () => [
      { value: "ALL", label: "전체" },
      { value: "INV", label: "인버터" },
    ],
    []
  );

  const [deviceType, setDeviceType] = useState<string>("INV");
  const [deviceId, setDeviceId] = useState<string>("ALL");

  const deviceIds = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(String(r.invId)));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [rows]);

  // ✅ (임시) 필터 적용
  const filteredRows = useMemo(() => {
    if (deviceType !== "ALL" && deviceType !== "INV") return [];
    if (deviceId === "ALL") return rows;
    return rows.filter((r) => String(r.invId) === deviceId);
  }, [rows, deviceType, deviceId]);

  // ✅ 페이징(클라)
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1); // 1-based

  useEffect(() => {
    setPage(1);
  }, [deviceType, deviceId]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  if (page > totalPages) setPage(totalPages);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleView = () => {
    onClickView?.();
  };

  // ✅ 엑셀 저장(AlarmPage 스타일: CSV 생성 후 다운로드)
  const onClickExcel = () => {
    // filteredRows(필터 적용 전체) 기준으로 저장
    if (!filteredRows || filteredRows.length === 0) return;

    // AlarmPage처럼 “화면 테이블 컬럼과 동일”하게 만들어줌
    const exportRows = filteredRows.map((r, idx) => ({
      번호: idx + 1,              // ✅ 전체 기준 번호(필터 적용 후)
      인버터: `INV${r.invId}`,
      상태: r.invStatus,
      입력전압: r.inVolt,
      입력전류: r.inCurrent,
      출력_kW: r.outPower,
      금일발전량_kWh: r.todayGen,
      누적발전량_MWh: r.totalGen,
      마지막수신: r.recvTime,
    }));

    // 파일명도 AlarmPage처럼 필터값 반영
    const typeLabel = deviceType === "ALL" ? "전체" : deviceType;
    const idLabel = deviceId === "ALL" ? "전체" : `INV${deviceId}`;
    downloadCsv(`인버터_${typeLabel}_${idLabel}.csv`, exportRows);
  };

  return (
    <div className="space-y-6">
      {/* ✅ 필터 영역 (AlarmPage 스타일) */}
      <section className="bg-white border rounded p-4">
        <div className="flex items-center gap-4 flex-wrap">
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
            <Button variant="dark" onClick={handleView}>
              보기
            </Button>

            {/* ✅ 엑셀 저장 버튼 추가 (AlarmPage와 동일 variant="green") */}
            <Button variant="green" onClick={onClickExcel}>
              엑셀 저장
            </Button>
          </div>
        </div>
      </section>

      {/* ✅ 테이블 영역 */}
      <section className="bg-white border rounded p-6">
        <div className="text-slate-900 font-semibold mb-4">인버터 목록</div>

        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-medium px-4 py-3 w-[120px]">번호</th>
                <th className="text-left font-medium px-4 py-3 w-[120px]">상태</th>
                <th className="text-left font-medium px-4 py-3 w-[120px]">입력전압</th>
                <th className="text-left font-medium px-4 py-3 w-[120px]">입력전류</th>
                <th className="text-left font-medium px-4 py-3 w-[120px]">출력(kW)</th>
                <th className="text-left font-medium px-4 py-3 w-[160px]">금일발전량(kWh)</th>
                <th className="text-left font-medium px-4 py-3 w-[160px]">누적발전량(MWh)</th>
                <th className="text-left font-medium px-4 py-3 w-[180px]">마지막 수신</th>
                <th className="text-left font-medium px-4 py-3 w-[120px]">상세</th>
              </tr>
            </thead>

            <tbody>
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    조회 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                pagedRows.map((r, idx) => {
                  const isOpen = selectedRowId === r.id;
                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        className={cn(
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                          "hover:bg-slate-50 cursor-pointer",
                          isOpen && "bg-blue-50"
                        )}
                        onClick={() => onSelectRow(r.id, r.invId)}
                      >
                        <td className="px-4 py-3 text-slate-900">INV{r.invId}</td>
                        <td className="px-4 py-3 text-slate-900">{r.invStatus}</td>
                        <td className="px-4 py-3 text-slate-900">{r.inVolt}</td>
                        <td className="px-4 py-3 text-slate-900">{r.inCurrent}</td>
                        <td className="px-4 py-3 text-slate-900">{r.outPower}</td>
                        <td className="px-4 py-3 text-slate-900">{r.todayGen}</td>
                        <td className="px-4 py-3 text-slate-900">{r.totalGen}</td>
                        <td className="px-4 py-3 text-slate-700">{r.recvTime}</td>
                        <td className="px-4 py-3">
                          <button
                            className="px-3 py-1.5 rounded border text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRow(r.id, r.invId);
                            }}
                          >
                            상세정보
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td className="px-4 py-3 bg-slate-50" colSpan={9}>
                            <InverterChart
                              data={chartData}
                              title={selectedInvId ? `INV${selectedInvId}` : `INV${r.invId}`}
                              onClose={onCloseChart}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ 페이징 */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            총 {filteredRows.length}건 · {page}/{Math.max(1, totalPages)} 페이지
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
              onClick={goPrev}
              disabled={page <= 1}
            >
              이전
            </button>
            <button
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
              onClick={goNext}
              disabled={page >= totalPages}
            >
              다음
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
