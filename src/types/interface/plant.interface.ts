// src/types/plant.interface.ts
export interface Plant {
  id: number;
  name: string;
  connectUrl: string;
  capacityKw: string;
  monthlyGen: number;
  plantPrice: string;
  address: string;
  lat: string;
  lng: string;
  invCount: number;
  activeYn: "Y" | "N";
  meterYn: "Y" | "N";
  sensorYn: "Y" | "N";
  accessIpYn: "Y" | "N";
  createdAt: string;
}
