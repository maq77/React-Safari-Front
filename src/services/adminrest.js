// src/services/adminRest.js
import { useAdminStore } from "../store/useAdminStore";

const BASE = import.meta.env.VITE_API_URL;

// Build Authorization headers from store
function authHeaders() {
  const token = useAdminStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Core request handler
async function request(path, { method = "GET", body, headers = {}, raw = false } = {}) {
  const opts = {
    method,
    headers: {
      ...authHeaders(),
      ...headers,
    },
  };

  // handle JSON automatically if body is plain object
  if (body instanceof FormData) {
    opts.body = body; // browser sets multipart/form-data automatically
  } else if (body !== undefined && body !== null) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);

  // Handle cases where response may not be JSON
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return raw ? res : data;
}

// Unified REST interface
export const rest = {
  get: async (path) => await request(path, { method: "GET" }),
  post: async (path, body) => await request(path, { method: "POST", body }),
  put: async (path, body) => await request(path, { method: "PUT", body }),
  del: async (path) => await request(path, { method: "DELETE" }),
  raw: async (path, opts) => await request(path, { ...opts, raw: true }),
};
