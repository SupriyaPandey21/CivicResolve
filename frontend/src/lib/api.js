import axios from "axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:8000";

export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cr_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: auto logout on unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cr_token");
    }

    return Promise.reject(error);
  }
);

export function formatApiErrorDetail(detail) {
  if (!detail) {
    return "Something went wrong. Please try again.";
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.msg) return item.msg;
        return JSON.stringify(item);
      })
      .join(" ");
  }

  if (typeof detail === "object") {
    if (detail.msg) return detail.msg;
    if (detail.detail) return detail.detail;
  }

  return String(detail);
}

export default api;