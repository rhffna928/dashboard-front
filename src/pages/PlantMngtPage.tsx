// src/pages/PlantMngtPage.tsx
import React, { useEffect, useState } from "react";
import { MainLayout } from "../templates/MainLayout";
import { PageHeaderMetrics } from "../components/organisms/PageHeader";
import { PlantTable } from "../components/organisms/PlantTable";
import { fetchPlants } from "../apis/plant/plant.api";

export const PlantMngtPage: React.FC = () => {
  const [plants, setPlants] = useState<any[]>([]);

  useEffect(() => {
    fetchPlants().then(setPlants);
  }, []);

  return (
    <MainLayout activeMenu="/plant-management">
      <div className="space-y-6">
        <PageHeaderMetrics pageTitle="발전소 관리" pageSubtitle="Plant Management" />

        <div className="bg-white border rounded p-4">
          <PlantTable plants={plants} />
        </div>
      </div>
    </MainLayout>
  );
};
