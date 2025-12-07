// services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { HelperService } from "./helper-service";
import { updateToken } from "../redux/authSlice";
import { updateRefreshToken } from "../components/services/authService";

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
    console.log("error",error)
    if (error.response?.status === 401) {
      if (HelperService.getRefreshToken()) {
        const response = await updateRefreshToken(HelperService.getRefreshToken());

        const { accessToken, refreshToken } = response.data.data;
        HelperService.setToken(accessToken);
        updateToken(accessToken, refreshToken);
   
      } else {
        router.replace("/login");
      }
    } else {
      console.log("Error", error);
    }
    return Promise.reject(error);
  }
);

export default api;
