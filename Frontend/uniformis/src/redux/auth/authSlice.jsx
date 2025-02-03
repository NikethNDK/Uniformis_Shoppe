import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const initialState = {
  user: storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null,
  token: localStorage.getItem("token") || null,
  refresh_token: localStorage.getItem("refresh_token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData(state, action) {
      const { user, token, refresh_token } = action.payload;
      console.log("User in authSlice",user)
      // Update state
      state.user = user;
      state.token = token;
      state.refresh_token = refresh_token;
      state.isAuthenticated = true;
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("refresh_token", refresh_token);
    },
    clearAuthData(state) {
      // Clear state
      state.user = null;
      state.token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
    },
  },
});

export const { setAuthData, clearAuthData } = authSlice.actions;
export default authSlice.reducer;