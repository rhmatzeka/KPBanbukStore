import axios from 'axios';

const apiProtocol = process.env.REACT_APP_API_PROTOCOL || 'http';
const apiHost = process.env.REACT_APP_API_HOST || window.location.hostname || 'localhost';
const apiPort = process.env.REACT_APP_API_PORT || '8000';

const api = axios.create({
  baseURL: `${apiProtocol}://${apiHost}:${apiPort}/api`,
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
