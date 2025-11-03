import api from "./interceptor-service";

// const RIDE_BASE_URL = "http://192.168.29.72:8077/gorap/rides";
// const RIDE_BASE_URL = "http://192.168.0.12:8077/gorap/rides";
const RIDE_BASE_URL = "http://192.168.0.14:8077:8077/gorap/rides";
// const RIDE_BASE_URL = "https://ride-service-mo73.onrender.com/gorap/rides";

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

