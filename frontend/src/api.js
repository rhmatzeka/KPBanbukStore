import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

export default api;
