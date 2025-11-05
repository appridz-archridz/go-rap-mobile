import api from "./interceptor-service";
import CONFIG from "../config.json";
import { CONFIG } from '.. /config.json';

const RIDE_BASE_URL = CONFIG.BACKEND_RENDER + '/rides'

export const RideService = {
  createRide: (userId, rideDTO) => {
    console.log('crea ride service call - ', userId, rideDTO);
    return api.post(`${RIDE_BASE_URL}/create/${userId}`, rideDTO);
  },
};


export const getRides = async (searchDTO) => {
 return api.post(`${RIDE_BASE_URL}/search`, searchDTO);
};

export const getRideById = async (rideId) => {
 return api.get(`${RIDE_BASE_URL}/get/${rideId}`);
};

