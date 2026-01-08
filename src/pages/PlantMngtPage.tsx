// src/pages/PlantMngtPage.tsx
import React, { useEffect, useState } from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { PlantTable } from "../components/organisms/PlantTable";
import { fetchPlants, updatePlant, deletePlant } from "../apis/plant/plant.api";
import type { Plant } from "../types/interface/plant.interface";
import type { PlantUpdateRequest } from "../apis/plant/plant.request";
import { PlantDetailModal } from "../components/organisms/PlantDetailModal";
import { useCookies } from "react-cookie";



export const PlantMngtPage: React.FC = () => {
  const [cookies] = useCookies(["accessToken"]);

  const [plants, setPlants] = useState<Plant[]>([]);

  // 모달 관련 상태
  const [open, setOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  useEffect(() => {
    fetchPlants().then(setPlants);
  }, []);

  const handleOpenDetail = (plant: Plant) => {
    setSelectedPlant(plant);
    setOpen(true);
  };


const handleSave = async (updated: Plant) => {
  try {
    const accessToken = cookies.accessToken ?? "";
    console.log("SAVE accessToken =", accessToken);

    const body: PlantUpdateRequest = {
      name: updated.name,
      connectUrl: updated.connectUrl,
      capacityKw: String(updated.capacityKw),
      monthlyGen: Number(updated.monthlyGen),
      plantPrice: updated.plantPrice,
      address: updated.address,
      lat: String(updated.lat),
      lng: String(updated.lng),
      activeYn: updated.activeYn,
      meterYn: updated.meterYn,
      sensorYn: updated.sensorYn,
      accessIpYn: updated.accessIpYn,
    };

    await updatePlant(accessToken, updated.id, body);

    const list = await fetchPlants();
    setPlants(list);

  } catch (e: any) {
    alert(e?.message ?? "저장 실패");
    console.error(e);
  }
};


const handleDelete = async (id: number) => {
  try {
    const accessToken = cookies.accessToken ?? "";

    await deletePlant(accessToken, id);

    alert("삭제되었습니다.");

    // 목록 재조회
    const list = await fetchPlants();
    setPlants(list);

    // 모달 닫기 + 선택 해제
    setSelectedPlant(null);
    setOpen(false);

  } catch (e: any) {
    alert(e?.message ?? "삭제 실패");
    console.error(e);
  }
};




  const handleClose = () => {
    setOpen(false);
    setSelectedPlant(null);
  };

  return (
    <MainLayout activeMenu="/plant-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="발전소 관리" pageSubtitle="Plant Management" />

        <div className="bg-white border rounded p-4">
          <PlantTable plants={plants} onClickDetail={handleOpenDetail} />
        </div>

        <PlantDetailModal open={open} plant={selectedPlant} onClose={handleClose} onSave={handleSave} onDelete={handleDelete} />
      </div>
    </MainLayout>
  );
};
