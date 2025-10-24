import axios from "axios";

const OLA_BASE_URL = "https://api.olamaps.io/places/v1/autocomplete";
const OLA_ROUTE_URL = "https://api.olamaps.io/routing/v1/directions";
const OLA_API_KEY = "YOUR_OLA_MAPS_API_KEY";

export const olaService = {
  // 🔍 Search autocomplete
  search: async (query) => {
    if (!query || query.length < 2) return [];
    try {
      const response = await axios.get(OLA_BASE_URL, {
        params: {
          input: query,
          api_key: OLA_API_KEY,
        },
      });
      return response.data?.predictions || [];
    } catch (err) {
      return [];
    }
  },

  // 🗺️ Get route between two coordinates
  getRoute: async (origin, destination) => {
    try {
      const response = await axios.post(
        `${OLA_ROUTE_URL}?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&api_key=${OLA_API_KEY}`,
        {},
        {
          headers: {
            "X-Request-Id": "test-001",
            Accept: "application/json",
          },
        }
      );
      return response.data?.routes || [];
    } catch (err) {
      return [];
    }
  },
};
