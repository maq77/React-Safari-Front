import React from "react";

export default function ReviewStars({ rating = 5, size = 16 }) {
  const full = Math.round(Number(rating) || 0);
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${full} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          className={i < full ? "fill-[#FFD700]" : "fill-[#5b5b5b]"}
        >
          <path d="M10 15.27 15.18 18l-1.64-5.03L18 9.24l-5.19-.04L10 4 7.19 9.2 2 9.24l4.46 3.73L4.82 18 10 15.27z" />
        </svg>
      ))}
    </div>
  );
}
