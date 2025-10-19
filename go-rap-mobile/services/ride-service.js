import api from "./interceptor-service";

const RIDE_BASE_URL = "http://192.168.29.72:8077/gorap/api/ride";

export const RideService = {
  createRide: (userId, rideDTO) => {
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

export const getRides = async (from, to) => {
  // simulate api call
  return [
    {
      id: "101",
      driver: "Ravi Kumar",
      vehicle: "Car - Swift",
      seats: 3,
      date: "2025-08-25",
      time: "10:30",
      from: "Bangalore",
      to: "Chennai",
    },
    {
      id: "102",
      driver: "Anjali",
      vehicle: "Bike - Activa",
      seats: 1,
      date: "2025-08-25",
      time: "14:00",
      from: "Bangalore",
      to: "Chennai",
    },
  ];
};