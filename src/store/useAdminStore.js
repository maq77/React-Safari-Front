// src/store/useAdminStore.js
import { create } from "zustand";
import { adminLoginRequest } from "../services/adminAuthService";

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export const useAdminStore = create((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: (() => { try { return JSON.parse(localStorage.getItem(USER_KEY)||"null"); } catch { return null; }})(),
  loading: false,
  error: null,

  isAuthenticated: () => !!get().token,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await adminLoginRequest(username, password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token, user, loading: false });
      return true;
    } catch (e) {
      set({ error: e?.message || "Login failed", loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, error: null });
  },
}));
