// src/apis/plant/plant.api.ts
import axios from "axios";
import type { PlantUpdateRequest } from "./plant.request"; // ✅ 이 줄 꼭

export const fetchPlants = () => {
  return axios.get("/api/v1/plants").then((res) => res.data);
};

export const updatePlant = (
  accessToken: string,
  id: number,
  body: PlantUpdateRequest
) => {
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  // 혹시 accessToken이 "Bearer xxx" 형태면 정리
  const token = accessToken.startsWith("Bearer ")
    ? accessToken.substring(7).trim()
    : accessToken;

  return axios.put(
    `/api/v1/plants/${id}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ).then(res => res.data);
};


export const deletePlant = (accessToken: string, id: number) => {
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  const token = accessToken.startsWith("Bearer ")
    ? accessToken.substring(7).trim()
    : accessToken;

  return axios.delete(`/api/v1/plants/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data);
};


