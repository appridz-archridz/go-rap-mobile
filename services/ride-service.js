import CONFIG from "../config.json";
import api from "./interceptor-service";

const RIDE_BASE_URL = CONFIG.BACKEND_RENDER + '/rides'

export const RideService = {
  createRide: (userId, rideDTO) => {
    console.log('crea ride service call - ', userId, rideDTO);
    return api.post(`${RIDE_BASE_URL}/create/${userId}`, rideDTO);
  },

  updateRide: (rideId, rideDTO) => {
    return api.put(`${RIDE_BASE_URL}/update/${rideId}`, rideDTO);
  },

};

export const getRides = async (searchDTO) => {
 return api.post(`${RIDE_BASE_URL}/search`, searchDTO);
};

export const getRideById = async (rideId) => {
 return api.get(`${RIDE_BASE_URL}/get/${rideId}`);
};

export const getRidesByUser = async (rideId) => {
 return api.get(`${RIDE_BASE_URL}/get/by-user/${rideId}`);
};

