// src/components/admin/TripEditorModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createTripMultipart, updateTripMultipart } from "@/services/adminService";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Clock, Tag as PriceIcon, MapPin, AlignLeft, UploadCloud, Image as ImgIcon, Trash2,
} from "lucide-react";

// derive asset origin from VITE_API_URL (strip trailing /api)
function apiOrigin() {
  const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  return API.replace(/\/api\/?$/, "");
}
function toAbsolute(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || /^data:/i.test(u)) return u;
  return apiOrigin() + (u.startsWith("/") ? u : `/${u}`);
}

export default function TripEditorModal({ isOpen, onClose, initial, onSave }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    startTime: "",
    endTime: "",
  });

  const [imageUrls, setImageUrls] = useState([]);   // ["https://..." or "/uploads/..."]
  const [imageFiles, setImageFiles] = useState([]); // [File...]

  useEffect(() => {
    if (!isOpen) return;
    const toTime = (v) => {
      if (!v) return "";
      const d = new Date(v);
      if (isNaN(d)) return "";
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    };

    setForm({
      title: initial?.title ?? initial?.Title ?? "",
      description: initial?.description ?? initial?.Description ?? "",
      location: initial?.location ?? initial?.Location ?? "",
      price: initial?.price ?? initial?.Price ?? "",
      startTime: toTime(initial?.startDate ?? initial?.StartDate),
      endTime: toTime(initial?.endDate ?? initial?.EndDate),
    });

    const fromDtoImgs =
      (initial?.Images ?? initial?.images ?? [])
        .map((i) => i?.ImageUrl ?? i?.imageUrl)
        .filter(Boolean);

    const singleFallback = (initial?.ImageUrl || initial?.image || initial?.imageUrl)
      ? [initial?.ImageUrl || initial?.image || initial?.imageUrl]
      : [];

    setImageUrls(fromDtoImgs.length ? fromDtoImgs : singleFallback);
    setImageFiles([]);
  }, [isOpen, initial]);

  const canSave = useMemo(() => {
    if (!form.title.trim()) return false;
    if (String(form.price).trim() === "" || isNaN(Number(form.price))) return false;
    if (!form.startTime || !form.endTime) return false;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    return (eh * 60 + em) > (sh * 60 + sm);
  }, [form]);

  const toTodayIsoLocal = (timeStr) => {
    const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    d.setHours(hh || 0, mm || 0, 0, 0);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  };

  const stop = (e) => e.stopPropagation();

  // ------- Image handlers -------
  const fileInputRef = useRef(null);
  const addFiles = (filesLike) => {
    const files = Array.from(filesLike || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files].slice(0, 15));
  };
  const onDrop = (e) => { e.preventDefault(); e.stopPropagation(); addFiles(e.dataTransfer.files); };
  const onBrowse = (e) => { addFiles(e.target.files); e.target.value = ""; };
  const removeFileAt = (idx) => setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeUrlAt = (idx) => setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  const [urlDraft, setUrlDraft] = useState("");
  const addUrl = () => { const u = urlDraft.trim(); if (u) { setImageUrls((p) => [...p, u]); setUrlDraft(""); } };

  const previews = useMemo(() => {
    const filePreviews = imageFiles.map((f) => ({ src: URL.createObjectURL(f), kind: "file" }));
    const urlPreviews = imageUrls.map((u) => ({ src: toAbsolute(u), kind: "url", raw: u }));
    return [...filePreviews, ...urlPreviews];
  }, [imageFiles, imageUrls]);

  useEffect(() => {
    return () => previews.forEach((p) => { if (p.kind === "file") URL.revokeObjectURL(p.src); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------- Submit -------
  const submit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    const tripDto = {
      Title: form.title,
      Description: form.description,
      Location: form.location,
      Price: Number(form.price),
      StartDate: toTodayIsoLocal(form.startTime),
      EndDate: toTodayIsoLocal(form.endTime),
      Images: imageUrls.map((u) => ({ ImageUrl: u })), // URLs go in JSON; files in FormData
    };

    if (initial?.id || initial?.Id) {
      const id = initial.id ?? initial.Id;
      await updateTripMultipart(id, tripDto, imageFiles);
    } else {
      await createTripMultipart(tripDto, imageFiles);
    }

    onSave?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={stop}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 md:static md:mx-auto md:my-16
                       w-full md:w-[760px] bg-slate-900 text-white rounded-t-2xl md:rounded-2xl
                       border border-slate-700 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur px-4 py-3 border-b border-slate-700 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg md:text-xl font-semibold text-gold">
                {initial ? "Edit Trip" : "Create Trip"}
              </h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={submit} className="max-h-[75vh] overflow-y-auto p-4 md:p-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title *</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Desert Safari"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              {/* Price & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Price *</label>
                  <div className="relative">
                    <PriceIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      inputMode="decimal"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="800"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Hurghada, Egypt"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <div className="relative">
                  <AlignLeft className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <textarea
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-red-500 resize-y"
                    placeholder="Thrilling off-road ride, Bedouin dinner, and star gazing…"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Time range (hours) */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Time Range *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Start</div>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="time"
                        step="900"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                        value={form.startTime}
                        onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">End</div>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="time"
                        step="900"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                        value={form.endTime}
                        onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
                {form.startTime && form.endTime && (() => {
                  const [sh, sm] = form.startTime.split(":").map(Number);
                  const [eh, em] = form.endTime.split(":").map(Number);
                  const ok = (eh * 60 + em) > (sh * 60 + sm);
                  return !ok ? <div className="mt-2 text-xs text-red-300">End time must be after start time.</div> : null;
                })()}
              </div>

              {/* Images */}
              <div
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                onDrop={onDrop}
                className="rounded-xl border-2 border-dashed border-red-500/30 bg-slate-800/40 p-3 md:p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-700 grid place-items-center">
                    {previews[0]?.src ? (
                      <img src={previews[0].src} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImgIcon className="w-7 h-7 text-white/60" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">Drag & drop or choose images</div>
                    <div className="text-xs text-gray-400">PNG / JPG / WEBP / AVIF — up to ~8MB each</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700 transition"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadCloud className="w-4 h-4" />
                        Browse
                      </button>
                      {(imageFiles.length > 0 || imageUrls.length > 0) && (
                        <span className="text-xs text-gray-400">
                          {imageFiles.length + imageUrls.length} selected • first is the cover
                        </span>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onBrowse}
                      />
                    </div>

                    {/* URL input */}
                    <div className="mt-3 grid grid-cols-[1fr,auto] gap-2">
                      <input
                        type="url"
                        value={urlDraft}
                        onChange={(e) => setUrlDraft(e.target.value)}
                        placeholder="Or paste an image URL (https://… or /uploads/...)"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button type="button" onClick={addUrl} className="px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 text-sm">
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview grid */}
                {(previews.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previews.map((p, i) => (
                      <div key={p.src + i} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                        <img src={p.src} alt={`Image ${i + 1}`} className="w-full h-28 object-cover" />
                        {i === 0 && (
                          <div className="absolute left-2 top-2 text-[10px] px-2 py-0.5 rounded-full bg-black/60 border border-white/20">
                            Cover
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => (p.kind === "file" ? removeFileAt(i) : removeUrlAt(i - imageFiles.length))}
                          className="absolute right-2 top-2 p-1 rounded-md bg-black/50 hover:bg-black/70"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-900/90 backdrop-blur px-4 py-3 border-t border-slate-700 rounded-b-2xl flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 md:flex-none md:px-4 md:py-2 px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSave}
                  className="flex-1 md:flex-none md:px-5 md:py-2 px-3 py-2 rounded-lg font-semibold
                             bg-gradient-to-r from-red-600 to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {initial ? "Save Changes" : "Create Trip"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
