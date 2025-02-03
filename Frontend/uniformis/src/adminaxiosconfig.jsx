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

const addAuthToken = (config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers['Authorization'] = `Bearer ${adminToken}`;
  }
  return config;
};

adminAxiosInstance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
productApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

export default adminAxiosInstance;
export { productApi };

