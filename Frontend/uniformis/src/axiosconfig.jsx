import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Utility functions for token management
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

const clearAuthTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
};

const setAuthTokens = (token, refreshToken) => {
  localStorage.setItem('token', token);
  localStorage.setItem('refresh_token', refreshToken);
};

// Default config
const defaultConfig = {
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
};

// Create an Axios instance for authentication
const authApi = axios.create(defaultConfig);

// Create an Axios instance for authenticated requests
const axiosInstance = axios.create(defaultConfig);

// Create a specific Axios instance for product-related API calls
const productApi = axios.create({
  ...defaultConfig,
  baseURL: `${BASE_URL}/api/products`,
});

// Common error handler
const handleApiError = (error) => {
  if (error.response) {
    // If it's a verification required response, pass it through
    if (error.response.status === 200 && error.response.data?.type === 'VERIFICATION_REQUIRED') {
      return Promise.reject(error.response.data);
    }
    // Server responded with error status
    switch (error.response.status) {
      case 401:
        return Promise.reject({
          type: 'AUTH_ERROR',
          message: 'Authentication failed',
          details: error.response.data
        });
      case 403:
        return Promise.reject({
          type: 'FORBIDDEN',
          message: 'Access denied',
          details: error.response.data
        });
      case 404:
        return Promise.reject({
          type: 'NOT_FOUND',
          message: 'Resource not found',
          details: error.response.data
        });
      case 500:
        return Promise.reject({
          type: 'SERVER_ERROR',
          message: 'Internal server error',
          details: error.response.data
        });
      default:
        return Promise.reject({
          type: 'API_ERROR',
          message: 'Request failed',
          details: error.response.data
        });
    }
  } else if (error.request) {
    // Request was made but no response received
    return Promise.reject({
      type: 'NETWORK_ERROR',
      message: 'Network error occurred',
      details: error.request
    });
  } else {
    // Something else happened while setting up the request
    return Promise.reject({
      type: 'REQUEST_ERROR',
      message: 'Error setting up request',
      details: error.message
    });
  }
};

// Interceptor for authenticated requests
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers['Authorization'] = getAuthHeader();
    return config;
  },
  (error) => Promise.reject(error)
);

// Apply same auth interceptor to product API
productApi.interceptors.request.use(
  (config) => {
    config.headers['Authorization'] = getAuthHeader();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
const createResponseInterceptor = (instance) => {
  return instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await authApi.post('/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('token', access);
          
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          return instance(originalRequest);
        } catch (refreshError) {
          clearAuthTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return handleApiError(error);
    }
  );
};

// Apply response interceptor to both instances
createResponseInterceptor(axiosInstance);
createResponseInterceptor(productApi);

// Helper functions for common API operations
const apiHelpers = {
  // Generic GET request with error handling
  get: async (url, config = {}) => {
    try {
      const response = await axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Generic POST request with error handling
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Generic PUT request with error handling
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Generic DELETE request with error handling
  delete: async (url, config = {}) => {
    try {
      const response = await axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export { authApi, productApi, apiHelpers, setAuthTokens, clearAuthTokens };
export default axiosInstance;
