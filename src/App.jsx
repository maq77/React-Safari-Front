// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

const HomeStack    = lazy(() => import("./pages/Homestack"));
const Trips        = lazy(() => import("./pages/Trips"));
const TripDetails  = lazy(() => import("./pages/TripDetails"));

const AdminGate      = lazy(() => import("./pages/admin/AdminGate"));
const AdminTrips     = lazy(() => import("./pages/admin/AdminTrips"));
const CreateTrip     = lazy(() => import("./pages/admin/CreateTrip"));
const Reservations   = lazy(() => import("./pages/admin/Reservations"));

const BookingModal   = lazy(() => import("./components/BookingModal"));
import CelebrationOverlay from "./components/CelebrationOverlay";

function Fallback() {
  return <div className="p-4 text-gray-400">Loading…</div>;
}

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeStack />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="*" element={<div className="p-6">Not Found</div>} />
        </Route>

        {/* ADMIN (DO NOT GUARD THE PARENT) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminGate />} />
          <Route
            path="trips"
            element={
              <ProtectedRoute>
                <AdminTrips />
              </ProtectedRoute>
            }
          />
          <Route
            path="trips/new"
            element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            }
          />
          <Route
            path="reservations"
            element={
              <ProtectedRoute>
                <Reservations />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Optional legacy redirect */}
        <Route path="/home" element={<Navigate to="/" replace />} />
      </Routes>

      {/*  Render once so it can open from any page */}
      <BookingModal />
      <CelebrationOverlay />
    </Suspense>
  );
}
