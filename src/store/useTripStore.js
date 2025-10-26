// src/store/useTripStore.js
import { create } from "zustand";
import { getTrips, getTripById } from "../services/tripService";

export const useTripStore = create((set, get) => ({
  trips: [],
  loading: false,
  error: null,

  // modal state
  modalTrip: null,
  selectedTrip: null,
  isModalOpen: false,

  // UI actions
  openModal: (trip) => set({ modalTrip: trip, selectedTrip: trip, isModalOpen: true }),
  closeModal: () => set({ modalTrip: null, isModalOpen: false }), // 👈 fixed typo here

  // Data actions
  fetchTrips: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getTrips();
      set({ trips: data, loading: false });
    } catch (e) {
      set({ error: e?.message || "Failed to load trips", loading: false });
    }
  },

  fetchTrip: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await getTripById(id);
      set({ selectedTrip: data, loading: false });
    } catch (e) {
      set({ error: e?.message || "Failed to load trip", loading: false });
    }
  },
}));

export default useTripStore;
