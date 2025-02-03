import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../../axiosconfig"

export const fetchProducts = createAsyncThunk("products/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("products/items/")
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch products")
  }
})

export const fetchBestSellers = createAsyncThunk("products/fetchBestSellers", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("products/items/best_sellers/")
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch best sellers")
  }
})

const userProductSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    bestSellers: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchBestSellers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.isLoading = false
        state.bestSellers = action.payload
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export default userProductSlice.reducer

