// client/src/utils/axiosConfig.js
import axios from 'axios';

// Add request interceptor
axios.interceptors.request.use(
  config => {
    // Add withCredentials to every request
    config.withCredentials = true;
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    // Redirect to login page on 401 errors
    if (error.response && error.response.status === 401) {
      // Check if not already on login page to avoid redirect loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;