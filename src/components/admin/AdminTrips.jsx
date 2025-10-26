// src/pages/admin/AdminTrips.jsx
import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminService"; // or listTrips admin endpoint
import EmptyState from "../../components/EmptyState";
import { FilePlus2, MapPinned } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // TODO: replace with admin list trips endpoint
        const stats = await getDashboardStats();
        setTrips(stats?.trips || []); // fallback mock shape
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading trips…</div>;

  if (!trips.length) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<MapPinned size={36} />}
          title="No trips yet"
          subtitle="Create your first trip listing to start accepting reservations."
          cta={<><FilePlus2 size={16} /> Create Trip</>}
          onCta={() => navigate("/admin/trips/new")}
        />
      </div>
    );
  }

  return (
    <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* render your admin trip cards here */}
      {trips.map((t) => (
        <div key={t.id} className="card p-4">
          <div className="text-gold font-semibold">{t.title}</div>
          <div className="text-gray-400">{t.location}</div>
        </div>
      ))}
    </div>
  );
}
