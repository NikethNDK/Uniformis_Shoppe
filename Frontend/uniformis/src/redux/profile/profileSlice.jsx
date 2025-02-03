import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosconfig';


export const fetchUserProfile = createAsyncThunk(
    'profile/fetchProfile', //silceName/actionname
    async (_, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get('user-profile/');
        console.log(response.data)
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch profile');
      }
    }
  );
  
  export const updateUserProfile = createAsyncThunk(
    'profile/updateProfile',
    async ({ username, profilePicture }, { rejectWithValue }) => {
      try {
        const formData = new FormData();
        formData.append('username', username);
        if (profilePicture) {
          formData.append('profile_picture', profilePicture);
        }
  
        const response = await axiosInstance.put('user-profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to update profile');
      }
    }
  );
  
  const profileSlice = createSlice({
    name: 'profile',
    initialState: {
      data: null,
      isLoading: false,
      error: null,
    },
    reducers: {
      clearProfile: (state) => {
        state.data = null;
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        // Fetch profile cases
        .addCase(fetchUserProfile.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchUserProfile.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        })
        .addCase(fetchUserProfile.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })
        // Update profile cases
        .addCase(updateUserProfile.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(updateUserProfile.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        })
        .addCase(updateUserProfile.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        });
    },
  });
  
  export const { clearProfile } = profileSlice.actions;
  export default profileSlice.reducer;