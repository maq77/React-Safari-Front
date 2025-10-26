// src/pages/admin/Reservations.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarX2, CalendarCheck2, Filter, CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";
import {
  listBookingsAll,
  listBookingsBooked,
  listBookingsUnbooked,
  setBookingStatus,
} from "../../services/adminService";
import { notify } from "../../services/notify";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "booked", label: "Booked" },
  { id: "unbooked", label: "Unbooked" },
];

export default function Reservations() {
  const [filter, setFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [updatingId, setUpdatingId] = useState(null); // track row updating

  async function load() {
    setLoading(true);
    try {
      let data = [];
      if (filter === "booked") data = await listBookingsBooked();
      else if (filter === "unbooked") data = await listBookingsUnbooked();
      else data = await listBookingsAll();

      setBookings(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      notify.error("Load reservations failed", err?.data?.message || err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  const filtered = useMemo(() => {
    if (!q.trim()) return bookings;
    const s = q.trim().toLowerCase();
    return bookings.filter((b) =>
      (b.customerName ?? "").toLowerCase().includes(s) ||
      (b.customerEmail ?? "").toLowerCase().includes(s) ||
      (b.customerPhone ?? "").toLowerCase().includes(s) ||
      (b.whatsappNumber ?? "").toLowerCase().includes(s) ||
      (b.notes ?? "").toLowerCase().includes(s) ||
      String(b.tripId ?? "").includes(s)
    );
  }, [q, bookings]);

  async function toggleConfirm(b) {
    const next = !b.isBooked; // ✅ flip!
    setUpdatingId(b.id);

    // optimistic UI
    setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, isBooked: next } : x)));

    try {
      const updated = await setBookingStatus(b.id, next);
      const confirmed = typeof updated?.isBooked === "boolean" ? updated.isBooked : next;

      // reconcile with server response
      setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, isBooked: confirmed } : x)));

      notify.success(confirmed ? "Booking confirmed" : "Booking set to unbooked");
    } catch (err) {
      // revert optimistic change
      setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, isBooked: b.isBooked } : x)));
      notify.error("Update failed", err?.data?.message || err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <div className="p-6">Loading reservations…</div>;

  if (!filtered.length) {
    return (
      <div className="p-6 space-y-4">
        <FilterBar filter={filter} setFilter={setFilter} q={q} setQ={setQ} />
        <EmptyState
          icon={<CalendarX2 size={36} />}
          title="No reservations"
          subtitle="Bookings will appear here as soon as customers reserve trips."
        />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-4">
      <FilterBar filter={filter} setFilter={setFilter} q={q} setQ={setQ} />

      {filtered.map((b) => {
        const isUpdating = updatingId === b.id;
        return (
          <div key={b.id} className="card p-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Left: Basic */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-gold font-semibold">
                    #{b.id} — Trip #{b.tripId}
                  </div>
                  <StatusPill isBooked={!!b.isBooked} />
                </div>
                {b.preferredDate && (
                  <div className="text-gray-400 text-sm">
                    🗓 Preferred: {String(b.preferredDate).slice(0, 10)}
                  </div>
                )}
                {b.notes && <div className="text-xs text-gray-400 italic max-w-prose">“{b.notes}”</div>}
              </div>

              {/* Middle: Customer */}
              <div className="text-sm text-gray-300">
                <div><span className="text-gray-400">Name:</span> {b.customerName || "-"}</div>
                <div><span className="text-gray-400">Email:</span> {b.customerEmail || "-"}</div>
                <div><span className="text-gray-400">Phone:</span> {b.customerPhone || "-"}</div>
                <div><span className="text-gray-400">WhatsApp:</span> {b.whatsappNumber || "-"}</div>
                <div>
                  <span className="text-gray-400">Adults:</span> {b.numberOfAdults ?? 0} &nbsp; / &nbsp;
                  <span className="text-gray-400">Children:</span> {b.numberOfChildren ?? 0}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  disabled={isUpdating}
                  className={`px-3 py-2 rounded-xl border transition inline-flex items-center gap-2 ${
                    b.isBooked
                      ? "border-gray-500 text-gray-200 hover:bg-gray-800"
                      : "border-[#D4AF37] text-[#D4AF37] hover:bg-[#30280f]"
                  } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={() => toggleConfirm(b)}
                  title={b.isBooked ? "Set Unbooked" : "Confirm Booking"}
                >
                  {isUpdating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : b.isBooked ? (
                    <XCircle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {isUpdating ? "Updating..." : b.isBooked ? "Unconfirm" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function StatusPill({ isBooked }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
        isBooked
          ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/40"
          : "bg-yellow-900/30 text-yellow-200 border border-yellow-700/30"
      }`}
    >
      {isBooked ? <CalendarCheck2 size={14} /> : <CalendarX2 size={14} />}
      {isBooked ? "Booked" : "Unbooked"}
    </span>
  );
}

function FilterBar({ filter, setFilter, q, setQ }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-2 rounded-xl border transition ${
              filter === f.id ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "border-[#D4AF37]/30 text-[#d1d1d1]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="relative md:ml-auto">
        <Search className="absolute left-3 top-2.5 opacity-60" size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name / email / phone / notes / trip id…"
          className="pl-9 pr-3 py-2 rounded-xl bg-[#0b0b0b] border border-[#D4AF37]/20 text-sm"
        />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="card p-10 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <h3 className="text-xl font-semibold text-gold mb-1">{title}</h3>
      {subtitle && <p className="text-gray-400">{subtitle}</p>}
    </div>
  );
}
