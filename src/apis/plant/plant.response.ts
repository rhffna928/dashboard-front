// src/api/plant/plant.response.ts
export interface Plant {
  id: number;
  name: string;
  connectUrl: string;
  capacityKw: number;
  monthlyGen: number;
  address: string;
  lat: number;
  lng: number;
  activeYn: "Y" | "N";
  meterYn: "Y" | "N";
  sensorYn: "Y" | "N";
  accessIpYn: "Y" | "N";
  createdAt: string;
}
