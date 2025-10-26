import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { postReview } from "../services/tripService";

export default function ReviewModal({ open, onClose, onSubmitted }) {
  const [form, setForm] = useState({ name: "", email: "", comment: "", rating: 5 });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment) return;
    setSending(true);
    setMsg("");
    try {
      const res = await postReview(form);
      setMsg(res?.message || "Thanks! Your review was submitted.");
      setForm({ name: "", email: "", comment: "", rating: 5 });
      onSubmitted?.(); // parent can re-fetch reviews
      // auto-close after a brief moment
      setTimeout(onClose, 900);
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="mx-auto mt-24 w-[92%] max-w-md bg-[#0f0f0f] border border-[#D4AF37]/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gold">Write a review</h3>
              <button onClick={onClose} className="p-2 rounded hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="input-dark"
                  placeholder="Your Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  className="input-dark"
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <textarea
                className="textarea-dark"
                rows={3}
                placeholder="Your experience *"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                required
              />

              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">Rating:</span>
                <select
                  className="input-dark w-24"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} ★</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={sending} className="btn-gold w-full">
                {sending ? "Sending…" : "Submit"}
              </button>

              {msg && <div className="text-center text-sm text-gray-300">{msg}</div>}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
