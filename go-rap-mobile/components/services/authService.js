import api from "../../services/interceptor-service";

const AUTH_BASE_URL = "http://192.168.29.72:8077/gorap/api/auth";

export const signUp = (payLoad) => {
  const response =   api.post(`${AUTH_BASE_URL}/signup`, payLoad);
  return response
};

const login = (payLoad) => {
  return api.post(`${AUTH_BASE_URL}/signin`, payLoad);
};

const getProfileInfo = () => {
  return api.get(`${AUTH_BASE_URL}/profile`);
}

export const AuthService = {
  login,
  signUp,
  getProfileInfo,
};
