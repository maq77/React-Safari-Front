import React, { useState } from "react";
import { postReview } from "../services/reviewService";
import { motion } from "framer-motion";

export default function ReviewForm() {
  const [form, setForm] = useState({ name: "", email: "", comment: "", rating: 5 });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment) return;

    setSending(true);
    setMessage("");

    try {
      const res = await postReview(form);
      setMessage(res.message || "Thank you! Your review was submitted.");
      setForm({ name: "", email: "", comment: "", rating: 5 });
    } catch (err) {
      setMessage("Something went wrong. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      className="bg-[#0f0f0f]/70 border border-[#D4AF37]/20 rounded-2xl p-5 space-y-3 mt-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <h3 className="text-xl font-semibold text-gold">Leave a Review</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-dark"
          required
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-dark"
        />
      </div>

      <textarea
        placeholder="Write your feedback..."
        rows={3}
        value={form.comment}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        className="textarea-dark w-full"
        required
      />

      <div className="flex items-center gap-2">
        <span className="text-gray-300">Rating:</span>
        <select
          className="input-dark w-24"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ★
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="btn-gold w-full mt-2 disabled:opacity-60"
      >
        {sending ? "Sending..." : "Submit Review"}
      </button>

      {message && <div className="text-center text-sm text-gray-300 mt-2">{message}</div>}
    </motion.form>
  );
}
