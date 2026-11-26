import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, Trash2, Camera, Footprints, Play, Square, X, Bell } from "lucide-react";
import { activityMinutes, MOODS, moodHistory, reminderSchedule, safeNumber } from "./lib/tracker.js";
import "./extra-pages.css";

const A = "/assets/slimsyfit";
const QUICK = [
  { label: "Walking", mins: 10, gif: "walking", bg: "#EAF8EE" },
  { label: "Running", mins: 15, gif: "running", bg: "#FFF4E8" },
  { label: "Cycling", mins: 20, gif: "cycling", bg: "#EDF7FE" },
  { label: "Strength", mins: 20, gif: "strength", bg: "#F3F1FF" },
  { label: "Stretching", mins: 10, gif: "stretching", bg: "#FDF0F5" }
];
const dayLabel = date => new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });

function Header({ title, subtitle, onBack }) {
  return <div className="sf-page-header">
    {onBack && <button aria-label="Back" className="sf-back" onClick={onBack}><ArrowLeft size={18}/></button>}
    <div><h1>{title}</h1>{subtitle && <small>{subtitle}</small>}</div>
  </div>;
}

/* ───────── Activity page: live steps (foreground) + manual minutes ───────── */
export function ActivityView({ data, today, updateDay, onBack }) {
  const p = data.profile, day = data.days[today] || {};
  const goal = Number(p.activityGoal) || 30, stepGoal = Number(p.stepGoal) || 8000;
  const minutes = activityMinutes(day);
  const [steps, setSteps] = useState(Number(day.steps) || 0);
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState("");
  const [manualSteps, setManualSteps] = useState("");
  const [custom, setCustom] = useState({ name: "Walking", minutes: "" });
  const stepsRef = useRef(steps), savedRef = useRef(steps), smooth = useRef(9.8), lastPeak = useRef(0);

  // Keep in sync when the saved day changes (e.g. another tab, date rollover).
  useEffect(() => { if (!tracking) { setSteps(Number(day.steps) || 0); stepsRef.current = Number(day.steps) || 0; savedRef.current = stepsRef.current; } }, [day.steps, today]);
  const flush = () => {
    if (stepsRef.current !== savedRef.current) {
      const n = stepsRef.current; savedRef.current = n;
      updateDay(today, d => ({ ...d, steps: n }));
    }
  };
  useEffect(() => {
    if (!tracking) return;
    const onMotion = e => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      smooth.current = smooth.current * .82 + mag * .18;
      const now = Date.now();
      if (Math.abs(mag - smooth.current) > 1.15 && now - lastPeak.current > 280) {
        lastPeak.current = now;
        stepsRef.current += 1; setSteps(stepsRef.current);
        if (stepsRef.current - savedRef.current >= 20) flush();
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => { window.removeEventListener("devicemotion", onMotion); flush(); };
  }, [tracking]);

  const start = async () => {
    try {
      if (typeof DeviceMotionEvent === "undefined") { setStatus("Live step counting isn't supported on this device. You can enter steps manually below."); return; }
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        const r = await DeviceMotionEvent.requestPermission();
        if (r !== "granted") { setStatus("Motion permission was not granted."); return; }
      }
      setStatus("Counting steps while this screen stays open."); setTracking(true);
    } catch { setStatus("Unable to start motion tracking on this device."); }
  };
  const stop = () => { setTracking(false); setStatus("Tracking paused. Today's steps are saved."); };
  const addMinutes = (name, mins) => updateDay(today, d => ({ ...d, activity: [...(d.activity || []), { id: Date.now().toString(36), name, minutes: mins }] }));
  const removeAt = i => updateDay(today, d => ({ ...d, activity: (d.activity || []).filter((_, j) => j !== i) }));
  const saveManualSteps = () => {
    const n = safeNumber(manualSteps, 100000); if (n === null) return;
    stepsRef.current = Math.round(n); savedRef.current = stepsRef.current; setSteps(stepsRef.current);
    updateDay(today, d => ({ ...d, steps: Math.round(n) })); setManualSteps("");
  };
  const pct = Math.min(100, Math.round(minutes / goal * 100)), stepPct = Math.min(100, steps / stepGoal * 100);

  return <div className="sf-detail"><Header title="Activity" subtitle="Live steps + manual workouts" onBack={onBack}/>
    <div className="sf-card sf-steps-card">
      <div className="sf-heading-row">
        <div className="sf-steps-main"><img src={A + "/animations/walking.gif"} alt="Walking animation"/>
          <div><span className="sf-kicker">STEPS TODAY</span><strong aria-label="Steps today">{steps.toLocaleString()}</strong>
            <small>{(steps * 0.00047).toFixed(2)} mi estimated · goal {stepGoal.toLocaleString()}</small></div></div>
        <button className={"sf-pill-btn" + (tracking ? " stop" : "")} onClick={tracking ? stop : start}>
          {tracking ? <><Square size={13}/> Stop</> : <><Play size={13}/> Start</>}</button>
      </div>
      <div className="sf-mini-progress wide"><span style={{ width: stepPct + "%" }}/></div>
      {status && <p className="sf-help" role="status">{status}</p>}
      <div className="sf-inline-entry"><label htmlFor="sf-steps-manual">Set steps</label>
        <input id="sf-steps-manual" type="number" min="0" max="100000" value={manualSteps} placeholder="e.g. 6500" onChange={e => setManualSteps(e.target.value)}/>
        <button onClick={saveManualSteps} disabled={safeNumber(manualSteps, 100000) === null}>Save</button></div>
      <p className="sf-help">Live counting works only while the app is open. Paste in steps from your phone's health app for a full-day count.</p>
    </div>

    <div className="sf-card"><div className="sf-heading-row">
      <div><span className="sf-kicker">DAILY ACTIVITY</span><h3 style={{ marginTop: 4 }}><span data-testid="activity-minutes">{minutes}</span> <small className="sf-muted">of {goal} min</small></h3>
        <small className="sf-muted">{minutes >= goal ? "Daily movement goal completed." : (goal - minutes) + " min remaining today"}</small></div>
      <div className="sf-goal-badge"><b>{pct}%</b><small>GOAL</small></div></div>
      <div className="sf-mini-progress wide"><span style={{ width: pct + "%" }}/></div>
    </div>

    <h3 className="sf-section">Quick activity</h3>
    <div className="sf-quick-grid">{QUICK.map(q => <button key={q.label} className="sf-quick" style={{ background: q.bg }} onClick={() => addMinutes(q.label, q.mins)} aria-label={"Add " + q.mins + " minutes " + q.label}>
      <img src={A + "/animations/" + q.gif + ".gif"} alt="" loading="lazy"/><b>{q.label}</b><small>+{q.mins} minutes</small></button>)}</div>

    <div className="sf-card"><h3>Custom workout</h3>
      <div className="sf-inline-entry">
        <select aria-label="Workout type" value={custom.name} onChange={e => setCustom(c => ({ ...c, name: e.target.value }))}>
          {["Walking", "Running", "Cycling", "Yoga", "Strength", "Stretching", "Swimming", "Other"].map(x => <option key={x}>{x}</option>)}</select>
        <input aria-label="Workout minutes" type="number" min="1" max="1440" placeholder="min" value={custom.minutes} onChange={e => setCustom(c => ({ ...c, minutes: e.target.value }))}/>
        <button disabled={!(Number(custom.minutes) > 0 && Number(custom.minutes) <= 1440)} onClick={() => { addMinutes(custom.name, Number(custom.minutes)); setCustom(c => ({ ...c, minutes: "" })); }}><Plus size={15}/> Add</button>
      </div>
      <h3 style={{ marginTop: 16 }}>Today's log</h3>
      {(day.activity || []).length ? day.activity.map((a, i) => <div className="sf-history-row" key={a.id || i}>
        <span><Footprints size={14}/> {a.name}</span><strong>{a.minutes} min
          <button className="sf-icon-btn" aria-label={"Remove " + a.name} onClick={() => removeAt(i)}><Trash2 size={13}/></button></strong></div>)
        : <div className="sf-empty">No activity logged yet today.</div>}
    </div>
  </div>;
}

/* ───────── Progress photos (stored on this device only) ───────── */
const photoKey = id => "slimsyfit-freeapp:photos:" + (id || "guest");
function shrinkImage(file, max = 720) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file couldn't be read as an image.")); };
    img.src = url;
  });
}
export function PhotosPanel({ identity, latestWeight, unit }) {
  const [photos, setPhotos] = useState(() => { try { return JSON.parse(localStorage.getItem(photoKey(identity)) || "[]"); } catch { return []; } });
  const [compare, setCompare] = useState(false), [a, setA] = useState(0), [b, setB] = useState(0), [error, setError] = useState("");
  const fileRef = useRef(null);
  const save = next => {
    try { localStorage.setItem(photoKey(identity), JSON.stringify(next)); setPhotos(next); setError(""); return true; }
    catch { setError("Not enough storage on this device. Delete an older photo and try again."); return false; }
  };
  const onPick = async e => {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    try { const src = await shrinkImage(f); save([{ id: Date.now(), src, date: new Date().toISOString(), weight: latestWeight != null ? latestWeight + " " + unit : "" }, ...photos]); }
    catch (err) { setError(err.message); }
  };
  const remove = id => { if (window.confirm("Delete this photo from this device?")) save(photos.filter(p => p.id !== id)); };
  const fmt = d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return <>
    <div className="sf-card"><div className="sf-heading-row"><h3>Progress photos</h3>
      {photos.length >= 2 && <button onClick={() => { setCompare(!compare); setA(photos.length - 1); setB(0); }}>{compare ? "Done" : "Compare"}</button>}</div>
      <p className="sf-help">Photos stay private on this device and are not uploaded or synced.</p>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onPick} data-testid="photo-input"/>
      <button className="sf-primary-action" onClick={() => fileRef.current?.click()}><Camera size={16}/> Add a photo</button>
      {error && <div className="sf-error" role="alert">{error}</div>}
    </div>
    {compare && photos.length >= 2 && <div className="sf-card"><div className="sf-compare">
      {[[a, setA, "Before"], [b, setB, "After"]].map(([idx, set, label]) => <div key={label}>
        <span className="sf-kicker">{label.toUpperCase()}</span><img src={photos[idx]?.src} alt={label + " photo"}/>
        <select aria-label={label + " photo"} value={idx} onChange={e => set(Number(e.target.value))}>
          {photos.map((p, i) => <option key={p.id} value={i}>{fmt(p.date)}</option>)}</select></div>)}
    </div></div>}
    <div className="sf-photo-grid">{photos.map(p => <figure key={p.id} className="sf-photo">
      <img src={p.src} alt={"Progress photo " + fmt(p.date)}/><figcaption>{fmt(p.date)}{p.weight ? " · " + p.weight : ""}</figcaption>
      <button className="sf-icon-btn" aria-label="Delete photo" onClick={() => remove(p.id)}><Trash2 size={13}/></button></figure>)}</div>
    {!photos.length && <div className="sf-empty">No photos yet. Take one today to see your change over time.</div>}
  </>;
}

/* ───────── Mood & energy check-in ───────── */
export function MoodPanel({ data, today, updateDay }) {
  const saved = data.days[today]?.mood;
  const [mood, setMood] = useState(saved?.mood || 3), [energy, setEnergy] = useState(saved?.energy || 3), [note, setNote] = useState(saved?.note || ""), [ok, setOk] = useState(false);
  const save = () => { updateDay(today, d => ({ ...d, mood: { mood, energy, note: note.trim().slice(0, 200) } })); setOk(true); setTimeout(() => setOk(false), 2000); };
  const week = moodHistory(data, today, 7);
  return <>
    <div className="sf-card"><h3>How are you feeling today?</h3>
      <div className="sf-moods" role="radiogroup" aria-label="Mood">{MOODS.map(m => <button key={m.v} role="radio" aria-checked={mood === m.v} className={mood === m.v ? "on" : ""} onClick={() => setMood(m.v)}>
        <span>{m.emoji}</span><small>{m.label}</small></button>)}</div>
      <label className="sf-range-label" htmlFor="sf-energy">Energy level <b>{energy}/5</b></label>
      <input id="sf-energy" type="range" min="1" max="5" value={energy} onChange={e => setEnergy(Number(e.target.value))} className="sf-range"/>
      <label className="sf-range-label" htmlFor="sf-mood-note">Note (optional)</label>
      <textarea id="sf-mood-note" className="sf-textarea" rows={3} maxLength={200} value={note} placeholder="What influenced how you feel today?" onChange={e => setNote(e.target.value)}/>
      <button className="sf-primary-action" onClick={save}>{ok ? "✓ Saved!" : saved ? "Update today's entry" : "Save today's entry"}</button>
    </div>
    <div className="sf-card"><h3>Last 7 days</h3>
      <div className="sf-mood-week">{week.map(w => <div key={w.date}>
        <span>{w.mood ? MOODS.find(m => m.v === w.mood.mood)?.emoji : "·"}</span>
        <div className="sf-water-track"><div style={{ height: (w.mood ? w.mood.mood * 20 : 0) + "%" }}/></div><small>{dayLabel(w.date)}</small></div>)}</div>
    </div>
  </>;
}

/* ───────── Milestone celebration popup ───────── */
export function MilestoneModal({ badge, onClose }) {
  if (!badge) return null;
  const share = async () => {
    const text = "I just hit " + badge.count + " weigh-ins on SlimSyFit! 🎉";
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch { /* user cancelled */ }
  };
  return <div className="sf-modal-bg" role="dialog" aria-modal="true" aria-label="Milestone unlocked">
    <div className="sf-modal">
      <button className="sf-modal-x" aria-label="Close" onClick={onClose}><X size={18}/></button>
      <img src={A + "/milestones/milestone-" + badge.count + (badge.count === 10 ? ".png" : ".jpg")} alt=""/>
      <span className="sf-kicker">MILESTONE UNLOCKED</span><h2>{badge.title}</h2>
      <p>{badge.count} weight check-ins recorded. Consistency like this is what builds lasting change.</p>
      <button className="sf-primary-action" onClick={share}>Share my milestone</button>
      <button className="sf-link-action" onClick={onClose}>Keep going</button>
    </div>
  </div>;
}

/* ───────── Reminders (browser notifications while the app is open) ───────── */
export function useReminders(reminders) {
  const key = JSON.stringify(reminders || {});
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const timers = [], now = new Date();
    for (const item of reminderSchedule(reminders)) {
      const t = new Date(); t.setHours(item.h, item.m, 0, 0); if (t <= now) t.setDate(t.getDate() + 1);
      timers.push(setTimeout(() => { try { new Notification(item.title, { body: item.body, icon: "/assets/slimsyfit/icon-192.png" }); } catch { /* ignore */ } }, t - now));
    }
    return () => timers.forEach(clearTimeout);
  }, [key]);
}
export function RemindersCard({ reminders, onChange }) {
  const supported = typeof Notification !== "undefined";
  const [perm, setPerm] = useState(supported ? Notification.permission : "unsupported");
  const toggle = async k => {
    const next = { ...reminders, [k]: !reminders[k] };
    if (next[k] && supported && Notification.permission === "default") setPerm(await Notification.requestPermission());
    onChange(next);
  };
  return <div className="card"><h3><Bell size={16}/> Reminders</h3>
    {[["water", "Water reminders", "Every 2 hours, 9am–7pm"], ["meals", "Meal reminders", "Breakfast, lunch and dinner"], ["checkin", "Daily check-in", "9pm evening review"]].map(([k, label, sub]) =>
      <label key={k} className="entry" style={{ cursor: "pointer" }}>
        <div className="entrymain"><b>{label}</b><small>{sub}</small></div>
        <input type="checkbox" className="check" checked={Boolean(reminders[k])} onChange={() => toggle(k)} aria-label={label}/></label>)}
    <p className="mini-help">{perm === "denied" ? "Notifications are blocked for this site. Allow them in your browser settings to receive reminders."
      : perm === "unsupported" ? "This browser doesn't support notifications."
        : "Reminders appear while SlimSyFit is open or installed on your home screen."}</p>
  </div>;
}
