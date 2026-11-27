// Meal photos are stored on this device only (IndexedDB) — never uploaded or synced.
const DB = "slimsyfit-freeapp-photos", STORE = "meal-photos";

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("Photo storage isn't available in this browser.")); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Couldn't open photo storage."));
  });
}
async function tx(mode, op) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode), req = op(t.objectStore(STORE));
    t.oncomplete = () => { db.close(); resolve(req.result); };
    t.onerror = () => { db.close(); reject(t.error || new Error("Photo storage error.")); };
    t.onabort = () => { db.close(); reject(t.error || new Error("Not enough storage on this device.")); };
  });
}
const key = (identity, mealId) => (identity || "guest") + ":" + mealId;
export const getMealPhoto = (identity, mealId) => tx("readonly", s => s.get(key(identity, mealId)));
export const putMealPhoto = (identity, mealId, dataUrl) => tx("readwrite", s => s.put(dataUrl, key(identity, mealId)));
export const deleteMealPhoto = (identity, mealId) => tx("readwrite", s => s.delete(key(identity, mealId)));

/** Downscale an image file to a JPEG data URL (keeps storage small). */
export function shrinkImage(file, max = 640, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type || "image/")) { reject(new Error("Please choose an image file.")); return; }
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file couldn't be read as an image.")); };
    img.src = url;
  });
}
