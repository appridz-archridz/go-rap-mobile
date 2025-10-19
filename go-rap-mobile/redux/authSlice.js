import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  token: null,
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
      state.userName = action.payload.userName;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
    },
    logout: (state) => {
      console.log('logout from authslice');
      state.isAuthenticated = false;
      state.token = null;
      state.userName = null;
      state.email = null;
      state.phone = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
