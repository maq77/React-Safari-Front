// src/components/admin/AdminNavbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Shield, LogOut, FilePlus2, ListChecks, BookOpen } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import { notify } from "../../services/notify";

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthed = useAdminStore((s) => s.isAuthenticated());
  const logout = useAdminStore((s) => s.logout);
  const isActive = (p) => location.pathname === p;

  const handleLogout = () => {
    logout();
    notify.info("Logged out", "You have been signed out.");
    setOpen(false);
    navigate("/"); // back to site
  };

  return (
    <nav className="nav-bar">
      <div className="nav-inner">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin" className="flex items-center gap-2 text-gold">
            <Shield size={20} />
            <span className="font-semibold">Admin</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link className={`nav-link ${isActive("/admin") ? "nav-link-active" : ""}`} to="/admin">
              <ListChecks className="inline-block mr-1" size={16} />
              Dashboard
            </Link>
            <Link className={`nav-link ${isActive("/admin/trips") ? "nav-link-active" : ""}`} to="/admin/trips">
              <BookOpen className="inline-block mr-1" size={16} />
              Trips
            </Link>
            <Link className={`nav-link ${isActive("/admin/trips/new") ? "nav-link-active" : ""}`} to="/admin/trips/new">
              <FilePlus2 className="inline-block mr-1" size={16} />
              Create Trip
            </Link>
            <Link className={`nav-link ${isActive("/admin/reservations") ? "nav-link-active" : ""}`} to="/admin/reservations">
              Reservations
            </Link>

            {isAuthed && (
              <button className="nav-link flex items-center gap-1" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>

          {/* mobile toggle */}
          <button onClick={() => setOpen((v) => !v)} className="md:hidden text-gold p-2" aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="md:hidden bg-black/90 border-t border-[#D4AF37]/30 backdrop-blur-sm">
          <Link onClick={() => setOpen(false)} to="/admin" className="block px-4 py-3 border-b border-[#D4AF37]/10">
            Dashboard
          </Link>
          <Link onClick={() => setOpen(false)} to="/admin/trips" className="block px-4 py-3 border-b border-[#D4AF37]/10">
            Trips
          </Link>
          <Link onClick={() => setOpen(false)} to="/admin/trips/new" className="block px-4 py-3 border-b border-[#D4AF37]/10">
            Create Trip
          </Link>
          <Link onClick={() => setOpen(false)} to="/admin/reservations" className="block px-4 py-3 border-b border-[#D4AF37]/10">
            Reservations
          </Link>

          {isAuthed && (
            <button onClick={handleLogout} className="block w-full text-left px-4 py-3">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
