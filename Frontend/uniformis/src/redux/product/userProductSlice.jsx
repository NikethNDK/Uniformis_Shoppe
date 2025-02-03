
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiHelpers } from "../../axiosconfig"

const initialState = {
  products: [],
  categories: [],
  similarProducts: [],
  loading: false,
  error: null,
  nextPage: null,
  count: 0,
  lastFetched: null,
}

export const fetchProducts = createAsyncThunk("userProducts/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      apiHelpers.get("/products/items/"),
      apiHelpers.get("/products/categories/"),
    ])

    console.log("Raw Products API response:", productsResponse)
    console.log("Raw Categories API response:", categoriesResponse)

    return {
      products: productsResponse.results || [],
      categories: categoriesResponse || [],
      nextPage: productsResponse.next,
      count: productsResponse.count,
    }
  } catch (error) {
    console.error("API Error:", error)
    return rejectWithValue(error.message || "An error occurred while fetching products")
  }
})


export const fetchSimilarProducts = createAsyncThunk(
  "products/fetchSimilarProducts",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiHelpers.get(`/products/items/${productId}/similar_products/`);
      
      console.log("Similar Products API response:", response); // Debugging log

      // Prepending the base URL to the image path
      const BASE_URL = 'http://localhost:8000'; // Use the same BASE_URL as in your axiosConfig

      const updatedResponse = response.map((product) => ({
        ...product,
        images: product.images.map((image) => ({
          ...image,
          image: `${BASE_URL}${image.image}`, // Prepend base URL to the image URL
        })),
      }));

      return updatedResponse || [];
    } catch (error) {
      console.error("API Error:", error); // Log the error for debugging
      return rejectWithValue(error.message || "An error occurred while fetching similar products");
    }
  }
);

export const fetchMoreProducts = createAsyncThunk(
  "userProducts/fetchMoreProducts",
  async (url, { rejectWithValue }) => {
    try {
      const response = await apiHelpers.get(url)
      console.log("More products API response:", response)
      return {
        products: response.results || [],
        nextPage: response.next,
      }
    } catch (error) {
      console.error("API Error:", error)
      return rejectWithValue(error.message || "An error occurred while fetching more products")
    }
  },
)

const userProductsSlice = createSlice({
  name: "userProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.categories = action.payload.categories
        state.nextPage = action.payload.nextPage
        state.count = action.payload.count
        state.lastFetched = Date.now()
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchMoreProducts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = [...state.products, ...action.payload.products]
        state.nextPage = action.payload.nextPage
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    builder.addCase(fetchSimilarProducts.pending, (state) => {
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
  },
})

export default userProductsSlice.reducer

