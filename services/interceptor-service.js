// services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CONFIG from "../config.json";
import { logout, updateToken } from "../redux/authSlice";
import { store } from "../redux/store";
import { HelperService } from "./helper-service";

const api = axios.create();
const AUTH_BASE_URL = `${CONFIG.BACKEND_RENDER}/api/auth`;

let isRefreshing = false;
let failedQueue = [];
let hasLoggedOutFromInterceptor = false;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(async (config) => {
  const token = HelperService.getToken() || (await AsyncStorage.getItem("token"));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${AUTH_BASE_URL}/refresh-token`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        HelperService.setToken(accessToken);
        HelperService.setRefreshToken(newRefreshToken);

        store.dispatch(
          updateToken({
            accessToken,
            refreshToken: newRefreshToken,
          })
        );

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        const isAuthenticated = store.getState().auth?.isAuthenticated;
        if (!hasLoggedOutFromInterceptor && isAuthenticated) {
          hasLoggedOutFromInterceptor = true;
          store.dispatch(logout());
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

store.subscribe(() => {
  if (store.getState().auth?.isAuthenticated) {
    hasLoggedOutFromInterceptor = false;
  }
});

export default api;
