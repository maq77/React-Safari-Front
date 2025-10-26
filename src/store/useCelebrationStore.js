// src/store/useCelebrationStore.js
import { create } from "zustand";
export const useCelebrationStore = create((set) => ({
  active: false,
  fire: (ms = 2500) => {
    set({ active: true });
    setTimeout(() => set({ active: false }), ms);
  },
}));
