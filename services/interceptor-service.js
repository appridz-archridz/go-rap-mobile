// services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { updateRefreshToken } from "../components/services/authService";
import { logout, updateToken } from "../redux/authSlice";
import { store } from "../redux/store";
import { HelperService } from "./helper-service";

const api = axios.create();

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 🔹 REQUEST INTERCEPTOR
api.interceptors.request.use(async (config) => {
  const token =
    HelperService.getToken() ||
    (await AsyncStorage.getItem("token"));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;

        console.log('got refreshtoken', refreshToken);
        

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await updateRefreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        HelperService.setToken(accessToken);
        HelperService.setRefreshToken(newRefreshToken);

        store.dispatch(updateToken({
          accessToken: accessToken,
          refreshToken: newRefreshToken
        }));

        processQueue(null, accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;

        return api(originalRequest);

      } catch (err) {
        console.log('got errrrr', err);
        
        processQueue(err, null);

        store.dispatch(logout());
        router.replace("/login");

        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
