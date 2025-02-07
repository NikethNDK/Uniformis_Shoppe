// import axios from 'axios';

// const BASE_URL='http://localhost:8000/';

// const adminAxiosInstance = axios.create({
//   baseURL: BASE_URL,
// });

// const productApi = axios.create({
//   baseURL: `${BASE_URL}/api/products`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// const addAuthToken= (config) => {
//     const adminToken = localStorage.getItem('adminToken');
//     if (adminToken) {
//       config.headers['Authorization'] = `Bearer ${adminToken}`;
//     }
//     return config;
//   }

// adminAxiosInstance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
// productApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// export default adminAxiosInstance;
// export {productApi}



// ///second workinfg
// import axios from 'axios';

// const BASE_URL = 'http://localhost:8000';

// const adminAxiosInstance = axios.create({
//   baseURL: `${BASE_URL}/api`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // Important for CSRF
// });

// const productApi = axios.create({
//   baseURL: `${BASE_URL}/api/products`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // Important for CSRF
// });

// const addAuthToken = (config) => {
//   const adminToken = localStorage.getItem('adminToken');
//   if (adminToken) {
//     config.headers['Authorization'] = `Bearer ${adminToken}`;
//   }
//   return config;
// };

// const clearAuthTokens = () => {
//   localStorage.removeItem('token');
//   localStorage.removeItem('refresh_token');
// };

// adminAxiosInstance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
// productApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// export default adminAxiosInstance;
// export { productApi,clearAuthTokens };

import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const adminAxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const productApi = axios.create({
  baseURL: `${BASE_URL}/api/products`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true,
});

const orderApi = axios.create({
  baseURL: `${BASE_URL}/api/orders/admin/orders`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const addAuthToken = (config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers['Authorization'] = `Bearer ${adminToken}`;
  }
  return config;
};

const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    console.error('Server Error:', error.response.data);
    return Promise.reject(error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error:', error.request);
    return Promise.reject({ message: 'Network error occurred' });
  } else {
    // Something else went wrong
    console.error('Error:', error.message);
    return Promise.reject({ message: error.message });
  }
};

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

createResponseInterceptor(adminAxiosInstance);
createResponseInterceptor(productApi);
createResponseInterceptor(orderApi); 

// Helper functions for common API operations
const apiHelpers = {
 
  // Order operations
  orders: {
    createFromCart: async (data) => {
      try {
        const response = await orderApi.post('/create_from_cart/', data);
        return response.data;
      }catch (error) {
        const errorResponse = error.response?.data || {}
        throw {
          message: errorResponse.error || "Failed to create order",
          type: error.response?.status === 404 ? "NOT_FOUND" : "ERROR",
          details: errorResponse
        }
      }
    },
    getOrders: async () => {
      try {
        const response = await orderApi.get('/');
        return response.data;
      } catch (error) {
        throw {
          message: "Failed to fetch orders",
          type: "ERROR",
          details: error.response?.data
        }
      }
    },
      // Get single order
      getOrder: async (orderId) => {
        try {
          const response = await orderApi.get(`/${orderId}/`)
          return response.data
        } catch (error) {
          throw {
            message: "Failed to fetch order details",
            type: error.response?.status === 404 ? "NOT_FOUND" : "ERROR",
            details: error.response?.data
          }
        }
      }
  }

};

adminAxiosInstance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
productApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
orderApi.interceptors.request.use(addAuthToken, (error)=>Promise.reject(error))

export default adminAxiosInstance;
export { orderApi,productApi,apiHelpers };

