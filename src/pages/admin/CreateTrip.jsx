// src/pages/admin/CreateTrip.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { createTrip } from "../../services/adminService";
import { notify } from "../../services/notify";
import { useNavigate } from "react-router-dom";

export default function CreateTrip() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    startTime: "", // HH:MM
    endTime: "",   // HH:MM
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Build an ISO string for "today at HH:MM"
  function toTodayIso(timeStr) {
    // timeStr like "09:00"
    const [hh, mm] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setSeconds(0, 0);
    d.setHours(hh || 0, mm || 0, 0, 0);
    // Send without timezone "Z" so .NET treats it as local, or keep as local ISO
    // Most .NET JSON binders happily accept "YYYY-MM-DDTHH:mm:ss"
    const pad = (n) => String(n).padStart(2, "0");
    const isoLocal =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    return isoLocal;
  }

  async function submit(e) {
    e.preventDefault();

    // Basic validation for times
    if (!form.startTime || !form.endTime) {
      notify.error("Validation", "Please choose start and end times.");
      return;
    }
    // compare as minutes from midnight
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const startM = (sh ?? 0) * 60 + (sm ?? 0);
    const endM = (eh ?? 0) * 60 + (em ?? 0);
    if (endM <= startM) {
      notify.error("Validation", "End time must be after start time.");
      return;
    }

    setSubmitting(true);
    try {
      await createTrip({
        Title: form.title,
        Description: form.description,
        Location: form.location,
        Price: Number(form.price),
        StartDate: toTodayIso(form.startTime), // e.g. "2025-10-24T09:00:00"
        EndDate: toTodayIso(form.endTime),     // e.g. "2025-10-24T17:00:00"
        Images: null, // will handle upload later
      });
      notify.success("Trip created", form.title || "New trip");
      navigate("/admin/trips");
    } catch (err) {
      notify.error("Create failed", err?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="card p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gold mb-4">Create Trip</h1>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="input-dark"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <textarea
            className="textarea-dark"
            rows={4}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            className="input-dark"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <input
            className="input-dark"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          {/* Hours only */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Start</label>
              <input
                className="input-dark"
                type="time"
                step="900" // 15-minute steps
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">End</label>
              <input
                className="input-dark"
                type="time"
                step="900"
                value={form.endTime}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button disabled={submitting} className="btn-gold">
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
