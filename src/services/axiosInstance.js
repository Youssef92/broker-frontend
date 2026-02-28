import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../utils/tokenManager";

const DEVICE_ID_KEY = "deviceId";
const CLIENT_ID = "162ebb94-cc91-459e-8108-ca16be52e940";

const REFRESH_TOKEN_KEY = "refreshToken";
let isRefreshing = false;
let failedQueue = [];

// ---- Device ID ----
// Generate a GUID and store it in localStorage so it's the same every time
const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// ---- Axios Instance ----
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
    "X-Client-Id": CLIENT_ID,
  },
});

// ---- Request Interceptor ----
// Runs before every request — attaches accessToken and deviceId
axiosInstance.interceptors.request.use((config) => {
  config.headers["X-Device-Id"] = getDeviceId();

  const accessToken = getAccessToken(); // we'll connect this from AuthContext later
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return config;
});

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response, // if success, just return the response
  async (error) => {
    const originalRequest = error.config;

    // if 401 and not already retried and not the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh-token")
    ) {
      if (isRefreshing) {
        // if already refreshing, add to queue and wait
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axiosInstance.post(
          "/api/v1/Authentication/refresh-token",
          {
            refreshToken: storedRefreshToken,
          },
        );

        const { accessToken, refreshToken } = response.data.data;

        setAccessToken(accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        axiosInstance.defaults.headers["Authorization"] =
          `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearAccessToken();
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
