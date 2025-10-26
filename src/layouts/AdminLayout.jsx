// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <>
      <AdminNavbar />
      <main className="pt-20 min-h-[70vh] px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </>
  );
}
