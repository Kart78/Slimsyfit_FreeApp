import { useState } from "react";
import { ChevronDown, Clock3, Check, Plus } from "lucide-react";
import { MENUS, menuDiet, menuTotals, logType } from "./lib/menu.js";
import { activityMinutes, rangeDates } from "./lib/tracker.js";
import "./menu-page.css";

const A = "/assets/slimsyfit";
const ICONS = { Breakfast: "☀️", Lunch: "🌤️", Snacks: "🍎", Dinner: "🌙" };

export function MenuView({ data, date, updateDay }) {
  const today = date;
  const [diet, setDiet] = useState(menuDiet(data.profile.diet));
  const [open, setOpen] = useState(null);
  const meals = MENUS[diet], totals = menuTotals(meals);
  const logged = data.days[today]?.meals || [];
  const isLogged = m => logged.some(x => x.menuId === diet + ":" + m.meal);
  const log = m => updateDay(today, d => ({ ...d, meals: [...(d.meals || []), {
    id: Date.now().toString(36), menuId: diet + ":" + m.meal, type: logType(m.meal), name: m.title, ...m.nutrition
  }] }));

  return <section className="sf-menu" aria-label="Meal plan">
    <div className="sf-coach-banner"><div><b>Your wellness guide</b><p>Fuel your body with real, whole foods.<br/>Stay consistent, see the change. 💚</p></div><span>❧</span></div>

    <div className="sf-diet-tabs" role="tablist" aria-label="Diet">{Object.keys(MENUS).map(k =>
      <button key={k} role="tab" aria-selected={diet === k} className={diet === k ? "active" : ""} onClick={() => { setDiet(k); setOpen(null); }}>{k}</button>)}</div>

    <div className="sf-card sf-menu-totals" aria-label="Day total">
      <div><strong>{totals.calories.toLocaleString()}</strong><small>kcal</small></div>
      <div><strong>{totals.protein}g</strong><small>protein</small></div>
      <div><strong>{totals.carbs}g</strong><small>carbs</small></div>
      <div><strong>{totals.fat}g</strong><small>fat</small></div>
    </div>
    <p className="sf-help">Approximate values for the portions shown. Adjust portions, ingredients and timing for your needs and allergies — these are ideas, not prescribed targets.</p>

    <div className="sf-menu-list">{meals.map(m => {
      const expanded = open === m.meal, done = isLogged(m);
      return <article className={"sf-meal sf-meal-full" + (expanded ? " open" : "")} key={m.meal}>
        <button className="sf-meal-head" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : m.meal)}>
          <div>
            <div className="sf-meal-label"><span>{ICONS[m.meal]}</span><div><b>{m.meal}</b><small><Clock3 size={11}/> {m.time}</small></div></div>
            <h4>{m.title}</h4><p className="sf-meal-protein">Protein: {m.protein}</p><p>{m.description}</p>
            <div className="sf-meal-chips"><span>{m.nutrition.calories} kcal</span><span>P {m.nutrition.protein}g</span><span>C {m.nutrition.carbs}g</span><span>F {m.nutrition.fat}g</span></div>
          </div>
          <img src={A + m.image} alt={m.title}/>
          <ChevronDown className="sf-meal-caret" size={18}/>
        </button>
        {expanded && <div className="sf-meal-body">
          <h5>Ingredients</h5><ul>{m.ingredients.map(x => <li key={x}>{x}</li>)}</ul>
          <h5>How to make it</h5><ol>{m.steps.map(x => <li key={x}>{x}</li>)}</ol>
          <h5>Easy swaps</h5><ul>{m.swaps.map(x => <li key={x}>{x}</li>)}</ul>
        </div>}
        <button className={"sf-log-meal" + (done ? " done" : "")} disabled={done} onClick={() => log(m)}>
          {done ? <><Check size={14}/> Logged</> : <><Plus size={14}/> Log this meal</>}</button>
      </article>;
    })}</div>
  </section>;
}

export function WeeklyPanel({ data, today }) {
  const p = data.profile, days = rangeDates(today, 7);
  const rows = days.map(date => {
    const d = data.days[date] || {};
    const fasts = data.fasting.completed.filter(f => {
      const x = new Date(f.end || f.start); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0") === date;
    }).length;
    return { date, meals: (d.meals || []).length, water: Number(d.waterMl) || 0, minutes: activityMinutes(d), steps: Number(d.steps) || 0, sleep: d.sleepHours ?? null, fasts };
  });
  const logged = rows.filter(r => r.meals || r.water || r.minutes || r.steps || r.sleep != null);
  const sum = k => rows.reduce((s, r) => s + (r[k] || 0), 0);
  const sleepRows = rows.filter(r => r.sleep != null);
  const waterGoal = Number(p.waterGoalMl) || 2000, actGoal = Number(p.activityGoal) || 30;
  const goalDays = { water: rows.filter(r => r.water >= waterGoal).length, activity: rows.filter(r => r.minutes >= actGoal).length, meals: rows.filter(r => r.meals >= 3).length };
  const label = date => new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
  const tiles = [
    ["💧", "Avg water", (sum("water") / 7 / 1000).toFixed(1) + " L", goalDays.water + "/7 days at goal"],
    ["🚶", "Active minutes", sum("minutes") + " min", goalDays.activity + "/7 days at goal"],
    ["🥗", "Meals logged", String(sum("meals")), goalDays.meals + "/7 days with 3+ meals"],
    ["🌙", "Avg sleep", sleepRows.length ? (sleepRows.reduce((s, r) => s + r.sleep, 0) / sleepRows.length).toFixed(1) + " h" : "—", sleepRows.length + " nights logged"],
    ["👟", "Total steps", sum("steps").toLocaleString(), "this week"],
    ["⏱️", "Fasts completed", String(sum("fasts")), "this week"]
  ];
  return <>
    <div className="sf-overview-note"><span style={{ fontSize: 18 }}>📅</span><div><b>Last 7 days</b>
      <small>{logged.length ? "You logged something on " + logged.length + " of 7 days." : "Nothing logged this week yet — your summary fills in as you track."}</small></div></div>
    <div className="sf-week-tiles">{tiles.map(([i, name, v, sub]) => <div className="sf-card" key={name}><span>{i}</span><small>{name}</small><strong>{v}</strong><em>{sub}</em></div>)}</div>
    <div className="sf-card"><h3>Day by day</h3>
      <div className="sf-week-table" role="table" aria-label="Weekly log">
        <div role="row" className="head"><span>Day</span><span>Meals</span><span>Water</span><span>Active</span><span>Sleep</span></div>
        {rows.slice().reverse().map(r => <div role="row" key={r.date} className={r.date === today ? "today" : ""}>
          <span>{r.date === today ? "Today" : label(r.date)}</span><span>{r.meals || "—"}</span>
          <span>{r.water ? (r.water / 1000).toFixed(1) + " L" : "—"}</span><span>{r.minutes ? r.minutes + "m" : "—"}</span>
          <span>{r.sleep != null ? r.sleep + "h" : "—"}</span></div>)}
      </div>
    </div>
  </>;
}
