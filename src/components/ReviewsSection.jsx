import React from "react";
import { motion } from "framer-motion";
import ReviewStars from "./ReviewStars";

const item = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show:   { opacity: 1, y: 0,  scale: 1 },
};

export default function ReviewsSection({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="col-span-full text-center text-gray-400 py-12 border border-dashed border-[#D4AF37]/20 rounded-xl">
        No reviews yet — be the first!
      </div>
    );
  }

  return (
    <motion.div
      className="grid md:grid-cols-3 sm:grid-cols-2 gap-6 -mt-2"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.06 }}
    >
      {reviews.map((r, idx) => (
        <motion.div
          key={r.id ?? idx}
          variants={item}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.7 }}
          className="card overflow-hidden relative"
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#D4AF37]/60 to-[#FFD700]/60" />
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gold">{r.name || "Guest"}</div>
              <ReviewStars rating={r.rating || 5} />
            </div>
            <p className="text-gray-300 leading-relaxed">{r.comment}</p>
            <div className="text-xs text-gray-500">
              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
