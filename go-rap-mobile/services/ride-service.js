import api from "./interceptor-service";

const RIDE_BASE_URL = "http://192.168.29.72:8077/gorap/rides";
// const RIDE_BASE_URL = "http://192.168.0.12:8077/gorap/rides";

export const RideService = {
  createRide: (userId, rideDTO) => {
    console.log('crea ride service call - ', userId, rideDTO);
    return api.post(`${RIDE_BASE_URL}/create/${userId}`, rideDTO);
  },
};

export const getLocations = async () => {
  // simulate api call
  return [
    { id: "1", name: "Bangalore" },
    { id: "2", name: "Chennai" },
    { id: "3", name: "Hyderabad" },
    { id: "4", name: "Mumbai" },
  ];
};

export const getRides = async (searchDTO) => {
 return api.post(`${RIDE_BASE_URL}/search`, searchDTO);
};