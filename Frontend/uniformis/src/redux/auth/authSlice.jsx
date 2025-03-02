
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosconfig";  
import adminAxiosInstance from "../../adminaxiosconfig";

//async thunk for checking user auth staus
// export const checkUserAuthStatus=createAsyncThunk(
//   "auth/checkUserAuthStatus",
//   async (_, {rejectWithValue})=>{
//     try{
//       const response=await axiosInstance.get("/check-user-auth-status/");
//       return{
//         user:response.data.user,
//         userType:"user"
//       };
//     }catch(error){
//       return rejectWithValue(error.response?.data|| "Authentication check failed")
//     }
//   }
// )

export const checkUserAuthStatus = createAsyncThunk(
  "auth/checkUserAuthStatus",
  async (_, {rejectWithValue}) => {
    try{
      const response = await axiosInstance.get("/check-user-auth-status/");
      
      // Check if the user is authenticated based on the response
      if (response.data.authenticated === false) {
        // User is not authenticated, but this isn't an error
        return rejectWithValue({message: "Not authenticated"});
      }
      
      return {
        user: response.data.user,
        userType: "user"
      };
    } catch(error) {
      if (error.response?.status !== 401) {
        return rejectWithValue(error.response?.data || "Authentication check failed");
      }
      return rejectWithValue({message: "Not authenticated"});
    }
  }
)

//Async thunk for checking the amdin auth status

export const checkAdminAuthStatus=createAsyncThunk(
  "auth/checkAdminAuthStatus",
  async(_,{rejectWithValue})=>{
    try{
      const response=await adminAxiosInstance.get("/check-admin-auth-status/")
      if (response.data.authenticated === false) {
        // This is not an error condition, just not authenticated
        return rejectWithValue({message: "Not authenticated"});
      }
      return{
        user:response.data.user,
        userType:"admin"
      };
    }catch(error){
      if (error.response?.status !== 401) {
        return rejectWithValue(error.response?.data || "Authentication check failed");
      }
       return rejectWithValue(error.response?.data|| "Authentication check failed")
    }
  }
)


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
    if (response.data.authenticated === false) {
      return rejectWithValue({message: "Not authenticated"});
    }
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})


const initialState = {
  user: null,
  isAuthenticated: false,
  userType:null,
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

    setAdminAuth(state, action) {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.userType = "admin";
      state.isLoading = false;
    },

    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
       state.userType = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(checkUserAuthStatus.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(checkUserAuthStatus.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.userType = "user";
      state.isLoading = false;
    })
    .addCase(checkUserAuthStatus.rejected, (state) => {
      // We don't clear auth here because we might still check admin auth
      state.isLoading = false;
    })
    
    // Admin auth status
    .addCase(checkAdminAuthStatus.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(checkAdminAuthStatus.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.userType = "admin";
      state.isLoading = false;
    })
    .addCase(checkAdminAuthStatus.rejected, (state) => {
      // If both user and admin checks fail, clear auth
      if (!state.isAuthenticated) {
        state.user = null;
        state.isAuthenticated = false;
        state.userType = null;
      }
      state.isLoading = false;
    })
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
        state.userType=null
        state.isLoading = false;
       
      })
      .addCase(clearAuthData.rejected, (state, action) => {
        console.error("Logout failed:", action.payload);
      });
  },
});

export const { setAuthData,setAdminAuth,clearAuth } = authSlice.actions;
export default authSlice.reducer;
