// src/api/plant/plant.request.ts
export interface PlantSearchRequest {
  keyword?: string;
  activeYn?: "Y" | "N";
}

export interface PlantUpdateRequest {
  name: string;
  connectUrl: string;
  capacityKw: string;
  monthlyGen: number;
  plantPrice: string;
  address: string;
  lat: string;
  lng: string;

  activeYn: "Y" | "N";
  meterYn: "Y" | "N";
  sensorYn: "Y" | "N";
  accessIpYn: "Y" | "N";
}