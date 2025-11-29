import axios from 'axios';

const api = axios.create({
  // 👇 CONFIRMA QUE ESTE LINK SEA TU BACKEND DE RENDER
  baseURL: 'https://evoplay-vamb.onrender.com', 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;