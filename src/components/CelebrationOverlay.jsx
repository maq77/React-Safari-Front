// src/components/CelebrationOverlay.jsx
import React, { useEffect, useRef } from "react";
import { useCelebrationStore } from "../store/useCelebrationStore";

export default function CelebrationOverlay() {
  const active = useCelebrationStore((s) => s.active);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) {
      // stop & clear
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // create particles
    const COLORS = ["#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#8338EC", "#FF006E"];
    const N = Math.min(220, Math.floor((canvas.width * canvas.height) / 18000));
    const parts = [];
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 8 + Math.random() * 8,
        h: 10 + Math.random() * 14,
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 2,
        rot: Math.random() * Math.PI,
        vr: -0.1 + Math.random() * 0.2,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: 0.8 + Math.random() * 0.2,
      });
    }
    particlesRef.current = parts;

    const step = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // gravity
        p.rot += p.vr;
        // wrap horizontally a bit for nicer feel
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* small centered text pulse */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="px-5 py-2 rounded-xl bg-black/50 text-white text-lg font-semibold animate-pulse">
          🎉 Booking Confirmed!
        </div>
      </div>
    </div>
  );
}
