// services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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

export default api;
