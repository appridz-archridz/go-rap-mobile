import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";
import { HelperService } from './../services/helper-service';

const initialState = {
  isAuthenticated: false,
  token: null,
  userId: null,
  userName: null,
  email: null,
  phone: null,
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
      AsyncStorage.setItem("token", action.payload.token);
      console.log('--- Message from authSlice - The login token and user details SET succesfully!!!');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.userId = null;
      state.userName = null;
      state.email = null;
      state.phone = null;
      AsyncStorage.removeItem("token");
      HelperService.removeToken();
      console.log('--- Message from authSlice - The login token and user details REMOVED succesfully!!!');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
