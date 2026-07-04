import axios from 'axios';

// Use production URL if deployed to Vercel (or similar), otherwise local backend
const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction ? 'https://ulip-be.vercel.app/api' : 'http://localhost:5001/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ulip_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
