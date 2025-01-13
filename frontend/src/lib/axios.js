import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Optional, needed only for cross-origin requests with cookies
});

// Set Authorization header with token for every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt"); // Get the JWT token from localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
