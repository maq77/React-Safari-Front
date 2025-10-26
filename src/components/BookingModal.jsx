// src/components/BookingModal.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Calendar, User, Users, Phone, Mail, MessageSquare, CheckCircle, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

import { useTripStore } from "../store/useTripStore";
import { useCelebrationStore } from "../store/useCelebrationStore";
import { bookTrip } from "../services/tripService";
import { notify } from "../services/notify";

function normalizeDigits(s) { return (s || "").replace(/[^\d]/g, ""); }

export default function BookingModal() {
  const trip = useTripStore((s) => s.modalTrip);
  const isOpen = useTripStore((s) => s.isModalOpen);
  const close = useTripStore((s) => s.closeModal);
  const fireConfetti = useCelebrationStore((s) => s.fire);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    adults: 1,
    children: 0,
    date: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null); // { id, date, name, waLink }

  const canSubmit = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.phone.trim() && form.date && !submitting;
  }, [form, submitting]);

  if (!isOpen || !trip) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      // 1) post reservation
      const payload = {
        TripId: trip.id,
        CustomerName: form.name,
        CustomerEmail: form.email,
        CustomerPhone: form.phone,
        WhatsappNumber: form.whatsapp || form.phone,
        NumberOfAdults: Number(form.adults) || 1,
        NumberOfChildren: Number(form.children) || 0,
        PreferredDate: form.date, // ISO (yyyy-mm-dd)
        Notes: form.notes,
      };
      const created = await bookTrip(trip.id, payload);

      // 2) build WhatsApp url with details
      const waNumber = normalizeDigits(trip.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || "");
      const txt = [
        `Booking request for "${trip.name}" (Trip #${trip.id})`,
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `Adults: ${form.adults}`,
        `Children: ${form.children}`,
        `Preferred date: ${form.date}`,
        form.notes ? `Notes: ${form.notes}` : null,
      ].filter(Boolean).join("\n");
      const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(txt)}` : null;

      // 3) toast + confetti + success state
      notify.success?.("Thanks for booking with us!", "We’ll contact you shortly to confirm.");
      fireConfetti(2600);
      setSuccess({
        id: created?.id || undefined,
        date: form.date,
        name: form.name,
        waLink,
      });

      // 4) open WhatsApp in a new tab (if number available)
      if (waLink) {
        window.open(waLink, "_blank", "noopener,noreferrer");
      } else {
        notify.info?.("WhatsApp not set", "We saved your booking and will contact you by email/phone.");
      }

      // reset form for next time
      setForm({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        adults: 1,
        children: 0,
        date: "",
        notes: "",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Could not place reservation";
      notify.error?.("Booking failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const closeAll = () => {
    setSuccess(null);
    //setTimeout(() => closeAll(), 2200);
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
          onClick={success ? undefined : close}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-0 left-0 right-0 md:static md:mx-auto md:my-16
                       w-full md:w-[720px] bg-slate-900 text-white rounded-t-2xl md:rounded-2xl
                       border border-slate-700 shadow-2xl"
            role="dialog"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div>
                {!success ? (
                  <>
                    <div className="text-sm text-gray-400">Booking</div>
                    <h3 className="text-lg md:text-xl font-semibold text-gold">{trip.name}</h3>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-gray-400">Success</div>
                    <h3 className="text-lg md:text-xl font-semibold text-gold">Thanks for booking with us!</h3>
                  </>
                )}
              </div>
              <button
                className="p-2 rounded-lg hover:bg-white/10"
                onClick={closeAll}
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            {/* BODY */}
            {!success ? (
              <form onSubmit={onSubmit} className="p-4 space-y-4 max-h-[72vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-3">
                  <Field icon={<User size={14} />} label="Full name *">
                    <input
                      required
                      disabled={submitting}
                      className="input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </Field>
                  <Field icon={<Mail size={14} />} label="Email *">
                    <input
                      type="email"
                      required
                      disabled={submitting}
                      className="input"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Field icon={<Phone size={14} />} label="Phone *">
                    <input
                      required
                      disabled={submitting}
                      className="input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </Field>
                  <Field icon={<MessageSquare size={14} />} label="WhatsApp (optional)">
                    <input
                      disabled={submitting}
                      className="input"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <Field icon={<Users size={14} />} label="Adults">
                    <input
                      type="number"
                      min="1"
                      disabled={submitting}
                      className="input"
                      value={form.adults}
                      onChange={(e) => setForm({ ...form, adults: e.target.value })}
                    />
                  </Field>
                  <Field icon={<Users size={14} />} label="Children">
                    <input
                      type="number"
                      min="0"
                      disabled={submitting}
                      className="input"
                      value={form.children}
                      onChange={(e) => setForm({ ...form, children: e.target.value })}
                    />
                  </Field>
                  <Field icon={<Calendar size={14} />} label="Preferred date *">
                    <input
                      type="date"
                      required
                      disabled={submitting}
                      className="input"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Notes">
                  <textarea
                    rows={3}
                    disabled={submitting}
                    className="input"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={closeAll} className="btn-ghost flex-1" disabled={submitting}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold flex-1 disabled:opacity-60"
                    disabled={!canSubmit}
                  >
                    {submitting ? "Booking…" : "Confirm & Continue to WhatsApp"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 text-center">
                <div className="grid place-items-center gap-2 mb-4">
                  <CheckCircle className="text-green-400" size={40} />
                  <h4 className="text-xl font-semibold text-gold">Thanks for booking with us!</h4>
                  <p className="text-gray-300">
                    We received your request for <span className="text-gold font-medium">{trip.name}</span>.
                  </p>
                  {success.date && (
                    <p className="text-gray-400 text-sm">Preferred date: {success.date}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {success.waLink ? (
                    <a
                      href={success.waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-gold inline-flex items-center justify-center gap-2"
                      onClick={closeAll}
                    >
                      Chat on WhatsApp <ArrowRight size={16} />
                    </a>
                  ) : null}
                  <Link to="/trips" onClick={closeAll} className="btn-ghost inline-flex items-center justify-center">
                    View more trips
                  </Link>
                </div>

                <div className="mt-5">
                  <button onClick={closeAll} className="btn-ghost">Close</button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-gray-300 flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="relative">
        {React.cloneElement(children, {
          className:
            (children.props.className || "") +
            " w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500",
        })}
      </div>
    </label>
  );
}
