import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const API_BASE_URL = 'https://fouruvisabackend.onrender.com/api';
// export const API_BASE_URL = 'http://192.168.29.20:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// console.log('API Base URL:', API_BASE_URL);
// Add interceptor to include token in every request
axiosInstance.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

export default axiosInstance;
