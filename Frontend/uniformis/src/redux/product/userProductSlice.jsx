import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiHelpers } from "../../axiosconfig";

const initialState = {
  products: [],
  categories: [],
  similarProducts: [],
  loading: false,
  error: null,
  nextPage: null,
  count: 0,
  lastFetched: null,
};

export const fetchProducts = createAsyncThunk(
  "userProducts/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        apiHelpers.get("/products/items/"),
        apiHelpers.get("/products/categories/"),
      ]);

      console.log("Raw Products API response:", productsResponse);
      console.log("Raw Categories API response:", categoriesResponse);

      // Check if the responses are valid
      if (!productsResponse || !categoriesResponse) {
        throw new Error("Invalid response from server");
      }

      return {
        products: productsResponse.results || [],
        categories: categoriesResponse || [],
        nextPage: productsResponse.next,
        count: productsResponse.count,
      };
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(
        error.message || "An error occurred while fetching products"
      );
    }
  }
);

export const fetchSimilarProducts = createAsyncThunk(
  "products/fetchSimilarProducts",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiHelpers.get(
        `/products/items/${productId}/similar_products/`
      );

      console.log("Similar Products API response:", response);

      // Prepending the base URL to the image path
      const BASE_URL = import.meta.env.VITE_BASE_URL;

      const updatedResponse = response.map((product) => ({
        ...product,
        images: product.images.map((image) => ({
          ...image,
          image: `${BASE_URL}${image.image}`,
        })),
      }));

      return updatedResponse || [];
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(
        error.message || "An error occurred while fetching similar products"
      );
    }
  }
);

export const fetchMoreProducts = createAsyncThunk(
  "userProducts/fetchMoreProducts",
  async (url, { rejectWithValue }) => {
    try {
      const response = await apiHelpers.get(url);
      console.log("More products API response:", response);
      return {
        products: response.results || [],
        nextPage: response.next,
      };
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(
        error.message || "An error occurred while fetching more products"
      );
    }
  }
);

export const fetchNewProducts = createAsyncThunk(
  "userProducts/fetchNewProducts",
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await apiHelpers.get(`/products/items/?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

const userProductsSlice = createSlice({
  name: "userProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.categories = action.payload.categories;
        state.nextPage = action.payload.nextPage;
        state.count = action.payload.count;
        state.lastFetched = Date.now();
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMoreProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = [...state.products, ...action.payload.products];
        state.nextPage = action.payload.nextPage;
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.similarProducts = action.payload;
        state.loading = false;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchNewProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewProducts.fulfilled, (state, action) => {
        if (state.currentPage === 1) {
          state.products = action.payload?.results || [];
        } else {
          state.products = [
            ...state.products,
            ...(action.payload?.results || []),
          ];
        }
        state.loading = false;
        state.totalCount = action.payload?.count || 0;
        state.nextPage = action.payload?.next || null;
        state.previousPage = action.payload?.previous || null;
        state.error = null;
        state.currentPage += 1;
      })
      .addCase(fetchNewProducts.rejected, (state, action) => {
        state.loading = false;
        state.products = [];
        state.error = action.error.message;
      });
  },
});

export default userProductsSlice.reducer;
