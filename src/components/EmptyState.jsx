// src/components/EmptyState.jsx
import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ icon, title, subtitle, cta, onCta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8 text-center"
    >
      <div className="flex justify-center mb-4 text-gold">{icon}</div>
      <h3 className="text-xl font-semibold text-gold mb-1">{title}</h3>
      {subtitle && <p className="text-gray-400 mb-4">{subtitle}</p>}
      {cta && (
        <button onClick={onCta} className="btn-gold inline-flex items-center gap-2">
          {cta}
        </button>
      )}
    </motion.div>
  );
}
