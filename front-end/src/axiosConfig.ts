import axios from "axios";
import { refreshToken } from "./store/auth/authActions";

const server = axios.create({
  baseURL: "https://api.nexabank.it/api",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

server.interceptors.response.use((response) => {
  return response;
}, async(error) => {
  const originalRequest = error.config;
  if(error.response.status === 500) {
    // setError500(true);
  }else if (originalRequest.url !== "/auth/refreshToken" && error.response.status === 403 && !originalRequest._retry) {
    originalRequest._retry = true;  // Evita loop infiniti
    await refreshToken();
    return server(originalRequest);
  }
  return Promise.reject(error);
});

export default server;

