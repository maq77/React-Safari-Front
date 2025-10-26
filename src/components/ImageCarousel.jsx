// src/components/ImageCarousel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

// If your API serves relative /uploads/... assets, you can leverage this helper.
// Otherwise you can delete resolveSrc and just use imgUrl directly.
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
function resolveSrc(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || /^data:/i.test(u)) return u;
  return u.startsWith("/") ? `${API_BASE}${u}` : u;
}

function getUrl(item) {
  if (!item) return "";
  if (typeof item === "string") return resolveSrc(item);
  return resolveSrc(item.url || item.imageUrl || item.ImageUrl);
}

export default function ImageCarousel({
  images = [],
  aspect = "16/9",          // "16/9" | "4/3" | "1/1" | any ratio
  rounded = "rounded-xl",
  autoPlay = true,
  interval = 3800,
  showDots = true,
  showArrows = true,
}) {
  const clean = useMemo(() => images.map(getUrl).filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const deltaX = useRef(0);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  // autoplay
  useEffect(() => {
    if (!autoPlay || clean.length <= 1) return;
    stopAuto();
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % clean.length), interval);
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, interval, clean.length]);

  const stopAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const go = (to) => {
    if (!clean.length) return;
    const next = (to + clean.length) % clean.length;
    setIdx(next);
  };
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (!wrapRef.current) return;
      // Only react if focused within page (no text input focus)
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        e.key === "ArrowLeft" ? prev() : next();
        stopAuto();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // touch / drag
  const onTouchStart = (e) => {
    stopAuto();
    setDragging(true);
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e) => {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    deltaX.current = x - startX.current;
  };
  const threshold = 40; // px
  const onTouchEnd = () => {
    setDragging(false);
    if (deltaX.current > threshold) prev();
    else if (deltaX.current < -threshold) next();
    deltaX.current = 0;
  };

  // fullscreen lightbox (simple)
  const [lightbox, setLightbox] = useState(false);

  if (!clean.length) return null;

  return (
    <>
      <div
        ref={wrapRef}
        className={`relative select-none ${rounded} overflow-hidden bg-[#0f0f0f]`}
        style={{ aspectRatio: aspect }}
        onMouseDown={onTouchStart}
        onMouseMove={onTouchMove}
        onMouseUp={onTouchEnd}
        onMouseLeave={() => dragging && onTouchEnd()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides */}
        <div
          className="h-full flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(${dragging ? -idx * 100 : -idx * 100}% + ${dragging ? deltaX.current : 0}px))`,
            willChange: "transform",
          }}
        >
          {clean.map((src, i) => (
            <div key={i} className="relative shrink-0 w-full h-full">
              {/* Lazy load current + neighbors */}
              <img
                src={src}
                alt={`Image ${i + 1}`}
                loading={Math.abs(i - idx) <= 1 ? "eager" : "lazy"}
                className="w-full h-full object-cover"
                draggable={false}
                onError={(e) => (e.currentTarget.style.opacity = 0)}
                onClick={() => setLightbox(true)}
              />
              {/* Subtle gradient for readability */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}
        </div>

        {/* Arrows */}
        {showArrows && clean.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/10"
              onClick={() => { prev(); stopAuto(); }}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/10"
              onClick={() => { next(); stopAuto(); }}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Top-right expand */}
        <button
          className="absolute right-2 top-2 grid place-items-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 border border-white/10"
          onClick={() => setLightbox(true)}
          aria-label="Expand"
        >
          <Maximize2 size={14} />
        </button>

        {/* Dots */}
        {showDots && clean.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
            {clean.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => { setIdx(i); stopAuto(); }}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col"
          onClick={() => setLightbox(false)}
        >
          <div className="flex-1 flex items-center justify-center relative">
            {/* Reuse same slider in lightbox */}
            <div className="relative w-[min(96vw,1100px)] h-[min(86vh,700px)]">
              <div className="absolute inset-0">
                <div
                  className="h-full flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(${-idx * 100}%)` }}
                >
                  {clean.map((src, i) => (
                    <div key={i} className="w-full h-full shrink-0 grid place-items-center p-2">
                      <img
                        src={src}
                        alt={`Image ${i + 1}`}
                        className="max-w-full max-h-full object-contain"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lightbox arrows */}
              {clean.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20"
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20"
                    onClick={(e) => { e.stopPropagation(); next(); }}
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Lightbox dots */}
          {clean.length > 1 && (
            <div className="pb-5 flex items-center justify-center gap-2">
              {clean.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  className={`h-2 rounded-full transition-all ${
                    idx === i ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
