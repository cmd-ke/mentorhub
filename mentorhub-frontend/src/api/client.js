import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  withCredentials: true,
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Increased to 5000ms to allow your Express/MongoDB backend enough time to process requests
  timeout: 5000 
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      // Prevent redirecting if the user is already trying to log in or register
      if (currentPath !== '/login' && currentPath !== '/register') {
        console.warn('Session expired or unauthorized, redirecting to login');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
