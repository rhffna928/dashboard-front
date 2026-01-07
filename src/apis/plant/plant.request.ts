// src/api/plant/plant.request.ts
export interface PlantSearchRequest {
  keyword?: string;
  activeYn?: "Y" | "N";
}
