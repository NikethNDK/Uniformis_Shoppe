import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiHelpers } from "../../axiosconfig"
import { clearCart } from "../cart/cartSlice"

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async ({ address_id, payment_method }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiHelpers.orders.createFromCart({
        address_id,
        payment_method,
      })

      // Clear the cart after successful order creation
      dispatch(clearCart())
      return response
    } catch (error) {
      let errorMessage = "Failed to place order"
      if (error.type === "NOT_FOUND") {
        errorMessage = "Address not found"
      } else if (error.details?.error === "Cart is empty") {
        errorMessage = "Your cart is empty"
      }
      return rejectWithValue({
        message: errorMessage,
        type: error.type || "ERROR",
        details: error.details,
      })
    }
  },
)

export const fetchOrders = createAsyncThunk("order/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await apiHelpers.orders.getOrders()
    return response
  } catch (error) {
    return rejectWithValue({
      message: error.message || "Failed to fetch orders",
      type: error.type || "ERROR",
      details: error.details,
    })
  }
})

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    clearOrderError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
        state.orders.unshift(action.payload)
        state.error = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
        state.error = null
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearCurrentOrder, clearOrderError } = orderSlice.actions
export default orderSlice.reducer

