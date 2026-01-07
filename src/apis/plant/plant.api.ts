// src/apis/plant/plant.api.ts
import axios from "axios";

export const fetchPlants = () => {
  return axios.get("/api/plants").then(res => res.data);
};
