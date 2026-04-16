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
let refreshPromise = null;

// ---- Device ID ----
const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// const PROXY_URL = "https://proxy-server-production-3f3a.up.railway.app";

// ---- Axios Instance ----
const axiosInstance = axios.create({
  // baseURL: PROXY_URL,
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
    "X-Client-Id": CLIENT_ID,
  },
});

// ---- Request Interceptor ----
axiosInstance.interceptors.request.use((config) => {
  config.headers["X-Device-Id"] = getDeviceId();

  const accessToken = getAccessToken();
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

// ---- Response Interceptor ----
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh-token") &&
      !originalRequest.url.includes("/sign-in")
    ) {
      if (isRefreshing) {
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

      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        isRefreshing = true;
        refreshPromise = axiosInstance
          .post("/api/v1/Authentication/refresh-token", {
            refreshToken: storedRefreshToken,
          })
          .then((response) => {
            const { accessToken, refreshToken } = response.data.data;
            setAccessToken(accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            axiosInstance.defaults.headers["Authorization"] =
              `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            return accessToken;
          })
          .catch((err) => {
            processQueue(err, null);
            clearAccessToken();
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            window.location.href = "/login";
            return Promise.reject(err);
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      return refreshPromise.then((accessToken) => {
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      });
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
