import { create } from "zustand";
import { loginRequest } from "../services/adminAuthService";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: (() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch { return null; }
  })(),
  loading: false,
  error: null,

  isAuthenticated: () => !!get().token,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await loginRequest(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user || null));
      set({ token, user, loading: false });
      return true;
    } catch (e) {
      set({ error: e?.response?.data?.message || e?.message || "Login failed", loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
