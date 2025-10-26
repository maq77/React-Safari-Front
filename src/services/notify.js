import { useNotifyStore } from "../store/useNotifyStore";
export const notify = {
  success: (title, message="") => useNotifyStore.getState().push({ title, message, type: "success" }),
  error:   (title, message="") => useNotifyStore.getState().push({ title, message, type: "error" }),
  info:    (title, message="") => useNotifyStore.getState().push({ title, message, type: "info" }),
};
