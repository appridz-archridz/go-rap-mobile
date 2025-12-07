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
  },
  cancelRide: async (rideId) => {
    try {
      const response = await api.patch(`${RIDE_BASE_URL}/cancel/${rideId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRideById: async (rideId) => {
    try {
      const response = await api.get(`${RIDE_BASE_URL}/get/${rideId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  updateRide: async (rideId, requestRideDTO) => {
    try {
      const response = await api.put(`${RIDE_BASE_URL}/update/${rideId}`, requestRideDTO);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};