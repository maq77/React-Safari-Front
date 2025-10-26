// src/pages/admin/Reservations.jsx
import React, { useEffect, useState } from "react";
import { listBookings } from "../../services/adminService";
import EmptyState from "../../components/EmptyState";
import { CalendarX2, CalendarCheck2 } from "lucide-react";

export default function Reservations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listBookings();
        setBookings(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading reservations…</div>;

  if (!bookings.length) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<CalendarX2 size={36} />}
          title="No reservations yet"
          subtitle="Bookings will appear here as soon as customers reserve trips."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {bookings.map((b) => (
        <div key={b.id} className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-gold font-semibold">{b.name}</div>
            <div className="text-gray-400 text-sm">{b.tripName}</div>
          </div>
          <div className="text-gold-light font-bold">${b.totalPrice}</div>
          <CalendarCheck2 className="text-gold" />
        </div>
      ))}
    </div>
  );
}
