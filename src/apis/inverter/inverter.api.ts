import axios from "axios";
import type { Inverter } from "../../types/interface/inverter.interface";

const authHeader = (accessToken: string) => {
  const token = accessToken.startsWith("Bearer ")
    ? accessToken.substring(7).trim()
    : accessToken;
  return { Authorization: `Bearer ${token}` };
};

export const fetchInvertersByPlant = (accessToken: string, plantId: number) => {
  if (!accessToken) throw new Error("로그인이 필요합니다.");
  return axios
    .get<Inverter[]>(`/api/v1/inverters/plant/${plantId}`, {
      headers: authHeader(accessToken),
    })
    .then((res) => res.data);
};

export const fetchTodaySeries = (accessToken: string, plantId: number, invId: number) => {
  if (!accessToken) throw new Error("로그인이 필요합니다.");
  return axios
    .get<Inverter[]>(`/api/v1/inverters/plant/${plantId}/inv/${invId}/today`, {
      headers: authHeader(accessToken),
    })
    .then((res) => res.data);
};

export const fetchRecentSeries = (accessToken: string, plantId: number, invId: number, limit = 200) => {
  if (!accessToken) throw new Error("로그인이 필요합니다.");
  return axios
    .get(`/api/v1/inverters/plant/${plantId}/inv/${invId}/recent?limit=${limit}`, {
      headers: authHeader(accessToken),
    })
    .then((res) => res.data);
};

