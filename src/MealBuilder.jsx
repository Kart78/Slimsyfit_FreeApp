import { useEffect, useRef, useState } from "react";
import { Plus, Minus, Trash2, Search, Camera, X, BookmarkPlus, Check } from "lucide-react";
import { FOODS, FOOD_CATEGORIES, getFood, itemLabel, itemNutrition, itemsTotal, perServing, scaleNutrition, searchFoods } from "./lib/foods.js";
import { safeNumber } from "./lib/tracker.js";
import { deleteMealPhoto, getMealPhoto, putMealPhoto, shrinkImage } from "./lib/photoStore.js";
import "./meal-builder.css";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = n => `${n.calories} kcal · P ${n.protein}g · C ${n.carbs}g · F ${n.fat}g`;
const defaultType = () => { const h = new Date().getHours(); return h < 11 ? "Breakfast" : h < 15 ? "Lunch" : h < 18 ? "Snack" : "Dinner"; };

/* ───────── Food picker + item list (shared by meal builder and recipes) ───────── */
function FoodPicker({ items, setItems }) {
  const [q, setQ] = useState(""), [cat, setCat] = useState("");
  const results = q.trim() ? searchFoods(q) : cat ? FOODS.filter(f => f.category === cat) : [];
  const add = f => { setItems(list => [...list, { key: uid(), foodId: f.id, servingIndex: 0, qty: 1 }]); setQ(""); };
  const patch = (key, ch) => setItems(list => list.map(i => i.key === key ? { ...i, ...ch } : i));
  return <>
    <div className="mb-search"><Search size={16}/><input aria-label="Search foods" value={q} placeholder="Search foods — e.g. roti, egg, dal, banana" onChange={e => setQ(e.target.value)}/>
      {q && <button type="button" aria-label="Clear search" onClick={() => setQ("")}><X size={15}/></button>}</div>
    {!q.trim() && <div className="mb-cats" role="tablist" aria-label="Food categories">{FOOD_CATEGORIES.map(c =>
      <button type="button" role="tab" aria-selected={cat === c} key={c} className={cat === c ? "on" : ""} onClick={() => setCat(cat === c ? "" : c)}>{c}</button>)}</div>}
    {results.length > 0 && <ul className="mb-results" aria-label="Food results">{results.map(f => {
      const s = f.servings[0], n = itemNutrition({ foodId: f.id, servingIndex: 0, qty: 1 });
      return <li key={f.id}><button type="button" onClick={() => add(f)} aria-label={"Add " + f.name}>
        <span><b>{f.name}</b><small>{s.label} · {n.calories} kcal · P {n.protein}g</small></span><Plus size={16}/></button></li>;
    })}</ul>}
    {q.trim() && !results.length && <p className="mini-help">No match for "{q}". Try a simpler word, or use “Enter numbers”.</p>}

    {items.length > 0 && <div className="mb-items" aria-label="Foods in this meal">{items.map(i => {
      const f = getFood(i.foodId), n = itemNutrition(i);
      return <div className="mb-item" key={i.key}>
        <div className="mb-item-top"><b>{f.name}</b><button type="button" className="sf-icon-btn" aria-label={"Remove " + f.name} onClick={() => setItems(l => l.filter(x => x.key !== i.key))}><Trash2 size={13}/></button></div>
        <div className="mb-item-controls">
          <div className="mb-qty">
            <button type="button" aria-label={"Less " + f.name} onClick={() => patch(i.key, { qty: Math.max(0.25, +(i.qty - 0.5).toFixed(2)) })}><Minus size={14}/></button>
            <input aria-label={"Quantity of " + f.name} type="number" min="0.25" step="0.25" value={i.qty} onChange={e => patch(i.key, { qty: e.target.value })}/>
            <button type="button" aria-label={"More " + f.name} onClick={() => patch(i.key, { qty: +(Number(i.qty || 0) + 0.5).toFixed(2) })}><Plus size={14}/></button>
          </div>
          <select aria-label={"Serving size for " + f.name} value={i.servingIndex} onChange={e => patch(i.key, { servingIndex: Number(e.target.value) })}>
            {f.servings.map((s, k) => <option key={k} value={k}>{s.label} ({s.grams} g)</option>)}</select>
        </div>
        <small className="mb-item-n">{fmt(n)}</small>
      </div>;
    })}</div>}
  </>;
}

/* ───────── Meal builder tab ───────── */
function BuildTab({ onLog, onSaveRecipe }) {
  const [items, setItems] = useState([]), [type, setType] = useState(defaultType()), [name, setName] = useState("");
  const [asRecipe, setAsRecipe] = useState(false), [servings, setServings] = useState(1), [msg, setMsg] = useState("");
  const total = itemsTotal(items);
  const valid = items.length > 0 && items.every(i => Number(i.qty) > 0);
  const autoName = items.map(i => getFood(i.foodId)?.name.split(/[,(/]/)[0].trim()).filter(Boolean).slice(0, 3).join(", ") + (items.length > 3 ? "…" : "");
  const reset = text => { setItems([]); setName(""); setAsRecipe(false); setServings(1); setMsg(text); setTimeout(() => setMsg(""), 2500); };
  const detail = items.map(itemLabel).join("; ");
  return <div>
    <FoodPicker items={items} setItems={setItems}/>
    {items.length > 0 && <>
      <div className="mb-total" aria-label="Meal total"><span>Total</span><strong>{total.calories} kcal</strong><small>P {total.protein}g · C {total.carbs}g · F {total.fat}g</small></div>
      <div className="grid2">
        <div className="field"><label htmlFor="mb-name">Meal name</label><input id="mb-name" className="input" value={name} placeholder={autoName} onChange={e => setName(e.target.value)}/></div>
        <div className="field"><label htmlFor="mb-type">Meal type</label><select id="mb-type" className="input" value={type} onChange={e => setType(e.target.value)}>{MEAL_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
      </div>
      <button type="button" className="mb-primary" disabled={!valid} onClick={() => { onLog({ type, name: name.trim() || autoName, ...total, detail }); reset("Added to your food log."); }}><Check size={16}/> Log this meal</button>
      {!asRecipe ? <button type="button" className="mb-secondary" disabled={!valid} onClick={() => setAsRecipe(true)}><BookmarkPlus size={16}/> Save to My meals</button>
        : <div className="mb-recipe">
          <label htmlFor="mb-servings">This makes how many servings?</label>
          <div className="mb-recipe-row"><input id="mb-servings" type="number" min="1" max="50" value={servings} onChange={e => setServings(e.target.value)}/>
            <span>{fmt(perServing(total, servings))} per serving</span></div>
          <button type="button" className="mb-primary" disabled={!valid || !(Number(servings) >= 1 && Number(servings) <= 50)}
            onClick={() => { onSaveRecipe({ id: uid(), name: name.trim() || autoName, type, servings: Number(servings), items: items.map(({ foodId, servingIndex, qty }) => ({ foodId, servingIndex, qty: Number(qty) })), perServing: perServing(total, servings), detail }); reset("Saved to My meals."); }}>Save to My meals</button>
        </div>}
    </>}
    {!items.length && !msg && <p className="mini-help">Add each food and its amount; the app adds up calories, protein, carbs and fat. Values are approximate (USDA and common Indian recipes).</p>}
    {msg && <div className="success" role="status">{msg}</div>}
  </div>;
}

/* ───────── Manual numbers tab (labels / your own records) ───────── */
function NumbersTab({ onLog }) {
  const [f, setF] = useState({ type: defaultType(), name: "", calories: "", carbs: "", fat: "", protein: "" }), [err, setErr] = useState("");
  const submit = e => {
    e.preventDefault();
    const c = safeNumber(f.calories, 20000); if (!f.name.trim() || c === null) { setErr("Enter a name and valid calories (0–20,000)."); return; }
    const parts = ["carbs", "fat", "protein"].map(k => safeNumber(f[k], 3000)); if (parts.some(x => x === null)) { setErr("Enter nonnegative carbs, fat and protein amounts."); return; }
    onLog({ type: f.type, name: f.name.trim(), calories: c, carbs: parts[0], fat: parts[1], protein: parts[2] });
    setF({ ...f, name: "", calories: "", carbs: "", fat: "", protein: "" }); setErr("");
  };
  return <form onSubmit={submit}>
    <div className="field"><label htmlFor="nm-type">Meal type</label><select id="nm-type" className="input" value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>{MEAL_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
    <div className="field"><label htmlFor="nm-name">Food or dish</label><input id="nm-name" className="input" value={f.name} placeholder="Example: Vegetable rice bowl" onChange={e => setF({ ...f, name: e.target.value })}/></div>
    <div className="grid2">{["calories", "carbs", "fat", "protein"].map(k => <div className="field" key={k}>
      <label htmlFor={"nm-" + k}>{k === "calories" ? "Calories (kcal)" : k[0].toUpperCase() + k.slice(1) + " (g)"}</label>
      <input id={"nm-" + k} className="input" type="number" min="0" step="0.1" placeholder="0" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })}/></div>)}</div>
    {err && <div className="error" role="alert">{err}</div>}
    <button type="submit" className="mb-primary" disabled={!f.name.trim() || f.calories === "" || ["carbs", "fat", "protein"].some(k => f[k] === "")}><Plus size={15}/> Save meal manually</button>
    <p className="mini-help">Use values from a food label or your own records.</p>
  </form>;
}

/* ───────── My meals tab ───────── */
function MyMealsTab({ myMeals, onLog, onDelete }) {
  const [amt, setAmt] = useState({}), [type, setType] = useState({}), [done, setDone] = useState("");
  if (!myMeals.length) return <div className="sf-empty">No saved meals yet. Build a meal and tap “Save to My meals” to log it in one tap next time.</div>;
  return <div className="mb-saved">{myMeals.map(m => {
    const qty = Number(amt[m.id] ?? 1), n = scaleNutrition(m.perServing, qty);
    return <div className="mb-saved-row" key={m.id}>
      <div className="mb-item-top"><b>{m.name}</b><button type="button" className="sf-icon-btn" aria-label={"Delete saved meal " + m.name}
        onClick={() => { if (window.confirm(`Delete "${m.name}" from My meals?`)) onDelete(m.id); }}><Trash2 size={13}/></button></div>
      <small className="mb-item-n">{m.servings > 1 ? `Recipe · ${m.servings} servings · ` : ""}{fmt(m.perServing)} per serving</small>
      <div className="mb-item-controls">
        <select aria-label={"Servings of " + m.name} value={qty} onChange={e => setAmt({ ...amt, [m.id]: e.target.value })}>{[0.5, 1, 1.5, 2, 3].map(v => <option key={v} value={v}>{v} serving{v === 1 ? "" : "s"}</option>)}</select>
        <select aria-label={"Meal type for " + m.name} value={type[m.id] || m.type || defaultType()} onChange={e => setType({ ...type, [m.id]: e.target.value })}>{MEAL_TYPES.map(t => <option key={t}>{t}</option>)}</select>
        <button type="button" className="mb-log-saved" aria-label={"Log " + m.name} onClick={() => {
          onLog({ type: type[m.id] || m.type || defaultType(), name: qty === 1 ? m.name : `${m.name} (${qty} servings)`, ...n, savedMealId: m.id });
          setDone(m.id); setTimeout(() => setDone(""), 2000);
        }}>{done === m.id ? <><Check size={14}/> Logged</> : <><Plus size={14}/> Log</>}</button>
      </div>
    </div>;
  })}</div>;
}

/* ───────── Panel wrapper ───────── */
export function OwnMealPanel({ myMeals, onLog, onSaveMyMeal, onDeleteMyMeal }) {
  const [tab, setTab] = useState("build");
  const tabs = [["build", "Build from foods"], ["numbers", "Enter numbers"], ["saved", `My meals${myMeals.length ? " (" + myMeals.length + ")" : ""}`]];
  return <details className="card sf-add-meal">
    <summary>Add your own meal <em>+ Add</em></summary>
    <div className="mb-tabs" role="tablist" aria-label="Add meal method">{tabs.map(([k, l]) =>
      <button type="button" role="tab" aria-selected={tab === k} key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>
    {tab === "build" && <BuildTab onLog={onLog} onSaveRecipe={m => { onSaveMyMeal(m); }}/>}
    {tab === "numbers" && <NumbersTab onLog={onLog}/>}
    {tab === "saved" && <MyMealsTab myMeals={myMeals} onLog={onLog} onDelete={onDeleteMyMeal}/>}
  </details>;
}

/* ───────── Photo for a logged meal (on-device only) ───────── */
export function MealPhoto({ identity, mealId, name }) {
  const [src, setSrc] = useState(null), [big, setBig] = useState(false), [err, setErr] = useState("");
  const ref = useRef(null);
  useEffect(() => { let on = true; getMealPhoto(identity, mealId).then(v => on && setSrc(v || null)).catch(() => {}); return () => { on = false; }; }, [identity, mealId]);
  const pick = async e => {
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    try { const url = await shrinkImage(file); await putMealPhoto(identity, mealId, url); setSrc(url); setErr(""); }
    catch (x) { setErr(x.message || "Couldn't save the photo."); setTimeout(() => setErr(""), 4000); }
  };
  const remove = async () => { await deleteMealPhoto(identity, mealId).catch(() => {}); setSrc(null); setBig(false); };
  return <>
    <input ref={ref} type="file" accept="image/*" capture="environment" hidden onChange={pick} data-testid={"meal-photo-input-" + mealId}/>
    {src ? <button type="button" className="mb-thumb" aria-label={"View photo of " + name} onClick={() => setBig(true)}><img src={src} alt=""/></button>
      : <button type="button" className="mb-cam" aria-label={"Add photo of " + name} onClick={() => ref.current?.click()}><Camera size={15}/></button>}
    {err && <span className="mb-photo-err" role="alert">{err}</span>}
    {big && <div className="sf-modal-bg" role="dialog" aria-modal="true" aria-label={"Photo of " + name} onClick={() => setBig(false)}>
      <div className="sf-modal mb-photo-modal" onClick={e => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={() => setBig(false)}><X size={18}/></button>
        <img src={src} alt={"Photo of " + name}/>
        <p className="mini-help">Stored only on this device.</p>
        <div className="mb-photo-actions"><button type="button" className="mb-secondary" onClick={() => ref.current?.click()}><Camera size={15}/> Replace</button>
          <button type="button" className="mb-danger" onClick={remove}><Trash2 size={15}/> Delete photo</button></div>
      </div>
    </div>}
  </>;
}
export { deleteMealPhoto };
