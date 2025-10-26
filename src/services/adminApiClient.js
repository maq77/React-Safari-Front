// src/services/adminApiClient.js
import axios from "axios";
import { useAdminStore } from "../store/useAdminStore";

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:7179/api
  headers: { "Content-Type": "application/json" },
});

// attach token to every admin request
adminApi.interceptors.request.use((config) => {
  const token = useAdminStore.getState().token; // read from zustand (no hook)
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// optional: toast + auto-logout on 401 (if you added notify)
import { notify } from "./notify"; // <= if you keep notify in src/services/notify.js
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err.message || "Request failed";
    if (status >= 400) {
      try { notify.error?.(`Error ${status}`, msg); } catch {}
    }
    if (status === 401) {
      try { useAdminStore.getState().logout(); } catch {}
    }
    return Promise.reject(err);
  }
);
