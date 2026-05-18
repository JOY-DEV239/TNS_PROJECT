import axios from 'axios';
import Cookies from 'js-cookie';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const instance = axios.create({
  baseURL: apiUrl,
});

instance.interceptors.request.use((config) => {
  const token = Cookies.get('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
