import React, { useMemo, useState } from "react";
import type { Inverter } from "../../types/interface/inverter.interface";
import { InverterChart } from "./InverterChart";

type Props = {
  rows: Inverter[];

  // ✅ 열림 기준: row PK(id)
  selectedRowId: number | null;

  // ✅ 그래프 제목 표시용(선택 인버터)
  selectedInvId: number | null;

  chartData: Inverter[];

  // ✅ row 클릭 시 rowId+invId 전달
  onSelectRow: (rowId: number, invId: number) => void;

  onCloseChart: () => void;
};

export const InverterTable: React.FC<Props> = ({
  rows,
  selectedRowId,
  selectedInvId,
  chartData,
  onSelectRow,
  onCloseChart,
}) => {
  // ✅ 페이징: 10개씩
  const pageSize = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  if (page > totalPages) setPage(totalPages);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  const from = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, rows.length);

  return (
    <div className="bg-white border rounded overflow-x-auto">
      {/* 상단 페이징 */}
      <div className="flex items-center justify-between px-3 py-2 text-sm">
        <div className="text-slate-600">
          {from}-{to} / {rows.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="border px-2 py-1 rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            이전
          </button>

          <div className="min-w-[70px] text-center">
            {page} / {totalPages}
          </div>

          <button
            className="border px-2 py-1 rounded disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            다음
          </button>
        </div>
      </div>

      <table className="w-full text-sm text-center border-collapse">
        <thead className="bg-slate-100">
          <tr>
            <th className="border p-2">번호</th>
            <th className="border p-2">상태</th>
            <th className="border p-2">입력전압</th>
            <th className="border p-2">입력전류</th>
            <th className="border p-2">출력(kW)</th>
            <th className="border p-2">금일발전량(kWh)</th>
            <th className="border p-2">누적발전량(MWh)</th>
            <th className="border p-2">마지막 수신</th>
            <th className="border p-2">상세</th>
          </tr>
        </thead>

        <tbody>
          {pagedRows.map((r) => {
            // ✅ 여기 핵심: invId가 아니라 row PK(id)로 열림 판정
            const isOpen = selectedRowId === r.id;

            return (
              <React.Fragment key={r.id}>
                <tr
                  className={[
                    "hover:bg-slate-50 cursor-pointer",
                    isOpen ? "bg-blue-50" : "",
                  ].join(" ")}
                  onClick={() => onSelectRow(r.id, r.invId)}
                >
                  <td className="border p-2">INV{r.invId}</td>
                  <td className="border p-2 text-green-600">{r.invStatus}</td>
                  <td className="border p-2">{r.inVolt}</td>
                  <td className="border p-2">{r.inCurrent}</td>
                  <td className="border p-2">{r.outPower}</td>
                  <td className="border p-2">{r.todayGen}</td>
                  <td className="border p-2">{r.totalGen}</td>
                  <td className="border p-2">{r.recvTime}</td>
                  <td className="border p-2">
                    <button
                      className="border px-2 py-1 rounded"
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
                    <td className="border p-2 bg-slate-50" colSpan={9}>
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
          })}
        </tbody>
      </table>
    </div>
  );
};
