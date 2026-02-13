// src/pages/PlantMngtPage.tsx
import React from "react";
import { useCookies } from "react-cookie";

import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { Button } from "../components/atoms/Button";

import { PlantTable } from "../components/organisms/PlantTable";
import { PlantDetailModal } from "../components/organisms/PlantDetailModal";
import { PlantCreateModal } from "../components/organisms/PlantCreateModal";

import type { PlantList2Row } from "../types/interface/plantList2.interface";
import type ResponseDto from "../apis/response/Response.dto";

import {
  getPlantListRequest,
  createPlantListRequest,
  putUpdatePlantRequest,
  deletePlantRequest,
  getAdminUsersRequest,
} from "../apis";

import type User from "types/interface/user.interface";

const toPlantArray = (res: any): PlantList2Row[] => {
  if (Array.isArray(res)) return res as PlantList2Row[];
  if (res && typeof res === "object" && Array.isArray(res.plantList2)) return res.plantList2 as PlantList2Row[];
  return [];
};

const isResponseDto = (v: any): v is ResponseDto =>
  v && typeof v === "object" && "code" in v && "message" in v;

export const PlantMngtPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);
  const token: string = cookies.accessToken ?? "";

  const [plants, setPlants] = React.useState<PlantList2Row[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 모달
  const [createOpen, setCreateOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedPlant, setSelectedPlant] = React.useState<PlantList2Row | null>(null);

  const refreshAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ 병렬 로딩
      const [plantRes, userRes] = await Promise.all([
        getPlantListRequest(token),
        getAdminUsersRequest(token),
      ]);

      // --- plants ---
      if (plantRes === null) {
        setPlants([]);
        setError("발전소 목록 통신 실패");
      } else {
        const rows = toPlantArray(plantRes);
        if (rows.length === 0 && isResponseDto(plantRes) && !(plantRes as any).plantList2 && !Array.isArray(plantRes)) {
          setError(plantRes.message ?? "발전소 목록 조회 실패");
        }
        setPlants(rows);
      }

      // --- users ---
      if (userRes && userRes.code === "SU") {
        setUsers(userRes.users ?? []);
      } else {
        if (isResponseDto(userRes) && !Array.isArray(userRes)) {
          // 실패 ResponseDto일 수 있음
          setUsers([]);
        } else {
          setUsers(userRes.users);
        }
      }
    } catch (e: any) {
      setPlants([]);
      setUsers([]);
      setError(e?.message ?? "조회 중 오류");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    if (!token) return;
    refreshAll();
  }, [token, refreshAll]);

  const openDetail = (p: PlantList2Row) => {
    setSelectedPlant(p);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedPlant(null);
  };

  return (
    <MainLayout activeMenu="/plant-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="발전소 관리" pageSubtitle="Plant Management" />

        <section className="bg-white border rounded p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="text-slate-900 font-semibold">발전소 목록</div>

            <div className="flex items-center gap-2">
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
            {loading ? (
              <div className="py-10 text-center text-slate-400">불러오는 중...</div>
            ) : error ? (
              <div className="py-10 text-center text-rose-600">{error}</div>
            ) : plants.length === 0 ? (
              <div className="py-10 text-center text-slate-400">데이터가 없습니다.</div>
            ) : (
              <PlantTable plants={plants as any} onClickDetail={openDetail as any} />
            )}
          </div>
        </section>
      </div>

      {/* ✅ 생성 모달 (users 전달) */}
      <PlantCreateModal
        open={createOpen}
        accessToken={token}
        users={users}
        onClose={() => setCreateOpen(false)}
        onCreated={refreshAll}
        onCreate={createPlantListRequest}
      />

      {/* ✅ 상세/수정/삭제 모달 (users 전달 + onUpdate/onDelete로 직접 호출) */}
      <PlantDetailModal
        open={detailOpen}
        plant={selectedPlant}
        users={users}
        accessToken={token}
        onClose={closeDetail}
        onSaved={refreshAll}
        onDeleted={refreshAll}
        onUpdate={putUpdatePlantRequest}
        onDelete={deletePlantRequest}
      />
    </MainLayout>
  );
};