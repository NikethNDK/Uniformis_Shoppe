
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosconfig";  

// Async thunk for logout
export const clearAuthData = createAsyncThunk(
  "auth/clearAuthData",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/logout/"); // Logout endpoint on the backend clears cookies
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      return rejectWithValue(error.response?.data || "Logout failed");
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData(state, action) {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearAuthData.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(clearAuthData.rejected, (state, action) => {
        console.error("Logout failed:", action.payload);
      });
  },
});

export const { setAuthData } = authSlice.actions;
export default authSlice.reducer;
