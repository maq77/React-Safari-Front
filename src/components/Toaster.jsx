import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNotifyStore } from "../store/useNotifyStore";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

const tone = {
  success: { border: "#16a34a", icon: <CheckCircle2 size={18} /> }, // green
  error:   { border: "#dc2626", icon: <AlertCircle size={18} /> },  // red
  info:    { border: "#D4AF37", icon: <Info size={18} /> },         // gold
};

export default function Toaster() {
  const toasts = useNotifyStore((s) => s.toasts);
  const dismiss = useNotifyStore((s) => s.dismiss);
  const reduceMotion = useReducedMotion();

  const item = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 },
    animate: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 },
    exit:    reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 },
    transition: { type: "spring", stiffness: 420, damping: 32, mass: 0.8 },
  };

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[1000] flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tTone = tone[t.type] || tone.info;
          return (
            <motion.div
              key={t.id}
              {...item}
              layout
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 120) dismiss(t.id); // swipe to dismiss
              }}
              className="pointer-events-auto card p-4 flex items-start gap-3 min-w-[280px] max-w-[360px] bg-[#0f0f0f]"
              style={{ borderLeft: `4px solid ${tTone.border}` }}
            >
              <div className="mt-0.5 text-gold shrink-0">{tTone.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-[#d1d1d1]">{t.title}</div>
                {t.message ? (
                  <div className="text-sm text-gray-400 mt-0.5">{t.message}</div>
                ) : null}
              </div>
              <button
                className="text-gray-400 hover:text-gold ml-2"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
