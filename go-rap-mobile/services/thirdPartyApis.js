import axios from "axios";

const LOCATIONIQ_API_KEY = "pk.47c7847a08310e3e81cd7e20d05921a2";
const LOCATIONIQ_AUTO_COMPLETE_BASE_URL = `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=`;

export const locationService = {
  search: async (query) => {
    if (!query || query.length < 2) return [];
    try {
      const URL = `${LOCATIONIQ_AUTO_COMPLETE_BASE_URL}/${query}`;
      console.log('auto complete url is ', URL);
      
      const response = await axios.get(URL, {
        params: {
          key: LOCATIONIQ_API_KEY,
          q: query,
          limit: 5,
          format: "json",
        },
      });
      return response.data;
    } catch (err) {
      console.error("LocationIQ error:", err?.response?.data || err.message);
      return [];
    }
  },
};

// 🔑 Google Places (future use)
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

export const googlePlacesService = {
  search: async (query) => {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
        {
          params: {
            input: query,
            key: GOOGLE_API_KEY,
          },
        }
      );
      return response.data.predictions;
    } catch (err) {
      console.error("Google Places error:", err?.response?.data || err.message);
      return [];
    }
  },
};

// 🔑 Mapbox (future use)
const MAPBOX_API_KEY = process.env.EXPO_PUBLIC_MAPBOX_KEY;

export const mapboxService = {
  search: async (query) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`,
        {
          params: {
            access_token: MAPBOX_API_KEY,
            limit: 5,
          },
        }
      );
      return response.data.features;
    } catch (err) {
      // console.error("Mapbox error:", err?.response?.data || err.message);
      return [];
    }
  },
};
