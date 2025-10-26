// src/pages/admin/DashboardHome.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GaugeCircle, Plane, Tags, ImageIcon, Calendar, Settings, Plus, Edit2, Trash2, LogOut, Star,
} from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import {
  getDashboardStats,
  listTripsAdmin,
  deleteTrip,
  listBookings,
  listReviewsAdmin,
  approveReview,
  deleteReview
} from "../../services/adminService";
import { notify } from "../../services/notify";
import Reservations from "./Reservations";
import { listGallery, upsertGallery, deleteGallery } from "../../services/galleryService";

// Modals
import TripEditorModal from "../../components/admin/TripEditorModal";
import CategoryEditorModal from "../../components/admin/CategoryEditorModal";
import GalleryEditorModal from "../../components/admin/GalleryEditorModal";
import LoadingSpinner from "../../components/LoadingSpinner";

// ---------- util: turn /uploads/... into absolute URL using VITE_API_URL ----------
function useOriginFromApi() {
  return useMemo(() => {
    const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
    // strip trailing /api to get origin
    return API.replace(/\/api\/?$/, "");
  }, []);
}
function assetUrl(origin, u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || /^data:/.test(u)) return u;
  return origin + (u.startsWith("/") ? u : `/${u}`);
}

const tabDefs = [
  { id: "dashboard", label: "Dashboard", icon: GaugeCircle },
  { id: "trips", label: "Trips", icon: Plane },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "reservations", label: "Reservations", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function DashboardHome() {
  const logout = useAdminStore((s) => s.logout);
  const origin = useOriginFromApi();

  const [activeTab, setActiveTab] = useState("dashboard");

  // data
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [categories, setCategories] = useState([]); // stubs
  const [gallery, setGallery] = useState([]);       // stubs
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [showTripModal, setShowTripModal] = useState(false);
  const [editTrip, setEditTrip] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editImage, setEditImage] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, t, b, r] = await Promise.all([
        getDashboardStats().catch(() => null),
        listTripsAdmin().catch(() => []),
        listBookings().catch(() => []),
        listReviewsAdmin().catch(() => []),
      ]);
      // console.debug("VITE_API_URL =", import.meta.env.VITE_API_URL);
      // console.debug("[admin] stats resp =", s);
      // console.debug("[admin] trips resp =", t);
      // console.debug("[admin] bookings resp =", b);

      setStats(s || { totalTrips: 0, totalBookings: 0, revenue: 0 });
      setTrips(Array.isArray(t) ? t : t?.items || []);
      setReservations(Array.isArray(b) ? b : []);
      setGallery(listGallery());
      setReviews(Array.isArray(r) ? r : r?.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Trip actions — modal performs API (create/update). We just close and reload.
  async function onSaveTrip() {
    setShowTripModal(false);
    setEditTrip(null);
    await loadAll();
    notify?.success?.("Saved", "Trip saved successfully");
  }
  function onSaveGallery(item) {
    const items = upsertGallery(item);
    setGallery(items);
    setShowGalleryModal(false);
    setEditImage(null);
    notify?.success?.("Gallery item saved");
  }
  function onDeleteGallery(id) {
    if (!confirm("Delete this image?")) return;
    const items = deleteGallery(id);
    setGallery(items);
    notify?.success?.("Gallery item deleted");
  }

 async function onToggleReviewApproval(id, next) {
   try {
     await approveReview(id, next);
     notify?.success?.(next ? "Review approved" : "Review unapproved");
     // refresh list
     const r = await listReviewsAdmin().catch(() => []);
     setReviews(Array.isArray(r) ? r : r?.items || []);
   } catch (err) {
     notify?.error?.("Failed", err?.data?.message || err?.message || "Could not update review");
   }
 }

 async function onDeleteReviewClick(id) {
   if (!confirm("Delete this review?")) return;
   try {
     await deleteReview(id);
     notify?.success?.("Review deleted");
     const r = await listReviewsAdmin().catch(() => []);
     setReviews(Array.isArray(r) ? r : r?.items || []);
   } catch (err) {
     notify?.error?.("Failed", err?.data?.message || err?.message || "Could not delete review");
   }
 }

  async function onDeleteTrip(t) {
    if (!confirm(`Delete "${t.title || t.name || "this trip"}"?`)) return;
    await deleteTrip(t.id || t.tripId);
    notify?.success?.("Trip deleted");
    loadAll();
  }

  const card = (label, value) => (
    <div className="card p-5">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gold-light">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="card p-4 flex justify-between items-center mb-4">
        <div className="text-gold font-semibold text-xl">Admin Dashboard</div>
        <button className="btn-ghost flex items-center gap-2" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* TABS */}
      <nav className="flex gap-2 p-2 bg-[#0b0b0b] border border-[#D4AF37]/10 rounded-xl mb-6 overflow-x-auto">
        {tabDefs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === t.id ? "bg-[#D4AF37] text-black" : "hover:bg-[#1a1a1a] text-[#d1d1d1]"
            }`}
          >
            <t.icon size={16} />
            <span className="capitalize">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <motion.main
        key={activeTab}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              {card("Total Trips", stats?.totalTrips ?? trips.length)}
              {card("Total Bookings", stats?.totalBookings ?? reservations.length)}
              {card("Revenue", `$${stats?.revenue ?? 0}`)}
            </div>
          </>
        )}

        {/* TRIPS TAB */}
        {activeTab === "trips" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gold">Trips</h2>
              <button
                className="btn-gold flex items-center gap-2"
                onClick={() => {
                  setEditTrip(null);
                  setShowTripModal(true);
                }}
              >
                <Plus size={16} /> Create Trip
              </button>
            </div>

            {trips.length === 0 ? (
              <EmptyState title="No trips yet" subtitle="Create your first trip to start accepting bookings." />
            ) : (
              <motion.div
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.06 }}
              >
                <AnimatePresence>
                  {trips.map((t) => {
                    const img0 =
                      t?.images?.[0] &&
                      (typeof t.images[0] === "string"
                        ? t.images[0]
                        : (t.images[0].imageUrl || t.images[0].ImageUrl));
                    return (
                      <motion.div
                        key={t.id || t.tripId}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-4"
                        whileHover={{ y: -3, scale: 1.01 }}
                      >
                        <div className="h-40 bg-[#111] rounded-lg overflow-hidden mb-3">
                          {img0 ? (
                            <img
                              className="w-full h-full object-cover"
                              src={assetUrl(origin, img0)}
                              alt={t.title || "Trip"}
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-4xl">🖼️</div>
                          )}
                        </div>
                        <div className="text-gold font-semibold">{t.title || t.name || "Untitled Trip"}</div>
                        {t.location && <div className="text-gray-400 text-sm">{t.location}</div>}
                        {typeof t.price !== "undefined" && (
                          <div className="text-gold-light font-bold mt-1">${t.price}</div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <button
                            className="btn-ghost"
                            onClick={() => {
                              setEditTrip(t);
                              setShowTripModal(true);
                            }}
                          >
                            <Edit2 size={14} className="inline mr-1" />
                            Edit
                          </button>
                          <button className="btn-ghost" onClick={() => onDeleteTrip(t)}>
                            <Trash2 size={14} className="inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

        {/* CATEGORIES TAB (stub) */}
        {activeTab === "categories" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gold">Categories</h2>
              <button
                className="btn-gold flex items-center gap-2"
                onClick={() => {
                  setEditCategory(null);
                  setShowCategoryModal(true);
                }}
              >
                <Plus size={16} /> Add Category
              </button>
            </div>

            {categories.length === 0 ? (
              <EmptyState title="No categories" subtitle="Add categories to organize your trips." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* map categories here */}
              </div>
            )}
          </>
        )}

        {/* GALLERY TAB (stub) */}
        {activeTab === "gallery" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gold">Gallery</h2>
              <button
                className="btn-gold flex items-center gap-2"
                onClick={() => { setEditImage(null); setShowGalleryModal(true); }}
              >
                <Plus size={16} /> Add Image
              </button>
            </div>

            {gallery.length === 0 ? (
              <EmptyState title="No images" subtitle="Add gallery images to showcase your trips." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gallery
                  .slice()
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || (a.title || "").localeCompare(b.title || ""))
                  .map((img) => (
                    <div key={img.id} className="card overflow-hidden">
                      <div className="h-44 bg-[#111] overflow-hidden">
                        {img.url ? (
                          <img className="w-full h-full object-cover" src={assetUrl(origin, img.url)} alt={img.title || `Image ${img.id}`} />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-5xl">🖼️</div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gold">{img.title || "Untitled"}</div>
                            {img.category && <div className="text-xs text-gray-400">#{img.category}</div>}
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-black/60 text-gray-300">
                            Order {img.orderIndex ?? 0}
                          </span>
                        </div>

                        {img.caption && <p className="text-sm text-gray-400">{img.caption}</p>}
                        <div className="text-xs text-gray-400">Visible: {img.visible ? "Yes" : "No"}</div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button className="btn-ghost" onClick={() => { setEditImage(img); setShowGalleryModal(true); }}>
                            <Edit2 size={14} className="inline mr-1" /> Edit
                          </button>
                          <button className="btn-ghost" onClick={() => onDeleteGallery(img.id)}>
                            <Trash2 size={14} className="inline mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
        
        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <>
            <h2 className="text-xl font-semibold text-gold mb-3">Reviews</h2>
            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" />
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="card p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gold">{r.name || "Guest"}</div>
                       <div className="text-[#FFD700] text-sm">
                         {"★".repeat(Math.max(1, Math.min(5, Number(r.rating) || 0)))}
                       </div>
                       <div className="text-sm text-gray-300 leading-relaxed">{r.comment}</div>
                       <div className="text-xs text-gray-500 mt-1">
                         {r.email || "No email"} · {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                       </div>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                       <button
                         className={`px-3 py-2 rounded-xl border transition ${
                           r.approved
                             ? "border-gray-500 text-gray-200 hover:bg-gray-800"
                             : "border-[#D4AF37] text-[#D4AF37] hover:bg-[#30280f]"
                         }`}
                         onClick={() => onToggleReviewApproval(r.id, !r.approved)}
                         title={r.approved ? "Unapprove" : "Approve"}
                       >
                         {r.approved ? "Unapprove" : "Approve"}
                       </button>
                       <button className="btn-ghost" onClick={() => onDeleteReviewClick(r.id)}>
                         Delete
                       </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}


        {/* RESERVATIONS TAB */}
        {activeTab === "reservations" && <Reservations />}
        
        {/* SETTINGS TAB (stub) */}
        {activeTab === "settings" && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gold mb-3">Settings</h2>
            <p className="text-gray-300">Wire your environment/contact settings here (WhatsApp, phone, map).</p>
          </div>
        )}
      </motion.main>

      {/* MODALS */}
      <AnimatePresence>
        {showTripModal && (
          <TripEditorModal
            isOpen={showTripModal}
            onClose={() => { setShowTripModal(false); setEditTrip(null); }}
            initial={editTrip}
            onSave={onSaveTrip}
          />
        )}

        {showCategoryModal && (
          <CategoryEditorModal
            isOpen={showCategoryModal}
            onClose={() => { setShowCategoryModal(false); setEditCategory(null); }}
            initial={editCategory}
            onSave={() => { notify?.success?.("Category saved"); setShowCategoryModal(false); }}
          />
        )}

        {showGalleryModal && (
          <GalleryEditorModal
            isOpen={showGalleryModal}
            onClose={() => { setShowGalleryModal(false); setEditImage(null); }}
            initial={editImage}
            onSave={onSaveGallery}
          />
        )}
      </AnimatePresence>

      {loading && <LoadingSpinner text="Loading data…" />}
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="card p-10 text-center">
      <h3 className="text-xl font-semibold text-gold mb-1">{title}</h3>
      {subtitle && <p className="text-gray-400">{subtitle}</p>}
    </div>
  );
}
