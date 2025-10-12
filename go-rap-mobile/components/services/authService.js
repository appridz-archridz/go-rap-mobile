import api from "../../services/interceptor-service";

const AUTH_BASE_URL = "http://192.168.0.115:8077/gorap/api/auth";

export const signUp = (payLoad) => {
  return api.post(`${AUTH_BASE_URL}/signup`, payLoad);
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
