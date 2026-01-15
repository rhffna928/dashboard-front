// src/pages/DeviceMngtPage.tsx
import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import { fetchPlants, type PlantSummary } from "../apis/plant/plant.api";
import {
  getInverterListRequest,
  createInverterListRequest,
  putUpdateInverterRequest,
  deleteInverterRequest,
} from "../apis";

import { InverterCreateModal } from "../components/organisms/InverterCreateModal";
import { InverterDetailModal, type InverterSummary } from "../components/organisms/InverterDetailModal";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const PAGE_SIZE = 10;

export const DeviceMngtPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken;

  const [plants, setPlants] = React.useState<PlantSummary[]>([]);
  const [inverters, setInverters] = React.useState<InverterSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 모달
  const [createOpen, setCreateOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<InverterSummary | null>(null);

  // 검색/페이징
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const refreshAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const plantRows = await fetchPlants();
      setPlants(plantRows ?? []);

      const invRes = await getInverterListRequest(token);
      if (invRes && (invRes as any).code === "SU") {
        setInverters(((invRes as any).inverters ?? []) as InverterSummary[]);
      } else {
        setError((invRes as any)?.message ?? "인버터 목록 조회 실패");
        setInverters([]);
      }
    } catch (e: any) {
      setError(e?.message ?? "조회 중 오류");
      setInverters([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  React.useEffect(() => {
    setPage(1);
  }, [query]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inverters;

    return inverters.filter((x) => {
      const unit = String(x.unitId ?? "");
      const invId = (x.invId ?? "").toLowerCase();
      const name = (x.invName ?? "").toLowerCase();
      const type = (x.invType ?? "").toLowerCase();
      return unit.includes(q) || invId.includes(q) || name.includes(q) || type.includes(q);
    });
  }, [inverters, query]);

  const totalPages = React.useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length]);

  const current = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <MainLayout activeMenu="/device-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="설비 관리" pageSubtitle="Device Management" />

        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="text-slate-900 font-semibold">인버터 목록</div>

            <div className="flex items-center gap-2">
              <input
                className="border rounded px-3 py-2 text-sm w-[300px]"
                placeholder="unit_id / device_id / 명칭 / 타입 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <Button
                onClick={refreshAll}
                className="px-3 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm"
              >
                새로고침
              </Button>

              <Button
                primary
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                신규 등록
              </Button>
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">순번</th>
                  <th className="text-left font-medium px-4 py-3">unit_id</th>
                  <th className="text-left font-medium px-4 py-3">device_id</th>
                  <th className="text-left font-medium px-4 py-3">명칭</th>
                  <th className="text-left font-medium px-4 py-3">타입</th>
                  <th className="text-left font-medium px-4 py-3">프로토콜</th>
                  <th className="text-right font-medium px-4 py-3">용량(kW)</th>
                  <th className="text-center font-medium px-4 py-3">활성화</th>
                  <th className="text-center font-medium px-4 py-3">상세</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                      불러오는 중...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-rose-600">
                      {error}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  current.map((x, idx) => (
                    <tr key={x.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                      <td className="px-4 py-3 text-slate-900">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3 text-slate-900">{x.unitId}</td>
                      <td className="px-4 py-3 text-slate-900">{x.invId}</td>
                      <td className="px-4 py-3 text-slate-900">{x.invName}</td>
                      <td className="px-4 py-3 text-slate-700">{x.invType}</td>
                      <td className="px-4 py-3 text-slate-700">{x.invProtocol}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{x.invCapacity}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium",
                            x.useYn === "Y" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                          )}
                        >
                          {x.useYn}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelected(x)}
                          className="px-3 py-1.5 rounded bg-slate-700 text-white hover:bg-slate-800"
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              총 {filtered.length}건 · {page}/{totalPages} 페이지
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded border text-sm disabled:opacity-50" onClick={goPrev} disabled={page <= 1}>
                이전
              </button>
              <button className="px-3 py-1.5 rounded border text-sm disabled:opacity-50" onClick={goNext} disabled={page >= totalPages}>
                다음
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 생성 모달 */}
      <InverterCreateModal
        open={createOpen}
        plants={plants}
        accessToken={token}
        onClose={() => setCreateOpen(false)}
        onCreated={refreshAll}
        onCreate={createInverterListRequest}
      />

      {/* 상세/수정/삭제 모달 */}
      <InverterDetailModal
        open={!!selected}
        inverter={selected}
        plants={plants}
        accessToken={token}
        onClose={() => setSelected(null)}
        onSaved={refreshAll}
        onDeleted={refreshAll}
        onUpdate={putUpdateInverterRequest}
        onDelete={deleteInverterRequest}
      />
    </MainLayout>
  );
};
