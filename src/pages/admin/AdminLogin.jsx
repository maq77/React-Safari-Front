// src/pages/admin/AdminLogin.jsx
import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";

export default function AdminLogin() {
  const login = useAdminStore((s) => s.login);
  const loading = useAdminStore((s) => s.loading);

  const handle = (e) => {
    e.preventDefault();
    const { username, password } = e.target;
    login(username.value, password.value);
  };

  return (
    <motion.div className="min-h-[60vh] flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <form onSubmit={handle} className="card p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="text-gold" />
          <h1 className="text-2xl font-bold text-gold">Admin Login</h1>
        </div>
        <input name="username" placeholder="Username" required className="input-dark mb-3" />
        <input name="password" type="password" placeholder="Password" required className="input-dark mb-4" />
        <button className="btn-gold w-full">{loading ? "Logging in…" : "Login"}</button>
      </form>
    </motion.div>
  );
}
