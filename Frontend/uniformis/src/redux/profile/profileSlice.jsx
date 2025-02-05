import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../axiosconfig"

export const fetchUserProfile = createAsyncThunk("profile/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("user-profile/")
    console.log("fetchUserprofile ",response.data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch profile")
  }
})

export const updateUserProfile = createAsyncThunk(
  "profile/updateProfile",
  async ({ profilePicture }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      if (profilePicture) {
        formData.append("profile_picture", profilePicture)
      }

      const response = await axiosInstance.put("user-profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update profile")
    }
  },
)
export const fetchUserProfileDetails = createAsyncThunk("profile/fetchUserProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("user_profile_details/", {params: profileData})
    console.log("response of the get",response.data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch profile")
  }
})




export const updateUserProfileDetails = createAsyncThunk("profile/updateUserProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put("user_profile_details/", profileData)
    
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to update profile")
  }
})

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.data = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updateUserProfileDetails.pending, (state,action)=>{
        state.isLoading = true
        state.error=null
      })
      .addCase(updateUserProfileDetails.fulfilled,(state,action)=>{
        state.isLoading = false
        state.data=action.payload
      })
      .addCase(updateUserProfileDetails.rejected, (state,action)=>{
        state.isLoading=false
        state.error=action.payload
      })
      .addCase(fetchUserProfileDetails.pending,(state,action)=>{
        state.isLoading=true
        state.error=null
      })
      .addCase(fetchUserProfileDetails.fulfilled,(state,action)=>{
        state.isLoading=false
        state.data=action.payload
      })
      .addCase(fetchUserProfileDetails.rejected,(state,action)=>{
        state.isLoading=false
        state.error=action.payload
      })
  },
})

export const { clearProfile } = profileSlice.actions
export default profileSlice.reducer

