import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";
import { HelperService } from "./../services/helper-service";

const initialState = {
  isAuthenticated: false,
  token: null,
  userId: null,
  userName: null,
  email: null,
  phone: null,
  profilePic: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.profilePic = action.payload.profilePic;
      AsyncStorage.setItem("token", action.payload.token);
      state.refreshToken = action.payload.refreshToken;
      HelperService.setToken(action.payload.token);
      HelperService.setRefreshToken(action.payload.refreshToken);

    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.userId = null;
      state.userName = null;
      state.email = null;
      state.phone = null;
      state.profilePic = null;
      state.refreshToken = null;
      AsyncStorage.removeItem("token");
      HelperService.removeToken();
      HelperService.removeRefreshToken();
      console.log(
        "--- Message from authSlice - The login token and user details REMOVED succesfully!!!"
      );
    },
    update: (state, action) => {
      state.userName = action.payload.userName;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.profilePic = action.payload.profilePic;
    },
    updateToken: (state, action) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      
      HelperService.setToken(action.payload.accessToken);
      HelperService.setRefreshToken(action.payload.refreshToken);
      console.log('updated token', state.token, state.refreshToken);
      
    },
  },
});

export const { login, logout, update } = authSlice.actions;
export default authSlice.reducer;
