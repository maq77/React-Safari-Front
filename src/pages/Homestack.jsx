// src/pages/HomeStack.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ImageIcon, MessageSquareText, MessageCircle, Phone } from "lucide-react";
import { getTrips, getReviews } from "../services/tripService";
import ImageCarousel from "../components/ImageCarousel";
import { listGallery } from "../services/galleryService"; // the localStorage-backed service you used in Admin
import ReviewsSection from "../components/ReviewsSection";
import ReviewModal from "../components/ReviewModal";
import FloatingReviewButton from "../components/FloatingReviewButton";
import NightSkyBackground from '../components/NightSkyBackground';

// --- Helpers to fix image URLs ---
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 320'>
      <rect width='100%' height='100%' fill='#111'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='sans-serif' font-size='18' fill='#aaa'>
        No Image
      </text>
    </svg>`
  );

function resolveSrc(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || /^data:/i.test(u)) return u;
  return u.startsWith("/") ? `${API_BASE}${u}` : `${API_BASE}/${u}`;
}
function pickImage(item) {
  if (!item) return "";
  if (typeof item === "string") return resolveSrc(item);
  return resolveSrc(item.imageUrl || item.ImageUrl || item.url || "");
}

export default function HomeStack() {
  const [trips, setTrips] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const t = await getTrips();
        const arr = Array.isArray(t) ? t : t?.items ?? [];
        // normalize trip images to absolute urls
        const normalized = arr.map((trip) => {
          const imgs = (trip.images || trip.Images || [])
            .map(pickImage)
            .filter(Boolean);
          return { ...trip, images: imgs };
        });
        setTrips(normalized);
        //get gallery from localStorage service
        // const saved = listGallery(); // [{ id, url, ... }]
        // if (Array.isArray(saved) && saved.length) {
        //   setGallery(
        //     saved
        //       .filter(g => !!g?.url)
        //       .slice(0, 12)
        //       .map(g => ({ url: resolveSrc(g.url) }))
        //   );
        // }

        // derive gallery (unique, absolute URLs)
        //if(!saved.length){
          const g = [...new Set(normalized.flatMap((trip) => trip.images || []))];
          setGallery(g.slice(0, 12).map((url) => ({ url })));
        //}
        
        //Reviews 
        const r = await getReviews();
        setReviews(Array.isArray(r) ? r : []);

      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const avgRating =
    reviews?.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "5.0";

  const mapsHref = import.meta.env.VITE_MAPS_URL || "https://maps.app.goo.gl/ghUyjidS9MBffSpQ8";
  const phone = import.meta.env.VITE_CONTACT_PHONE || "";
  const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || "";

  return (
    <>
    <NightSkyBackground />
      <Hero onTrips={() => go("trips")} onReviews={() => go("reviews")} onGallery={() => go("gallery")} onMap={() => go("map")} />

      <div className="px-4 pb-16 max-w-6xl mx-auto w-full">
        {/* Trips */}
        <SectionTitle id="trips" title="Featured Trips" />
        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading trips…</div>
        ) : trips.length ? (
          <TripsGrid trips={trips} />
        ) : (
          <Empty text="No trips yet. New adventures are coming soon!" />
        )}

        {/* Reviews */}
        <SectionTitle id="reviews" title="What Travelers Say" className="mt-16" />
        <ReviewsSection reviews={reviews} />
        {/* Floating Actions */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {/* your WhatsApp / Call buttons */}
          <FloatingReviewButton onClick={() => setShowReviewModal(true)} />
        </div>
        {/* Review Modal (form inside modal) */}
        <ReviewModal
          open={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={async () => {
            try {
              const r = await getReviews();
              setReviews(Array.isArray(r) ? r : []);
            } catch {}
          }}
        />

        {/* Gallery */}
        <SectionTitle id="gallery" title="Gallery" className="mt-16" />
        {gallery.length ? (
          <GalleryGrid images={gallery} />
        ) : (
          <Empty text="No gallery images yet." />
        )}

        {/* Map */}
        <SectionTitle id="map" title="Find Us" className="mt-16" />
        <MapBlock mapSrc={import.meta.env.VITE_IFRAME_MAP_SRC} />

        {/* Floating Actions */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {whatsapp && (
            <a
              href={`https://wa.me/${(whatsapp || "").replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-gold rounded-full px-4 py-3 flex items-center gap-2"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="btn-ghost rounded-full px-4 py-3 flex items-center gap-2">
              <Phone size={18} /> Call
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function Hero({ onTrips, onReviews, onGallery, onMap }) {
  return (
    <section className="pt-24 text-center px-4 scroll-mt-24">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold text-gold mb-4"
      >
        Discover Hurghada Safari
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-gray-300 mb-6">
        Desert adventures, crystal waters, and unforgettable memories.
      </motion.p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Secondary onClick={onTrips}>See Trips</Secondary>
        <Secondary onClick={onReviews}><MessageSquareText className="w-4 h-4" /> Reviews</Secondary>
        <Secondary onClick={onGallery}><ImageIcon className="w-4 h-4" /> Gallery</Secondary>
        <Secondary onClick={onMap}><MapPin className="w-4 h-4" /> Map</Secondary>
      </div>
    </section>
  );
}

function SectionTitle({ id, title, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <h2 className="text-3xl font-bold text-center mb-6 text-gold">{title}</h2>
    </section>
  );
}

function TripsGrid({ trips }) {
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 -mt-2"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.06 }}
    >
      <AnimatePresence>
        {trips.map((t) => {
          const cover = (t.images && t.images[0]) ? t.images[0] : "";
          const imgSrc = cover || FALLBACK;
          return (
            <motion.div
              key={t.id}
              variants={item}
              whileHover={{ y: -4, scale: 1.01 }}
              className="card overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden bg-[#0f0f0f]">
                <motion.img
                  src={imgSrc}
                  alt={t.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => (e.currentTarget.src = FALLBACK)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gold">{t.title}</h3>
                <p className="text-gray-400">{t.location}</p>
                <p className="mt-2 text-gold-light font-bold">${t.price}</p>
                <div className="flex items-center gap-2 pt-4">
                  <Link to={`/trip/${t.id}`} className="btn-ghost">View</Link>
                  <Link to={`/trip/${t.id}`} className="btn-gold">Book</Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

function ReviewsGrid({ reviews = [], avgRating = "5.0" }) {
  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 -mt-4">
        {reviews.map((r, idx) => (
          <motion.div
            key={r.id ?? idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            viewport={{ once: true }}
            className="bg-[#0f0f0f] p-5 rounded-2xl border border-[#D4AF37]/10 shadow-lg relative"
          >
            <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#D4AF37]/60 to-[#FFD700]/60 rounded-l-2xl" />
            <div className="font-semibold text-gold">{r.name || "Guest"}</div>
            <div className="text-[#FFD700] text-sm">{"★".repeat(r.rating || 5)}</div>
            <p className="text-gray-300 leading-relaxed mt-2">“{r.comment}”</p>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-8">
        <div className="inline-block bg-[#0f0f0f]/70 border border-[#D4AF37]/20 rounded-2xl px-6 py-4 mb-4">
          <div className="text-3xl font-bold text-gold-light">{avgRating}/5</div>
          <div className="text-gray-400 text-sm">Based on {reviews.length} reviews</div>
        </div>
      </div>
    </>
  );
}

function GalleryGrid({ images = [] }) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 -mt-4">
      {images.map((img, i) => {
        const src = pickImage(img) || FALLBACK;
        return (
          <motion.div
            key={`${src}-${i}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-[#0f0f0f] relative"
          >
            <img
              src={src}
              alt={`Gallery ${i + 1}`}
              className="w-full h-56 object-cover group-hover:scale-105 transition"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = FALLBACK)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function MapBlock({ mapSrc }) {
  if (!mapSrc) {
    return (
      <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0f0f0f] p-8 text-center text-gray-400">
        Map coming soon
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#0f0f0f] -mt-4">
      <iframe
        title="Google Maps"
        src={mapSrc}
        width="100%"
        height="420"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="col-span-full text-center text-gray-400 py-16 border border-dashed border-[#D4AF37]/20 rounded-xl">
      {text}
    </div>
  );
}

function Secondary({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-3 rounded-full border transition border-[#D4AF37]/40 hover:bg-[#D4AF37]/10"
    >
      {children}
    </button>
  );
}
