const prefix = "slimsyfit-freeapp:v1:";
export const defaultProfile = {
  name: "", age: "", activity: "Lightly active", diet: "Any",
  weightUnit: "kg", heightCm: "", targetWeight: "", fastingHours: 12,
  waterGoalMl: 2000, sleepGoal: 8, activityGoal: 30, stepGoal: 8000,
  reminders: { water: false, meals: false, checkin: false }
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
  profile: {
    ...defaultProfile, ...(data?.profile || {}),
    reminders: { ...defaultProfile.reminders, ...(data?.profile?.reminders || {}) }
  },
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
    (d?.waterMl || 0) > 0 || Number(d?.sleepHours) > 0 || Number(d?.steps) > 0 || d?.mood != null ||
    d?.weight != null || (d?.meals?.length || 0) > 0 ||
    (d?.activity?.length || 0) > 0 || Object.values(d?.habits || {}).some(Boolean)
  );
}
export function weightEntryCount(data) {
  // Match original SlimSyFit: commitment milestones use actual weight-log entries,
  // not simulated days, water taps or other session-only activity.
  return Object.values(data.days || {}).filter(day => day?.weight != null && Number(day.weight) > 0).length;
}
export function levelInfo(data) {
  const count = weightEntryCount(data);
  if (count >= 30) return { name:"Lifestyle", count, nextAt:null, progress:100 };
  if (count >= 7) return { name:"Building the Habit", count, nextAt:30,
    progress:Math.min(100, Math.round((count - 7) / 23 * 100)) };
  return { name:"Newbie", count, nextAt:7,
    progress:Math.min(100, Math.round(count / 7 * 100)) };
}
export function earnedBadges(data) {
  const count = weightEntryCount(data);
  return Array.from({ length:10 }, (_,i)=>(i+1)*10)
    .filter(n=>n<=count)
    .map(n=>({count:n, title:n===100?"Legendary!":n===50?"Halfway There!":n===10?"Great Start!":n+" Entries"}));
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
const LB_PER_KG = 2.20462262;
/** Convert a weight between kg and lbs, rounded to 0.1. Returns null for invalid input. */
export function convertWeight(value, from, to) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (from === to) return n;
  const out = from === "kg" ? n * LB_PER_KG : n / LB_PER_KG;
  return Math.round(out * 10) / 10;
}
/** Convert a free-text weight like "180 lbs" to the target unit, keeping text form. */
export function convertWeightText(text, to) {
  const m = String(text ?? "").trim().match(/^([\d.]+)\s*(kg|lbs|lb)?$/i);
  if (!m) return text;
  const from = (m[2] || to).toLowerCase().startsWith("lb") ? "lbs" : "kg";
  const v = convertWeight(m[1], from, to);
  return v == null ? text : v + " " + to;
}
/** Switch every stored weight (daily logs + profile weights) to a new unit. */
export function changeWeightUnit(data, to) {
  const from = data.profile.weightUnit || "kg";
  if (from === to) return data;
  const days = {};
  for (const [k, d] of Object.entries(data.days || {})) {
    days[k] = d?.weight != null ? { ...d, weight: convertWeight(d.weight, from, to) } : d;
  }
  return {
    ...data, days,
    profile: {
      ...data.profile, weightUnit: to,
      currentWeight: convertWeightText(data.profile.currentWeight, to),
      targetWeight: convertWeightText(data.profile.targetWeight, to)
    }
  };
}
export function activityMinutes(day) {
  return (day?.activity || []).reduce((n, a) => n + (Number(a.minutes) || 0), 0);
}
export const MOODS = [
  { v: 1, emoji: "😞", label: "Bad" }, { v: 2, emoji: "😕", label: "Meh" },
  { v: 3, emoji: "😐", label: "OK" }, { v: 4, emoji: "🙂", label: "Good" },
  { v: 5, emoji: "😄", label: "Great" }
];
export function moodHistory(data, endDate, numDays = 7) {
  return rangeDates(endDate, numDays).map(date => ({ date, mood: data.days[date]?.mood || null }));
}
/** Reminder schedule (local time) mirroring the original SlimSyFit notification times. */
export function reminderSchedule(reminders = {}) {
  const out = [];
  if (reminders.water) for (let h = 9; h <= 19; h += 2) out.push({ h, m: 0, title: "💧 Time to hydrate", body: "Drink a glass of water" });
  if (reminders.meals) out.push(
    { h: 8, m: 0, title: "🥣 Breakfast time", body: "Start your day right" },
    { h: 12, m: 30, title: "🥗 Lunch time", body: "Log your midday meal" },
    { h: 18, m: 30, title: "🍽️ Dinner time", body: "Don't forget to log dinner" });
  if (reminders.checkin) out.push({ h: 21, m: 0, title: "📝 Daily check-in", body: "How did today go?" });
  return out;
}
