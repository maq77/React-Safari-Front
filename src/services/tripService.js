import { api } from "./apiClient";

// GET /trips
export async function getTrips(params = {}) {
  const { data } = await api.get("/trips", { params });
  return data;
}

// GET /trips/{id}
export async function getTripById(id) {
  const { data } = await api.get(`/trips/${id}`);
  return data;
}

// Public booking endpoint: POST /api/trips/book/{tripId}
export async function bookTrip(tripId, payload) {
  const { data } = await api.post(`/book/${tripId}`, payload);
  return data;
}


// ----  Reviews Public ----
export async function getReviews() {
  const { data } = await api.get("/reviews");
  return data;
}

export async function postReview(payload) {
  const { data } = await api.post("/reviews", payload);
  return data;
}




// POST /bookings
// Frontend accepts a friendly payload and we map it to BookingDTO here:
export async function postBooking(payload) {
  // payload expected from UI:
  // { tripId, customerName, customerEmail, customerPhone, whatsappNumber,
  //   numberOfAdults, numberOfChildren, preferredDate, notes }

  const dto = {
    TripId: payload.tripId,
    CustomerName: payload.customerName,
    CustomerEmail: payload.customerEmail,
    CustomerPhone: payload.customerPhone || "",
    WhatsappNumber: payload.whatsappNumber || "",
    NumberOfAdults: Number(payload.numberOfAdults || 1),
    NumberOfChildren: Number(payload.numberOfChildren || 0),
    PreferredDate: payload.preferredDate, // ISO string "YYYY-MM-DD" or full ISO
    Notes: payload.notes || "",
  };

  const { data } = await api.post("/bookings", dto);
  return data;
}
