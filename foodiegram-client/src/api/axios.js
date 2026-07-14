// Central Axios instance. Automatically attaches the JWT (if present)
// to every outgoing request, and unwraps 401s so the app can log out.

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("foodiegram-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stale auth state.
      // AuthContext listens for this custom event to log the user out.
      localStorage.removeItem("foodiegram-token");
      localStorage.removeItem("foodiegram-user");
      window.dispatchEvent(new Event("foodiegram-unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
