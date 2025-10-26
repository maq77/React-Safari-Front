// src/pages/admin/AdminTrips.jsx
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import TripEditorModal from "../../components/admin/TripEditorModal";
import { listTripsAdmin, createTrip, updateTrip, deleteTrip } from "../../services/adminService";
import { notify } from "../../services/notify";

export default function AdminTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listTripsAdmin();
      setTrips(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      notify.error("Load failed", e.message || "Could not load trips");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onSave(payload) {
    try {
      if (editing) {
        await updateTrip(editing.id || editing.tripId, payload);
        notify.success("Trip updated", payload.Title);
      } else {
        await createTrip(payload);
        notify.success("Trip created", payload.Title);
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      notify.error("Save failed", e?.data?.message || e.message);
    }
  }

  async function onDelete(t) {
    if (!confirm(`Delete "${t.title || t.name}"?`)) return;
    try {
      await deleteTrip(t.id || t.tripId);
      notify.success("Trip deleted");
      load();
    } catch (e) {
      notify.error("Delete failed", e?.data?.message || e.message);
    }
  }

  if (loading) return <div className="p-6">Loading trips…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gold">Trips</h1>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus size={16} /> Create Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="card p-10 text-center">
          <h3 className="text-xl font-semibold text-gold mb-1">No trips yet</h3>
          <p className="text-gray-400">Click “Create Trip” to add your first adventure.</p>
        </div>
      ) : (
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" initial="hidden" animate="show" transition={{ staggerChildren: 0.06 }}>
          <AnimatePresence>
            {trips.map((t) => (
              <motion.div key={t.id || t.tripId} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-4" whileHover={{ y: -3, scale: 1.01 }}>
                <div className="h-40 bg-[#111] rounded-lg overflow-hidden mb-3">
                  {t.images?.[0] && (
                    <img
                      className="w-full h-full object-cover"
                      src={typeof t.images[0] === "string" ? t.images[0] : t.images[0].imageUrl}
                      alt={t.title}
                    />
                  )}
                </div>
                <div className="text-gold font-semibold">{t.title || t.name}</div>
                <div className="text-gray-400 text-sm">{t.location}</div>
                <div className="text-gold-light font-bold mt-1">${t.price}</div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button className="btn-ghost" onClick={() => { setEditing(t); setOpen(true); }}>
                    <Edit2 size={14} className="inline mr-1" /> Edit
                  </button>
                  <button className="btn-ghost" onClick={() => onDelete(t)}>
                    <Trash2 size={14} className="inline mr-1" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <TripEditorModal
        isOpen={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        initial={editing}
        onSave={onSave}
      />
    </div>
  );
}
