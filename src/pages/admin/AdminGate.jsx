// src/pages/admin/AdminGate.jsx
import React from "react";
import { useAdminStore } from "../../store/useAdminStore";
import AdminLogin from "./AdminLogin";
import DashboardHome from "./DashboardHome";

export default function AdminGate() {
  const isAuthed = useAdminStore((s) => s.isAuthenticated());
  return isAuthed ? <DashboardHome /> : <AdminLogin />;
}
