// src/components/admin/CategoryEditorModal.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function CategoryEditorModal({ isOpen, onClose, initial, onSave }) {
  const [form, setForm] = useState({ name: "", slug: "", description: "", order: 0, isActive: true });
  useEffect(() => {
    setForm(initial ? {
      name: initial.name || "", slug: initial.slug || "", description: initial.description || "",
      order: initial.order ?? 0, isActive: !!initial.isActive
    } : { name: "", slug: "", description: "", order: 0, isActive: true });
  }, [initial]);

  if (!isOpen) return null;

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-scrim">
      <motion.div className="modal-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gold text-xl font-semibold">{initial ? "Edit Category" : "Add Category"}</h3>
          <button className="text-gold" onClick={onClose}><X /></button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input className="input-dark" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
          <input className="input-dark" placeholder="Slug" value={form.slug} onChange={(e)=>setForm({...form,slug:e.target.value})} />
          <textarea className="textarea-dark" rows={3} placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input-dark" type="number" placeholder="Order" value={form.order} onChange={(e)=>setForm({...form,order:Number(e.target.value)})}/>
            <label className="flex items-center gap-2 text-gray-300">
              <input type="checkbox" checked={form.isActive} onChange={(e)=>setForm({...form,isActive:e.target.checked})}/>
              Active
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
