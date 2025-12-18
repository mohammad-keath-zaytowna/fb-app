import { ApiError } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosResponse } from "axios";

// API Configuration
// export const API_BASE_URL = "https://server.munjiz-jo.online/api";
export const API_BASE_URL = "http://192.168.0.70:5000/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("@auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData, let axios set it with boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - clear auth data
      if (error.response.status === 401) {
        try {
          await AsyncStorage.multiRemove([
            "@auth_user",
            "@auth_token",
            "@auth_refresh_token",
          ]);
        } catch (e) {
          console.error("Error clearing auth data:", e);
        }
      }

      // Server responded with error status
      const apiError: ApiError = {
        message: error.response.data?.message || "An error occurred",
        errors: error.response.data?.errors,
        status: error.response.status,
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request was made but no response received
      const apiError: ApiError = {
        message: "No response from server",
        status: 0,
      };
      return Promise.reject(apiError);
    } else {
      // Something else happened
      const apiError: ApiError = {
        message: error.message || "An error occurred",
        status: 0,
      };
      return Promise.reject(apiError);
    }
  }
);

export default apiClient;
