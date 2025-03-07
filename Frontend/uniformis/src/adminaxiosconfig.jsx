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
const adminAxiosInstance = axios.create(defaultConfig);
const productApi = axios.create({ ...defaultConfig, baseURL: `${BASE_URL}/api/products/admin` });
const cartApi = axios.create({ ...defaultConfig, baseURL: `${BASE_URL}/api/orders/cart` });
const orderApi = axios.create({ ...defaultConfig, baseURL: `${BASE_URL}/api/orders/admin/orders` });
const offersApi = axios.create({ ...defaultConfig, baseURL: `${BASE_URL}/api/offers` });


const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/token/refresh/`,
      {},
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add request interceptor to ensure cookies are sent
const addRequestInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      config.withCredentials = true;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Update response interceptor
const addResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return instance(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await refreshToken();
          processQueue(null);
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          if (!originalRequest.url.includes('check-user-auth-status') && 
          !originalRequest.url.includes('check-admin-auth-status')) {
        window.location.href = '/admin/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
}
);
};

// Apply interceptors to all instances
[adminAxiosInstance, productApi, cartApi, orderApi,offersApi].forEach(instance => {
  addRequestInterceptor(instance);
  addResponseInterceptor(instance);
});

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
            return adminAxiosInstance(originalRequest);  // Retry the original request
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

applyErrorInterceptor(adminAxiosInstance);
applyErrorInterceptor(productApi);
applyErrorInterceptor(cartApi);
applyErrorInterceptor(orderApi);
applyErrorInterceptor(offersApi);

// Helper functions for API calls
const apiHelpers = {
  get: async (url, config = {}) => {
    try {
      const response = await adminAxiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await adminAxiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await adminAxiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  delete: async (url, config = {}) => {
    try {
      const response = await adminAxiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
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
  }
};

export { authApi, productApi, cartApi, orderApi,offersApi ,apiHelpers };
export default adminAxiosInstance;

