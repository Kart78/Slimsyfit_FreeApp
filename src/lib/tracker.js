const prefix = "slimsyfit-freeapp:v1:";
export const defaultProfile = {
  name: "", age: "", activity: "Lightly active", diet: "Any",
  weightUnit: "kg", heightCm: "", targetWeight: "", fastingHours: 12,
  waterGoalMl: 2000, sleepGoal: 8, activityGoal: 30
};
export const createEmptyData = () => ({
  profile: { ...defaultProfile },
  days: {},
  fasting: { activeStart: null, completed: [] }
});
export const localDay = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
};
export const blankDay = () => ({
  waterMl: 0, sleepHours: null, weight: null, meals: [], activity: [],
  habits: { nutrition: false, water: false, movement: false, sleep: false }
});
export const normalizeData = data => ({
  profile: { ...defaultProfile, ...(data?.profile || {}) },
  days: data?.days && typeof data.days === "object" ? data.days : {},
  fasting: {
    activeStart: data?.fasting?.activeStart || null,
    completed: Array.isArray(data?.fasting?.completed) ? data.fasting.completed : []
  }
});
export function loadLocal(identity = "guest") {
  try { return normalizeData(JSON.parse(localStorage.getItem(prefix + identity))); }
  catch { return createEmptyData(); }
}
export function saveLocal(identity, data) {
  try { localStorage.setItem(prefix + identity, JSON.stringify(normalizeData(data))); }
  catch { /* Storage may be blocked or full; in-memory changes remain available. */ }
}
export function entryCount(data) {
  return Object.values(data.days).filter(d => dayHasEntry(d)).length;
}
export function dayHasEntry(d) {
  return Boolean(
    (d?.waterMl || 0) > 0 || Number(d?.sleepHours) > 0 ||
    d?.weight != null || (d?.meals?.length || 0) > 0 ||
    (d?.activity?.length || 0) > 0 || Object.values(d?.habits || {}).some(Boolean)
  );
}
export function levelInfo(data) {
  const count = entryCount(data);
  if (count >= 21) return { name: "Lifestyle", count, nextAt: null, progress: 100 };
  if (count >= 7) return { name: "Building the Habit", count, nextAt: 21, progress: Math.min(100, Math.round((count - 7) / 14 * 100)) };
  return { name: "Newbie", count, nextAt: 7, progress: Math.min(100, Math.round(count / 7 * 100)) };
}
export function earnedBadges(data) {
  const count = entryCount(data);
  return Array.from({ length: 10 }, (_, i) => (i + 1) * 10)
    .filter(n => n <= count).map(n => ({ count: n, title: n === 100 ? "Legendary Consistency" : n === 50 ? "Halfway Hero" : n === 10 ? "First Milestone" : n + "-Day Milestone" }));
}
export function rangeDates(endDate, numDays) {
  const base = new Date(endDate + "T12:00:00");
  return Array.from({length:numDays},(_,i)=>{
    const d = new Date(base); d.setDate(base.getDate() - (numDays - i - 1)); return localDay(d);
  });
}
export function weeklyWaterMl(data, date) {
  return rangeDates(date, 7).map(d=>({date:d,ml:Number(data.days[d]?.waterMl)||0}));
}
export function safeMl(value) { return Math.min(12000, Math.max(0, Math.round(Number(value) || 0))); }
export function safeNumber(value, max = 100000) {
  if (value === "" || value == null) return null;
  const n = Number(value); return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
}
export function toClock(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map(x=>String(x).padStart(2,"0")).join(":");
}