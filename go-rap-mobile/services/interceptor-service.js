// services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { HelperService } from "./helper-service";

const api = axios.create();

api.interceptors.request.use(async (config) => {
  const token = HelperService.getToken();
  const tokenAsync = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (tokenAsync) {
    config.headers.Authorization = `Bearer ${tokenAsync}`;
  }
  return config;
});

api.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      router.replace({
        pathname: "/login",
        params: {
          logout: true,
        },
      });
    }
    return Promise.reject(error);
  }
);

export default api;
