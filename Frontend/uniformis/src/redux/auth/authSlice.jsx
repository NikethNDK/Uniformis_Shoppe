
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

export const checkAuthStatus = createAsyncThunk("auth/checkAuthStatus", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/check-auth-status/")
    console.log("need to check the authstatus after refresh",response.data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})


const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading:true
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData(state, action) {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(checkAuthStatus.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(checkAuthStatus.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    })
    .addCase(checkAuthStatus.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    })
      .addCase(clearAuthData.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
       
      })
      .addCase(clearAuthData.rejected, (state, action) => {
        console.error("Logout failed:", action.payload);
      });
  },
});

export const { setAuthData } = authSlice.actions;
export default authSlice.reducer;
