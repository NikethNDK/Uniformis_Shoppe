import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiHelpers } from "../../axiosconfig"
import { toast } from "react-toastify"
 
const initialState = {
  items: [],
  loading: false,
  error: null,
  totalAmount: 0,
  itemCount: 0,
  finalTotal: 0
}

const BASE_URL =import.meta.env.VITE_BASE_URL; 

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHelpers.wishlist.getWishlist();
      
      // If empty response or no items, return empty state
      if (!response || !response[0] || !response[0].items) {
        return {
          items: [],
          total_price: 0,
          total_items: 0,
          final_total: 0
        };
      }
      
      console.log('resp in wishlist slice', response[0].items);

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
        total_items: formattedItems.length,
        final_total: response[0].final_total || 0,
      };
    } catch (error) {
      if (error.type !== 'NOT_FOUND') {
        toast.error("Failed to fetch wishlist items");
      }
      return rejectWithValue({
        message: error.message || "Failed to fetch wishlist items",
        type: error.type || "ERROR"
      });
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishList", 
  async ({ variant_id, quantity }, { getState, rejectWithValue }) => {
    try {
      // Get current wishlist state to check existing items
      const currentWishlist = getState().wishlist;
      const existingItem = currentWishlist.items.find(
        item => item.variant.id === variant_id
      );
      
      // Calculate total quantity after addition
      const newTotalQuantity = (existingItem?.quantity || 0) + quantity;
      
      // Validate quantity
      if (newTotalQuantity > 5) {
        throw new Error("Maximum 5 items allowed per product");
      }

      if (existingItem) {
        toast.info("Item already in wishlist");
        return {
          items: currentWishlist.items,
          total_price: currentWishlist.totalAmount,
          total_items: currentWishlist.items.length,
          final_total: currentWishlist.finalTotal
        };
      }

      const response = await apiHelpers.wishlist.addItem({ variant_id, quantity });
      
      if (!response || !response.items) {
        throw new Error("Invalid response format");
      }

      console.log("After calling the wishlist additem", response.data);
      toast.success("Item added to wishlist successfully");
      
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
        items: formattedItems,
        total_items: formattedItems.length
      };
    } catch (error) {
      const errorMessage = error.message || "Failed to add item to wishlist";
      toast.error(errorMessage);
      return rejectWithValue({
        message: errorMessage,
        type: error.type || "ERROR"
      });
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist", 
  async ({ item_id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiHelpers.wishlist.removeItem({ item_id });
      console.log('response while removing the item from wishlist: ', response);
      
      // Check if response exists
      if (!response) {
        // Handle empty response by fetching the updated wishlist
        toast.success("Item removed from wishlist");
        return dispatch(fetchWishlist()).unwrap();
      }
      
      // If response is an empty array, return an empty wishlist state
      if (Array.isArray(response) && response.length === 0) {
        // toast.success("Item removed from wishlist");
        return {
          items: [],
          total_price: 0,
          total_items: 0,
          final_total: 0
        };
      }
      
      // If response has items
      if (Array.isArray(response) && response[0]?.items) {
        const formattedItems = response[0].items.map(item => ({
          ...item,
          product_image: item.product_image
            ? item.product_image.startsWith('http')
              ? item.product_image
              : `${BASE_URL}${item.product_image}`
            : `${BASE_URL}/default-image.png`,
          variant: {
            ...item.variant,
            price: parseFloat(item.variant.price)
          }
        }));

        toast.success("Item removed from wishlist");

        return {
          items: formattedItems,
          total_price: response[0].total_price || 0,
          total_items: formattedItems.length,
          final_total: response[0].final_total || 0
        };
      }
      
      // If response is an object with items property (non-array response)
      if (response.items) {
        const formattedItems = response.items.map(item => ({
          ...item,
          product_image: item.product_image
            ? item.product_image.startsWith('http')
              ? item.product_image
              : `${BASE_URL}${item.product_image}`
            : `${BASE_URL}/default-image.png`,
          variant: {
            ...item.variant,
            price: parseFloat(item.variant.price)
          }
        }));

        toast.success("Item removed from wishlist");

        return {
          items: formattedItems,
          total_price: response.total_price || 0,
          total_items: formattedItems.length,
          final_total: response.final_total || 0
        };
      }

      // If we can't determine the structure, refresh the wishlist
      toast.success("Item removed from wishlist");
      return dispatch(fetchWishlist()).unwrap();

    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      
      // On error, refresh the wishlist to ensure UI is in sync
      dispatch(fetchWishlist());
      
      return rejectWithValue({
        message: error.message || "Failed to remove item from wishlist",
        type: error.type || "ERROR"
      });
    }
  }
);

export const updateWishlistItemQuantity = createAsyncThunk(
  "wishlist/updateWishlistQuantity",
  async ({ item_id, quantity }, {getState, rejectWithValue }) => {
    try {
      const currentWishlist = getState().wishlist;
      const currentItem = currentWishlist.items.find(item => item.id === item_id);
      
      // Validate quantity against stock and maximum limit
      if (quantity > 5) {
        throw new Error("Maximum 5 items allowed per product");
      }
      
      if (currentItem?.variant?.stock_quantity < quantity) {
        throw new Error(`Only ${currentItem.variant.stock_quantity} items available in stock`);
      }
      
      const response = await apiHelpers.wishlist.updateQuantity({ item_id, quantity })
      
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
        toast.success("Wishlist updated successfully");
      }

      return {
        ...response,
        items: formattedItems
      };

    } catch (error) {
      let errorMessage = "Failed to update wishlist"
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

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue }) => {
    try {
      await apiHelpers.wishlist.clearWishlist()
      toast.success("Wishlist cleared successfully")
      return null
    } catch (error) {
      const errorMessage = "Failed to clear wishlist"
      toast.error(errorMessage)
      return rejectWithValue({
        message: errorMessage,
        type: error.type || "ERROR"
      })
    }
  }
)

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.total_price || 0
        state.finalTotal = action.payload.final_total || 0
        state.itemCount = action.payload.items?.length || 0
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.total_price || 0
        state.finalTotal = action.payload.final_total || 0
        state.itemCount = action.payload.items?.length || 0
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.total_price || 0
        state.itemCount = action.payload.items?.length || 0
        state.finalTotal = action.payload.final_total || 0
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Quantity
      .addCase(updateWishlistItemQuantity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateWishlistItemQuantity.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.total_price || 0
        state.finalTotal = action.payload.final_total || 0
        state.itemCount = action.payload.items?.length || 0
      })
      .addCase(updateWishlistItemQuantity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Clear Wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false
        state.items = []
        state.totalAmount = 0
        state.itemCount = 0
        state.finalTotal = 0
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = wishlistSlice.actions
export default wishlistSlice.reducer