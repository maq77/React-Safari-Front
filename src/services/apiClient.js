import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL; // <-- single source of truth

export const api = axios.create({
  baseURL,
  // withCredentials: true, // enable if your .NET sets cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: small logger
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API ERROR]", err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);
