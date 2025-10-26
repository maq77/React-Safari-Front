// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";

export default function ProtectedRoute({ children }) {
  const isAuthed = useAdminStore((s) => s.isAuthenticated());
  const location = useLocation();

  if (!isAuthed) {
    // send to /admin (AdminGate will render the login)
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  return children;
}
