// src/services/adminService.js
import { rest } from "./adminrest";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ---- Dashboard ----
export async function getDashboardStats() {
  return await rest.get("/admin/stats");
}

// ---- Bookings ----
export async function listBookings() {
  return await rest.get("/admin/bookings");
}
export async function listBookingsAll() {
  return await rest.get("/admin/bookings");
}
export async function listBookingsBooked() {
  return await rest.get("/admin/bookings/booked");
}
export async function listBookingsUnbooked() {
  return await rest.get("/admin/bookings/unbooked");
}
export async function setBookingStatus(id, isBooked) {
  return await rest.put(`/admin/bookings/${id}/status`, { isBooked });
}

// Reviews 
export async function listReviewsAdmin() {
  return await rest.get("/admin/reviews");
}
export async function deleteReview(id) {
  return await rest.del(`/admin/reviews/${id}`);
}
export async function approveReview(id, approve=true) {
  return await rest.put(`/admin/reviews/${id}/approve`, { approve });
}

// ---- Trips (admin) ----
export async function listTripsAdmin() {
  return await rest.get("/admin/trips");
}
export async function getTripAdmin(id) {
  return await rest.get(`/admin/trips/${id}`);
}

// JSON create/update (kept for non-image edits if you want)
export async function createTrip(trip) {
  return await rest.post("/admin/trips", trip);
}
export async function updateTrip(id, trip) {
  return await rest.put(`/admin/trips/${id}`, trip);
}

// MULTIPART create: TripJson + Images[]
export async function createTripMultipart(tripDto, files) {
  const fd = new FormData();
  fd.append("TripJson", JSON.stringify(tripDto));
  (files || []).forEach((f) => fd.append("Images", f));
  // IMPORTANT: use the multipart endpoint
  return await rest.post("/admin/trips/multipart", fd);
}

// MULTIPART update: TripJson + Images[] (replaces images if any provided)
export async function updateTripMultipart(id, tripDto, files) {
  const fd = new FormData();
  fd.append("TripJson", JSON.stringify(tripDto));
  (files || []).forEach((f) => fd.append("Images", f));
  return await rest.put(`/admin/trips/multipart/${id}`, fd);
}

export async function deleteTrip(id) {
  return await rest.del(`/admin/trips/${id}`);
}

// ---- (Optional) Legacy Upload (only if you still had /upload/images) ----
export async function uploadImages(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const { data } = await api.post("/upload/images", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
