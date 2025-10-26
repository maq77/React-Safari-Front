// src/pages/Trips.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTrips } from "../services/tripService";
import { useTripStore } from "../store/useTripStore";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/EmptyState";
import { MapPinned } from "lucide-react";

// ---------- Helpers to fix image URLs ----------
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
const FALLBACK =
  "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1600&auto=format&fit=crop";

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
function coverImage(trip) {
  const imgs = (trip?.images || trip?.Images || []).map(pickImage).filter(Boolean);
  return imgs[0] || FALLBACK;
}
function priceText(trip) {
  const p = trip?.price ?? trip?.startingPrice ?? 0;
  return Number.isFinite(p) ? `$${p}` : "$—";
}
// ----------------------------------------------

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const openModal = useTripStore((s) => s.openModal);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getTrips();
        const list = Array.isArray(data) ? data : data?.items ?? [];
        // normalize images to absolute URLs up front (optional but nice)
        const normalized = list.map((t) => ({
          ...t,
          images: (t.images || t.Images || []).map(pickImage).filter(Boolean),
        }));
        if (mounted) setTrips(normalized);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to fetch trips");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const hasTrips = useMemo(() => trips && trips.length > 0, [trips]);

  if (loading) {
    return (
      <div className="p-6 grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden animate-pulse">
            <div className="h-48 bg-[#111111]" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-2/3 bg-[#111111]" />
              <div className="h-4 w-1/3 bg-[#111111]" />
              <div className="h-4 w-1/2 bg-[#111111]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-400">{error}</div>;

  if (!hasTrips) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<MapPinned size={36} />}
          title="No trips yet"
          subtitle="Please check back soon—new adventures are on the way!"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 grid md:grid-cols-3 sm:grid-cols-2 gap-6"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.06 }}
    >
      <AnimatePresence>
        {trips.map((trip) => {
          const img = coverImage(trip);
          const price = priceText(trip);
          const id = trip.id || trip.tripId;

          // normalize images for booking modal (ensure array of absolute urls)
          const modalImages =
            Array.isArray(trip.images) && trip.images.length
              ? trip.images.map((x) => (typeof x === "string" ? resolveSrc(x) : pickImage(x)))
              : [img];

          return (
            <motion.div
              key={id}
              variants={item}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 280, damping: 20, mass: 0.7 }}
              className="group card overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden bg-[#0f0f0f]">
                <motion.img
                  src={img}
                  alt={trip.title || trip.name || "Trip"}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => (e.currentTarget.src = FALLBACK)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold text-gold">
                  {trip.title || trip.name || "Untitled Trip"}
                </h2>
                <p className="text-gray-400">{trip.location || trip.city || "—"}</p>
                <p className="mt-2 text-gold-light font-bold">{price}</p>

                <div className="flex items-center gap-2 pt-4">
                  <Link to={`/trip/${id}`} className="btn-ghost">
                    View
                  </Link>
                  <button
                    className="btn-gold"
                    onClick={() =>
                      openModal({
                        id,
                        name: trip.title || trip.name,
                        price: trip.price ?? trip.startingPrice ?? 0,
                        maxGuests: trip.maxGuests ?? 10,
                        images: modalImages,
                        type: trip.type || "tour",
                        rating: trip.rating || 4.8,
                        description: trip.description || "",
                        difficulty: trip.difficulty || "easy",
                        duration: trip.duration || "Half day",
                        whatsappNumber: trip.whatsappNumber, // pass through for WA redirect
                      })
                    }
                  >
                    Book
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
