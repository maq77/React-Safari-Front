// src/components/LoadingSpinner.jsx
import React from "react";

export default function LoadingSpinner({ text = "Loading…" }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60">
      <div className="card p-6 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto mb-3" />
        <div className="text-gold">{text}</div>
      </div>
    </div>
  );
}
