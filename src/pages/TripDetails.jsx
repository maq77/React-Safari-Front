// src/pages/TripDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";

import { getTripById } from "../services/tripService";
import ImageCarousel from "../components/ImageCarousel";
import { useTripStore } from "../store/useTripStore";

const FALLBACK =
  "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1600&auto=format&fit=crop";

// If VITE_API_URL ends with /api, trim it so /uploads/... becomes https://host/uploads/...
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

function resolveSrc(u) {
  if (!u) return FALLBACK;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return u;
}

function toCarouselImages(images) {
  if (!Array.isArray(images) || images.length === 0) return [{ url: FALLBACK }];
  return images.map((img) => {
    const raw = typeof img === "string" ? img : img?.imageUrl || img?.ImageUrl;
    return { url: resolveSrc(raw) || FALLBACK };
  });
}

function cover(trip) {
  const arr = toCarouselImages(trip?.images);
  return arr[0]?.url || FALLBACK;
}

function fmtTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return "—";
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function digitsOnly(s) {
  return (s || "").replace(/[^\d]/g, "");
}

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const openModal = useTripStore((s) => s.openModal);

  const globalPhone = import.meta.env.VITE_CONTACT_PHONE || "";
  const globalWhats = import.meta.env.VITE_WHATSAPP_NUMBER || "";
  const brand = import.meta.env.VITE_BRAND_NAME || "Our Team";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getTripById(id);
        if (mounted) setTrip(data);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load trip");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const images = useMemo(() => toCarouselImages(trip?.images), [trip]);
  const title = trip?.title || trip?.name || "Untitled Trip";
  const price = trip?.price ?? trip?.startingPrice ?? 0;

  const contactPhone = trip?.contactPhone || globalPhone;
  const whatsappNumber = trip?.whatsappNumber || globalWhats;
  const waPhone = digitsOnly(whatsappNumber);
  const waText = encodeURIComponent(
    `Hello ${brand}, I'm interested in "${title}" (Trip #${trip?.id ?? id}).`
  );
  const waHref = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : null;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6">
        <div className="card overflow-hidden animate-pulse">
          <div className="h-72 bg-[#111]" />
          <div className="p-6 space-y-3">
            <div className="h-6 w-1/2 bg-[#111]" />
            <div className="h-4 w-1/3 bg-[#111]" />
            <div className="h-4 w-2/3 bg-[#111]" />
          </div>
        </div>
      </div>
    );
  }
  if (err) return <div className="text-center mt-10 text-red-400">{err}</div>;
  if (!trip) return <div className="text-center mt-10">Trip not found.</div>;

  return (
    <div className="max-w-5xl mx-auto mt-4 sm:mt-8 p-0">
      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        {/* Hero */}
        <motion.div
          className="relative h-64 sm:h-72 w-full overflow-hidden"
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
        >
          <motion.img
            src={cover(trip)}
            alt={title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {trip?.type && (
            <motion.div
              className="absolute bottom-3 left-3 badge-gold capitalize"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {trip.type}
            </motion.div>
          )}
        </motion.div>

        {/* Header strip (mobile-friendly) */}
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gold">{title}</h1>
            {trip?.location && (
              <p className="text-gray-400 mt-1 text-sm sm:text-base">📍 {trip.location}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">From</div>
            <div className="text-2xl sm:text-3xl font-bold text-gold-light">${price}</div>
          </div>
        </div>

        {/* Carousel */}
        <motion.div
          className="px-4 sm:px-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ImageCarousel images={images} />
        </motion.div>

        {/* Details */}
        <div className="p-4 sm:p-6">
          <div className="grid md:grid-cols-5 gap-6">
            {/* Left: description & hours */}
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {trip?.description && (
                <p className="text-gray-300 leading-relaxed">{trip.description}</p>
              )}

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="card p-3">
                  <div className="text-gray-400">Start</div>
                  <div className="font-semibold text-gold">{fmtTime(trip?.startDate)}</div>
                </div>
                <div className="card p-3">
                  <div className="text-gray-400">End</div>
                  <div className="font-semibold text-gold">{fmtTime(trip?.endDate)}</div>
                </div>
                <div className="card p-3">
                  <div className="text-gray-400">Duration</div>
                  <div className="font-semibold text-gold">
                    {/* If you want exact hours, compute diff; for now show “Half day”/fallback */}
                    {trip?.duration || "Half day"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: contact & booking */}
            <motion.div
              className="md:col-span-2 space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Contact */}
              <div className="card p-4">
                <h3 className="text-lg font-semibold text-gold mb-3">Contact</h3>
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="btn-ghost w-full mb-2 flex items-center justify-center gap-2"
                  >
                    <Phone size={18} /> {contactPhone}
                  </a>
                )}
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-gold w-full flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                )}
              </div>

              {/* Booking CTA */}
              <div className="card p-4">
                <h3 className="text-lg font-semibold text-gold mb-3">Ready to Book?</h3>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="btn-gold w-full"
                  onClick={() =>
                    openModal({
                      id: trip?.id || Number(id),
                      name: title,
                      price,
                      maxGuests: trip?.maxGuests ?? 10,
                      images: images.map((i) => i.url),
                      type: trip?.type || "tour",
                      rating: trip?.rating || 4.8,
                      description: trip?.description || "",
                      difficulty: trip?.difficulty || "easy",
                      duration: trip?.duration || "Half day",
                      contactPhone,
                      whatsappNumber,
                    })
                  }
                >
                  Book Now
                </motion.button>
                <Link to="/trips" className="btn-ghost w-full text-center mt-2">
                  Back to Trips
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
