import axios from "axios";

// ===========================================================
// 🔑 Ola Maps API Configuration
// ===========================================================

const OLA_MAPS_API_KEY = "HRBo0B7JB5uVwarO5Whtor1a3dVGVWtjoX0yutE3";
const OLA_MAPS_PROJECT_ID = "77890f6e-aaa9-42ca-8a9d-be196c5c8b12";
const OLA_MAPS_AUTOCOMPLETE_BASE_URL = "https://api.olamaps.io/places/v1/autocomplete";
const OLA_MAPS_DIRECTIONS_BASE_URL = "https://api.olamaps.io/routing/v1/directions";

export const olaService = {
  // 🧭 Autocomplete (Place Search)
  search: async (query) => {
    if (!query || query.length < 2) return [];

    try {
      console.log("🔍 Ola autocomplete query:", query);

      const response = await axios.get(OLA_MAPS_AUTOCOMPLETE_BASE_URL, {
        headers: {
          Accept: "application/json",
          "X-Request-Id": "test-001",
        },
        params: {
          input: query,
          api_key: OLA_MAPS_API_KEY,
          project_id: OLA_MAPS_PROJECT_ID,
        },
      });

      console.log("✅ Ola autocomplete response:", response.data);
      return response.data?.predictions || [];
    } catch (err) {
      console.error("❌ Ola Maps Autocomplete error:", err?.response?.data || err.message);
      return [];
    }
  },

  // 🗺️ Directions API — Get route between two coordinates
  getRoute: async (origin, destination) => {
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      console.warn("⚠️ Invalid origin or destination coordinates");
      return [];
    }

    try {
      console.log("🗺️ Fetching Ola route:", origin, "➡️", destination);

      const url = `${OLA_MAPS_DIRECTIONS_BASE_URL}?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&api_key=${OLA_MAPS_API_KEY}`;

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Accept: "application/json",
            "X-Request-Id": "test-001",
          },
        }
      );

      console.log("✅ Ola route response:", response.data);
      return response.data?.routes || [];
    } catch (err) {
      console.error("❌ Ola Maps Directions error:", err?.response?.data || err.message);
      return [];
    }
  },
};

// ===========================================================
// 🌍 LocationIQ API Configuration
// ===========================================================

const LOCATIONIQ_API_KEY = "pk.47c7847a08310e3e81cd7e20d05921a2";
const LOCATIONIQ_AUTO_COMPLETE_BASE_URL = `https://api.locationiq.com/v1/autocomplete`;

export const locationService = {
  search: async (query) => {
    if (!query || query.length < 2) return [];

    try {
      console.log("🔍 LocationIQ query:", query);

      const response = await axios.get(LOCATIONIQ_AUTO_COMPLETE_BASE_URL, {
        params: {
          key: LOCATIONIQ_API_KEY,
          q: query,
          limit: 5,
          format: "json",
        },
      });

      console.log("✅ LocationIQ response:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ LocationIQ error:", err?.response?.data || err.message);
      return [];
    }
  },
};

// ===========================================================
// 🔑 Google Places API Configuration (Future Use)
// ===========================================================

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

export const googlePlacesService = {
  search: async (query) => {
    if (!query) return [];
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
        {
          params: { input: query, key: GOOGLE_API_KEY },
        }
      );
      return response.data.predictions;
    } catch (err) {
      console.error("❌ Google Places error:", err?.response?.data || err.message);
      return [];
    }
  },
};

// ===========================================================
// 🗺️ Mapbox API Configuration (Future Use)
// ===========================================================

const MAPBOX_API_KEY = process.env.EXPO_PUBLIC_MAPBOX_KEY;

export const mapboxService = {
  search: async (query) => {
    if (!query) return [];
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: MAPBOX_API_KEY,
            limit: 5,
          },
        }
      );
      return response.data.features;
    } catch (err) {
      console.error("❌ Mapbox error:", err?.response?.data || err.message);
      return [];
    }
  },
};
