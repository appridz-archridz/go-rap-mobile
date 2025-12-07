import CONFIG from "../config.json";
import api from "./interceptor-service";

const VEHICLE_BASE_URL = CONFIG.BACKEND_RENDER + "/vehicle";

export const getUserVehicles = async (userId) => {
  return api.get(`${VEHICLE_BASE_URL}/user/${userId}`);
};

export const createVehicle = async (userId, vehicleInfo) => {
    console.log("userId", userId)
  return api.post(`${VEHICLE_BASE_URL}/create/${userId}`, vehicleInfo);
};

export const getVehicleById = async (vehicleId) => {
  return api.get(`${VEHICLE_BASE_URL}/${vehicleId}`);
};

export const updateVehicle = async (vehicleId, vehicleInfo) => {
  return api.put(`${VEHICLE_BASE_URL}/update/${vehicleId}`, vehicleInfo);
};

export const deleteVehicle = async (vehicleId) => {
  return api.delete(`${VEHICLE_BASE_URL}/delete/${vehicleId}`);
};
