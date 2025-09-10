import axios from "axios";

const AUTH_BASE_URL = 'http://192.168.29.72:8077/gorap/api/auth';

export const signUp = (payLoad) => {
  return axios.post(`${AUTH_BASE_URL}/signup`, payLoad);
};

export const login = (payLoad) => {
  return axios.post(`${AUTH_BASE_URL}/signin`, payLoad);
};