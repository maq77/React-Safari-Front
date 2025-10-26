// src/services/adminAuthService.js
import { rest } from "./adminrest";
import { notify } from "../services/notify";

export async function adminLoginRequest(username, password) {
  if (!username || !password) {
    notify.error?.("Login failed", "Username and password are required.");
    throw new Error("Missing credentials");
  }
  try {
    // NOTE: capital A like Swagger: /Auth/login
    const data = await rest.post("/Auth/login", { username, password });
    if (!data?.token) throw new Error("Invalid login response");
    notify.success?.("Login successful", "Welcome back!");
    return { token: data.token, user: null }; // backend returns token only (ok)
  } catch (err) {
    const msg =
      err?.data?.message ||
      (err.status === 401 ? "Invalid username or password" : err.message || "Unable to login");
    notify.error?.("Login failed", msg);
    throw err;
  }
}
