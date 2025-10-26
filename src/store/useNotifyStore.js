import { create } from "zustand";

let idSeq = 1;

export const useNotifyStore = create((set, get) => ({
  toasts: [],
  // type: 'success' | 'error' | 'info'
  push: ({ title, message = "", type = "info", duration = 3500 }) => {
    const id = idSeq++;
    const toast = { id, title, message, type };
    set({ toasts: [...get().toasts, toast] });
    // auto-dismiss
    setTimeout(() => get().dismiss(id), duration);
    return id;
  },
  dismiss: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },
}));
