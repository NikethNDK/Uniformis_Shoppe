import axios from 'axios';


const BASE_URL = 'http://localhost:8000';
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Default config for Axios instances
const defaultConfig = {
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    
  },
  timeout: 30000,
  withCredentials: true,  // Include cookies with requests
};


// Axios instances
const authApi = axios.create(defaultConfig);
const axiosInstance = axios.create(defaultConfig);
const productApi = axios.create({ ...defaultConfig, baseURL: `${BASE_URL}/api/products` });
const cartApi = axios.create({ ...defaultConfig, baseURL: `${BASE_URL}/api/orders/cart` });
const orderApi = axios.create({ ...defaultConfig, baseURL: `${BASE_URL}/api/orders/orders` });
const wishlistApi = axios.create({ ...defaultConfig,baseURL: `${BASE_URL}/api/orders/wishlist`});
const walletApi = axios.create({ ...defaultConfig,baseURL: `${BASE_URL}/api/orders/wallet`});

const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/token/refresh/`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axiosInstance.post('/token/refresh/');
        isRefreshing = false;
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        // Clear any auth state here
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
// Common error handler
const handleApiError = async (error) => {
  const originalRequest = error.config;

  if (error.response) {
    switch (error.response.status) {
      case 401:
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          const tokenRefreshed = await refreshToken();
          if (tokenRefreshed) {
            return axiosInstance(originalRequest);  // Retry the original request
          }
        }
        window.location.href = '/login';
        break;
      case 403:
        console.error('Access denied');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 500:
        console.error('Server error');
        break;
      default:
        console.error('API error');
    }
  } else {
    console.error('Network error or request setup issue');
  }
  return Promise.reject(error);
};

// Apply interceptors to handle errors and token refresh
const applyErrorInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => handleApiError(error)
  );
};

applyErrorInterceptor(axiosInstance);
applyErrorInterceptor(productApi);
applyErrorInterceptor(cartApi);
applyErrorInterceptor(orderApi);
applyErrorInterceptor(wishlistApi);
applyErrorInterceptor(walletApi);

// Helper functions for API calls
const apiHelpers = {
  get: async (url, config = {}) => {
    try {
      const response = await axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  delete: async (url, config = {}) => {
    try {
      const response = await axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  cart: {
    addItem: async (data) => {
      try {
        const response = await cartApi.post('/add_item/', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    removeItem: async (data) => {
      try {
        const response = await cartApi.post('/remove_item/', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    updateQuantity: async (data) => {
      try {
        const response = await cartApi.post('/update_quantity/', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    getCart: async () => {
      try {
        const response = await cartApi.get('/');
        console.log("get cart",response.data)
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },
  
  orders: {
    createFromCart: async (data) => {
      try {
        const response = await orderApi.post('/create_from_cart/', data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    getOrders: async () => {
      try {
        const response = await orderApi.get('/');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    getOrder: async (orderId) => {
      try {
        const response = await orderApi.get(`/${orderId}/`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  wishlist: {
    addItem: async (data) => {
      try {
        const response = await wishlistApi.post('/add_item/', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    removeItem: async (data) => {
      try {
        const response = await wishlistApi.post('/remove_item/', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    updateQuantity: async (data) => {
      try {
        const response = await wishlistApi.post('/update_quantity/', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    getWishlist: async () => {
      try {
        const response = await wishlistApi.get('/');
        console.log("get wishlist",response.data)
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },

};

export { authApi, productApi,wishlistApi, cartApi, orderApi, apiHelpers,walletApi };
export default axiosInstance;

