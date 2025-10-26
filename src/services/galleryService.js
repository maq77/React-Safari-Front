// src/services/galleryService.js
const KEY = "admin.gallery.items";
const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function saveLocal(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}
export function listGallery() {
  return loadLocal();
}
export function upsertGallery(item) {
  const items = loadLocal();
  if (item.id) {
    const idx = items.findIndex(x => x.id === item.id);
    if (idx >= 0) items[idx] = { ...items[idx], ...item };
    else items.push(item);
  } else {
    const id = Math.max(0, ...items.map(x => x.id || 0)) + 1;
    items.push({ ...item, id });
  }
  return saveLocal(items);
}
export function deleteGallery(id) {
  const items = loadLocal().filter(x => x.id !== id);
  return saveLocal(items);
}

// Upload to /api/upload/images (returns [{ ImageUrl, FileName }])
export async function uploadGalleryFiles(files) {
  const fd = new FormData();
  files.forEach(f => fd.append("files", f));
  const res = await fetch(`${API}/upload/images`, {
    method: "POST",
    body: fd
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  // normalize to { url }
  return (data || []).map(x => ({ url: x.ImageUrl || x.imageUrl || x.url }));
}
