// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Menu, X, LogOut, Shield } from "lucide-react";
import { useAdminStore } from "../store/useAdminStore";
import { notify } from "../services/notify";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthed = useAdminStore((s) => s.isAuthenticated());
  const logout = useAdminStore((s) => s.logout);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    notify.info("Logged out", "You have been signed out.");
    setOpen(false);
    navigate("/");
  };

  const closeMenu = () => setOpen(false);

  return (
    <nav className="nav-bar">
      <div className="nav-inner">
        <div className="flex justify-between items-center h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-3" onClick={closeMenu}>
            <Compass className="w-10 h-10 text-gold animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-gold">Hurghada Safari</h1>
              <p className="text-xs text-gold-light/80">Desert Adventures</p>
            </div>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              className={`nav-link ${isActive("/trips") ? "nav-link-active" : ""}`}
              to="/trips"
            >
              Trips
            </Link>
            <a className="nav-link" href="#about">
              About
            </a>
            <a className="nav-link" href="#contact">
              Contact
            </a>

            {/* Admin link (always visible). If not authed, /admin will redirect to /admin/login via ProtectedRoute */}
            <Link
              className={`nav-link flex items-center gap-1 ${
                isActive("/admin") ? "nav-link-active" : ""
              }`}
              to="/admin"
              title="Admin"
            >
              <Shield size={16} />
              Admin
            </Link>

            {/* Logout shown ONLY when authed (no Login link at all) */}
            {isAuthed && (
              <button className="nav-link flex items-center gap-1" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-gold p-2"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-black/90 border-t border-[#D4AF37]/30 backdrop-blur-sm">
          <Link
            onClick={closeMenu}
            to="/trips"
            className="block w-full text-left px-4 py-4 border-b border-[#D4AF37]/10"
          >
            Trips
          </Link>
          <a
            onClick={closeMenu}
            href="#about"
            className="block w-full text-left px-4 py-4 border-b border-[#D4AF37]/10"
          >
            About
          </a>
          <a
            onClick={closeMenu}
            href="#contact"
            className="block w-full text-left px-4 py-4 border-b border-[#D4AF37]/10"
          >
            Contact
          </a>
          <Link
            onClick={closeMenu}
            to="/admin"
            className="block w-full text-left px-4 py-4 border-b border-[#D4AF37]/10"
          >
            <span className="inline-flex items-center gap-2">
              <Shield size={16} /> Admin
            </span>
          </Link>

          {/* Logout only if authed */}
          {isAuthed && (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-4"
              title="Logout"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut size={16} /> Logout
              </span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
