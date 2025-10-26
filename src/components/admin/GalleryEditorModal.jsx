// src/components/admin/GalleryEditorModal.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, UploadCloud, Image as ImgIcon, Trash2 } from "lucide-react";
import { uploadGalleryFiles } from "../../services/galleryService";

export default function GalleryEditorModal({ isOpen, onClose, initial, onSave }) {
  const [form, setForm] = useState({ url: "", title: "", caption: "", category: "", orderIndex: 0, visible: true });
  const [files, setFiles] = useState([]);
  const [urlDraft, setUrlDraft] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setForm(initial ? {
      id: initial.id, url: initial.url || "", title: initial.title || "",
      caption: initial.caption || "", category: initial.category || "",
      orderIndex: initial.orderIndex ?? 0, visible: !!initial.visible
    } : { url: "", title: "", caption: "", category: "", orderIndex: 0, visible: true });
    setFiles([]);
    setUrlDraft("");
  }, [isOpen, initial]);

  const fileInputRef = useRef(null);
  const previews = useMemo(() => {
    const fs = files.map(f => ({ src: URL.createObjectURL(f), kind: "file" }));
    const url = form.url ? [{ src: form.url, kind: "url" }] : [];
    return [...url, ...fs];
  }, [files, form.url]);

  useEffect(() => {
    return () => previews.forEach(p => { if (p.kind === "file") URL.revokeObjectURL(p.src); });
  }, []);

  if (!isOpen) return null;

  const addFiles = (fileList) => {
    const picked = Array.from(fileList || []).filter(f => f.type.startsWith("image/"));
    if (!picked.length) return;
    setFiles(prev => [...prev, ...picked].slice(0, 15));
  };
  const onDrop = (e) => { e.preventDefault(); addFiles(e.dataTransfer.files); };
  const onBrowse = (e) => { addFiles(e.target.files); e.target.value = ""; };

  const removeFileAt = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const addUrl = () => {
    const u = urlDraft.trim();
    if (u) { setForm(f => ({ ...f, url: u })); setUrlDraft(""); }
  };

  const submit = async (e) => {
    e.preventDefault();

    let finalUrl = form.url;
    if (!finalUrl && files.length) {
      // upload first (use first image as main)
      const uploaded = await uploadGalleryFiles(files);
      finalUrl = uploaded[0]?.url || "";
    }
    const payload = {
      ...form,
      url: finalUrl,
      orderIndex: Number(form.orderIndex) || 0,
      visible: !!form.visible
    };
    onSave?.(payload);
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <motion.div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gold text-xl font-semibold">{initial ? "Edit Image" : "Add Image"}</h3>
          <button className="text-gold" onClick={onClose}><X /></button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={onDrop}
            className="rounded-xl border-2 border-dashed border-[#D4AF37]/40 bg-black/30 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-700 grid place-items-center">
                {previews[0]?.src ? (
                  <img src={previews[0].src} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImgIcon className="w-7 h-7 text-white/60" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-300">Drag & drop or choose an image</div>
                <div className="text-xs text-gray-400">PNG / JPG / WEBP / AVIF</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="w-4 h-4" />
                    Browse
                  </button>
                  {(files.length > 0) && (
                    <span className="text-xs text-gray-400">{files.length} file(s) selected</span>
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
                    placeholder="Or paste an image URL (https://…)"
                    className="input-dark"
                  />
                  <button type="button" onClick={addUrl} className="btn-ghost">Use URL</button>
                </div>
              </div>
            </div>

            {/* Preview more files */}
            {previews.length > 1 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previews.map((p, i) => (
                  <div key={p.src + i} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                    <img src={p.src} alt={`Image ${i + 1}`} className="w-full h-28 object-cover" />
                    {i > 0 && p.kind === "file" && (
                      <button
                        type="button"
                        onClick={() => removeFileAt(i - 1)}
                        className="absolute right-2 top-2 p-1 rounded-md bg-black/50 hover:bg-black/70"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meta */}
          <input className="input-dark" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
          <textarea className="textarea-dark" rows={3} placeholder="Caption" value={form.caption} onChange={(e)=>setForm({...form,caption:e.target.value})}/>
          <div className="grid sm:grid-cols-3 gap-3">
            <input className="input-dark" placeholder="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}/>
            <input className="input-dark" type="number" placeholder="Order" value={form.orderIndex} onChange={(e)=>setForm({...form,orderIndex:Number(e.target.value)})}/>
            <label className="flex items-center gap-2 text-gray-300">
              <input type="checkbox" checked={form.visible} onChange={(e)=>setForm({...form,visible:e.target.checked})}/>
              Visible
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn-gold flex-1">{initial ? "Update" : "Create"}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
