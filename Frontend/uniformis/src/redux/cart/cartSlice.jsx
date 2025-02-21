import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiHelpers } from "../../axiosconfig"
import { toast } from "react-toastify"
 
const initialState = {
  items: [],
  loading: false,
  error: null,
  totalAmount: 0,
  itemCount: 0,
  finalTotal:0
}

const BASE_URL ='http://localhost:8000'; 

export const fetchCart = createAsyncThunk(
  "cart/fetchCart", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHelpers.cart.getCart();
      console.log('resp in slice', response[0].items);

      // formatting the data
      
      const formattedItems = response[0].items.map(item => ({
        ...item,
        // Prepend base URL to product image
        product_image: item.product_image.startsWith('http') 
          ? item.product_image 
          : `${BASE_URL}${item.product_image}`,
        product_id: item.product_id,
       
        variant: {
          ...item.variant,
          price: parseFloat(item.variant.price) 
        }
      }));
      
      return {
        items: formattedItems,
        total_price: response[0].total_price || 0,
        total_items: response[0].total_items || 0,
        final_total: response[0].final_total || 0,
      };
    } catch (error) {
      if (error.type !== 'NOT_FOUND') {
        toast.error("Failed to fetch cart items");
      }
      return rejectWithValue({
        message: error.message || "Failed to fetch cart items",
        type: error.type || "ERROR"
      });
    }
  }
);

// export const addToCart = createAsyncThunk(
//   "cart/addToCart", 
//   async ({ variant_id, quantity }, { rejectWithValue }) => {
//     try {
//       const response = await apiHelpers.cart.addItem({ variant_id, quantity })
//       toast.success("Item added to cart successfully")
//       return response
//     } catch (error) {
//       let errorMessage = "Failed to add item to cart"
//       if (error.type === "NOT_FOUND") {
//         errorMessage = "Product variant not found"
//       } else if (error.details?.error === "Not enough stock available") {
//         errorMessage = "Not enough stock available"
//       }
//       toast.error(errorMessage)
//       return rejectWithValue({
//         message: errorMessage,
//         type: error.type || "ERROR"
//       })
//     }
//   }
// )

export const addToCart = createAsyncThunk(
  "cart/addToCart", 
  async ({ variant_id, quantity }, { getState, rejectWithValue }) => {
    try {
      // Get current cart state to check existing items
      const currentCart = getState().cart;
      const existingItem = currentCart.items.find(
        item => item.variant.id === variant_id
      );
      
      // Calculate total quantity after addition
      const newTotalQuantity = (existingItem?.quantity || 0) + quantity;
      
      // Validate quantity
      if (newTotalQuantity > 5) {
        throw new Error("Maximum 5 items allowed per product");
      }

      const response = await apiHelpers.cart.addItem({ variant_id, quantity });
      toast.success("Item added to cart successfully");
      
      // Format the response data
      const formattedItems = response.items.map(item => ({
        ...item,
        product_image: item.product_image?.startsWith('http') 
          ? item.product_image 
          : `${BASE_URL}${item.product_image}`,
        variant: {
          ...item.variant,
          price: parseFloat(item.variant.price),
          
        }
      }));

      return {
        ...response,
        items: formattedItems
      };
    } catch (error) {
      const errorMessage = error.message || "Failed to add item to cart";
      toast.error(errorMessage);
      return rejectWithValue({
        message: errorMessage,
        type: error.type || "ERROR"
      });
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart", 
  async ({ item_id }, { rejectWithValue }) => {
    try {
      const response = await apiHelpers.cart.removeItem({ item_id });

      // Format items to ensure image URLs are complete and prices are parsed
      const formattedItems = response.items.map(item => ({
        ...item,
        product_image: item.product_image
          ? item.product_image.startsWith('http')
            ? item.product_image
            : `${BASE_URL}${item.product_image}`
          : `${BASE_URL}/default-image.png`,  // Fallback image if not available
        variant: {
          ...item.variant,
          price: parseFloat(item.variant.price)
        }
      }));

      toast.success("Item removed from cart");

      return {
        ...response,
        items: formattedItems,
        final_total: response[0].final_total || 0 
      };

    } catch (error) {
      const errorMessage = "Failed to remove item from cart";
      // toast.error(errorMessage);
      return rejectWithValue({
        message: errorMessage,
        type: error.type || "ERROR"
      });
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ item_id, quantity }, {getState, rejectWithValue }) => {
    try {

      const currentCart = getState().cart;
      const currentItem = currentCart.items.find(item => item.id === item_id);
      
      // Validate quantity against stock and maximum limit
      if (quantity > 5) {
        throw new Error("Maximum 5 items allowed per product");
      }
      
      if (currentItem?.variant?.stock_quantity < quantity) {
        throw new Error(`Only ${currentItem.variant.stock_quantity} items available in stock`);
      }
      
      const response = await apiHelpers.cart.updateQuantity({ item_id, quantity })
      
      const formattedItems = response.items.map(item => ({
        ...item,
        product_image: item.product_image?.startsWith('http') 
          ? item.product_image 
          : `${BASE_URL}${item.product_image}`,
        variant: {
          ...item.variant,
          price: parseFloat(item.variant.price)
        }
      }));

      // Only show success toast for manual quantity updates, not auto-adjustments
      if (quantity <= 5 && quantity > 0) {
        toast.success("Cart updated successfully");
      }

      return {
        ...response,
        items: formattedItems
      };

    } catch (error) {
      let errorMessage = "Failed to update cart"
      if (error.details?.error === "Not enough stock available") {
        errorMessage = "Not enough stock available"
      }
      toast.error(errorMessage)
      return rejectWithValue({
        message: errorMessage,
        type: error.type || "ERROR"
      })
    }
  }
)

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await apiHelpers.cart.clearCart()
      toast.success("Cart cleared successfully")
      return null
    } catch (error) {
      const errorMessage = "Failed to clear cart"
      toast.error(errorMessage)
      return rejectWithValue({
        message: errorMessage,
        type: error.type || "ERROR"
      })
    }
  }
)

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // calculateTotals: (state) => {
    //   state.totalAmount = state.items.reduce(
    //     (total, item) => total + item.final_price * item.quantity,
    //     0
    //   )
    //   state.itemCount = state.items.reduce(
    //     (count, item) => count + item.quantity,
    //     0
    //   )
    // },
    // clearError: (state) => {
    //   state.error = null
    // }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.total_price || 0
        state.finalTotal=action.payload.final_total || 0
        state.itemCount = action.payload.total_items || 0
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.total_price || 0
        state.finalTotal=action.payload.final_total || 0
        state.itemCount = action.payload.total_items || 0
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.total_price || 0
        state.itemCount = action.payload.total_items || 0
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.total_price || 0
        state.itemCount = action.payload.total_items || 0
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false
        state.items = []
        state.totalAmount = 0
        state.itemCount = 0
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
  },
})

export const { calculateTotals, clearError } = cartSlice.actions
export default cartSlice.reducer