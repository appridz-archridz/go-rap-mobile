import api from "../../services/interceptor-service";

// const AUTH_BASE_URL = "http://192.168.0.7:8077/gorap/api/auth";
const AUTH_BASE_URL = "https://ride-service-mo73.onrender.com/gorap/api/auth";

export const signUp = (payLoad) => {
  const response = api.post(`${AUTH_BASE_URL}/signup`, payLoad);
  return response
};

const login = (payLoad) => {
  return api.post(`${AUTH_BASE_URL}/signin`, payLoad);
};

const getProfileInfo = () => {
  return api.get(`${AUTH_BASE_URL}/profile`);
}

const updateProfile = (payload) => {
  return api.put(`${AUTH_BASE_URL}/update-profile`, payload);
}

export const forgotPassword = (email) => {
  return api.post(`${AUTH_BASE_URL}/forgot-password?email=${email}`);
};

export const verifyOtp = (email, otp) => {
  return api.post(`${AUTH_BASE_URL}/verify-otp?email=${email}&otp=${otp}`);
};

export const updatePassword = (email, password) => {
  return api.patch(`${AUTH_BASE_URL}/update-password?email=${email}&password=${password}`);
};

export const AuthService = {
  login,
  signUp,
  getProfileInfo,
  updateProfile,
};
