import React from "react";
import { MessageSquarePlus } from "lucide-react";

export default function FloatingReviewButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-40 btn-gold rounded-full px-4 py-3 flex items-center gap-2 shadow-lg"
    >
      <MessageSquarePlus size={18} />
      Write a review
    </button>
  );
}
