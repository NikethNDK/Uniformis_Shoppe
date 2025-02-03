
//updated 21-01-25
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../../adminaxiosconfig';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, search = "" })  => {
    const response = await productApi.get('/items/', {
      params: { page, search },
    });
    console.log(response.data)
    return response.data;
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id) => {
    const response = await productApi.get(`/items/${id}/`);
    
    return response.data;
  }
);

// export const updateProductStatus = createAsyncThunk(
//   'products/updateStatus',
//   async ({ id, is_deleted }) => {
//     const response = await productApi.patch(`/items/${id}/`, { is_deleted });
//     return response.data;
//   }
// );

export const updateProductStatus = createAsyncThunk("products/updateStatus", async ({ id, is_active }) => {
  const response = await productApi.patch(`/items/${id}/toggle_active/`, { is_active })
  return response.data
})

export const updateProduct = createAsyncThunk("products/updateProduct", async ({ id, data }, { rejectWithValue }) => {
  try {
    console.log("Update request payload:", data)
    const response = await productApi.patch(`/updateproduct/${id}/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error updating product:", error)
    return rejectWithValue(error.response.data)
  }
})

// export const updateProduct = createAsyncThunk(
//     'products/updateProduct',
//     async ({ id, data }) => {
//         console.log('Update request payload:', data); 
//       // Use PATCH instead of PUT for partial updates
//       const response = await productApi.patch(`/items/${id}/`, data);
//       return response.data;
//     }
//   );

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id) => {
    await productApi.delete(`/items/${id}/`);
    return id;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    status: 'idle',
    error: null,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.results
        state.totalPages = Math.ceil(action.payload.count / 6)
        state.currentPage = action.payload.current_page
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentProduct = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(product => product.id !== action.payload);
      });
  },
});

export default productSlice.reducer;

