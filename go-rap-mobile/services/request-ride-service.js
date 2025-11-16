import api from "./interceptor-service";
import CONFIG from "../config.json";

const RIDE_BASE_URL = CONFIG.BACKEND_RENDER + '/request/rides';

export const requestRideService = {
  saveRequestRide: async (userId, requestRideDTO) => {
    try {
      const response = await api.post(`${RIDE_BASE_URL}/create/${userId}`, requestRideDTO);
      return response;
    } catch (error) {
      throw error;
    }
  },
   getRequestRide: async (payload) => {
    try {
      const response = await api.post(`${RIDE_BASE_URL}/search`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   getUsersRides:async (payload) => {
    try {
      const response = await api.post(`${RIDE_BASE_URL}/my-rides`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};