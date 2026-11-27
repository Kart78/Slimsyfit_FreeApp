import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyData, blankDay, entryCount, weightEntryCount, levelInfo, earnedBadges, safeMl, safeNumber, rangeDates } from "../src/lib/tracker.js";

test("new accounts start empty", () => {
  const d = createEmptyData();
  assert.equal(entryCount(d), 0);
  assert.equal(levelInfo(d).name, "Newbie");
});
test("only real check-ins count", () => {
  const d = createEmptyData();
  d.days["2026-11-20"] = blankDay();
  assert.equal(entryCount(d), 0);
  d.days["2026-11-20"].waterMl = 250;
  assert.equal(entryCount(d), 1);
});
test("commitment uses 7 and 30 real weight-check-in days, not water-only days", () => {
  const d=createEmptyData();
  for(let i=1;i<=30;i++){
    const day="2026-11-"+String(i).padStart(2,"0");
    d.days[day]={waterMl:250};
  }
  assert.equal(entryCount(d),30);
  assert.equal(weightEntryCount(d),0);
  assert.equal(levelInfo(d).name,"Newbie");
  assert.deepEqual(earnedBadges(d),[]);
  for(let i=1;i<=7;i++){
    d.days["2026-11-"+String(i).padStart(2,"0")].weight=80;
  }
  assert.equal(levelInfo(d).name,"Building the Habit");
  for(let i=8;i<=30;i++){
    d.days["2026-11-"+String(i).padStart(2,"0")].weight=80;
  }
  assert.equal(levelInfo(d).name,"Lifestyle");
  assert.deepEqual(earnedBadges(d).map(x=>x.count),[10,20,30]);
});
test("values are bounded and future dates do not duplicate", () => {
  assert.equal(safeMl(-100), 0);
  assert.equal(safeMl(15000), 12000);
  assert.equal(safeNumber(-4),null);
  assert.equal(rangeDates("2026-11-26",7).length,7);
  assert.equal(new Set(rangeDates("2026-11-26",7)).size,7);
});
import { convertWeight, convertWeightText, changeWeightUnit, reminderSchedule, dayHasEntry, normalizeData } from "../src/lib/tracker.js";
test("weight unit conversion rounds to 0.1 and rejects invalid values", () => {
  assert.equal(convertWeight(80, "kg", "lbs"), 176.4);
  assert.equal(convertWeight(176.4, "lbs", "kg"), 80);
  assert.equal(convertWeight(70, "kg", "kg"), 70);
  assert.equal(convertWeight("x", "kg", "lbs"), null);
  assert.equal(convertWeightText("180 lbs", "kg"), "81.6 kg");
  assert.equal(convertWeightText("not a weight", "kg"), "not a weight");
});
test("changing unit converts every recorded weight and profile weight", () => {
  const d = createEmptyData();
  d.profile.weightUnit = "lbs"; d.profile.currentWeight = "200 lbs"; d.profile.targetWeight = "180 lbs";
  d.days["2026-11-01"] = { ...blankDay(), weight: 200 };
  d.days["2026-11-02"] = { ...blankDay(), waterMl: 500 };
  const out = changeWeightUnit(d, "kg");
  assert.equal(out.profile.weightUnit, "kg");
  assert.equal(out.days["2026-11-01"].weight, 90.7);
  assert.equal(out.days["2026-11-02"].weight, null);
  assert.equal(out.profile.targetWeight, "81.6 kg");
  assert.equal(weightEntryCount(out), 1);
});
test("reminder schedule follows toggles", () => {
  assert.equal(reminderSchedule({}).length, 0);
  assert.equal(reminderSchedule({ water: true }).length, 6);
  assert.equal(reminderSchedule({ meals: true, checkin: true }).length, 4);
});
test("steps count as real entries; old data gains reminder defaults", () => {
  assert.equal(dayHasEntry({ steps: 1200 }), true);
  assert.equal(dayHasEntry({ steps: 0 }), false);
  const n = normalizeData({ profile: { name: "A" } });
  assert.deepEqual(n.profile.reminders, { water: false, meals: false, checkin: false });
  assert.equal(n.profile.stepGoal, 8000);
});
import { MENUS, menuFor, menuTotals, logType } from "../src/lib/menu.js";
test("menu matches original dishes, has detail, and macros add up", () => {
  assert.deepEqual(Object.keys(MENUS), ["Non-vegetarian", "Vegetarian", "Vegan"]);
  assert.equal(menuFor("Vegan")[0].title, "Apple overnight oats");
  assert.equal(menuFor("Any")[0].title, "Egg avocado toast");
  for (const [diet, meals] of Object.entries(MENUS)) {
    assert.deepEqual(meals.map(m => m.meal), ["Breakfast", "Lunch", "Snacks", "Dinner"]);
    for (const m of meals) {
      assert.ok(m.image.includes(diet.toLowerCase() + "-" + m.meal.toLowerCase()), m.title + " uses its own diet photo");
      assert.ok(m.ingredients.length >= 2 && m.steps.length >= 2 && m.swaps.length >= 2, m.title + " is detailed");
      const { calories, protein, carbs, fat } = m.nutrition;
      const est = protein * 4 + carbs * 4 + fat * 9;
      assert.ok(Math.abs(est - calories) / calories < 0.12, m.title + " calories consistent with macros");
    }
    const t = menuTotals(meals).calories;
    assert.ok(t >= 1200 && t <= 1800, diet + " day total " + t);
  }
  assert.equal(logType("Snacks"), "Snack");
});

import { FOODS, getFood, itemsTotal, itemNutrition, perServing, scaleNutrition, searchFoods, itemLabel } from "../src/lib/foods.js";
test("food list is well-formed and calories agree with macros", () => {
  assert.ok(FOODS.length >= 90);
  const ids = new Set();
  for (const f of FOODS) {
    assert.ok(!ids.has(f.id), "unique id " + f.id); ids.add(f.id);
    assert.ok(f.servings.length >= 1 && f.servings.every(s => s.grams > 0 && s.label), f.name + " servings");
    const { calories, protein, carbs, fat } = f.per100;
    if (calories >= 50) assert.ok(Math.abs(protein * 4 + carbs * 4 + fat * 9 - calories) / calories < 0.15, f.name + " macros vs kcal");
  }
  for (const id of ["roti", "dal", "idli", "dosa", "paneer", "sambar", "chole", "rajma", "poha", "upma"]) assert.ok(getFood(id), "has Indian food " + id);
});
test("meal builder totals, quantities and recipe servings", () => {
  // 2 eggs (2 × 50 g) = 155 kcal/100 g → 155 kcal
  assert.deepEqual(itemNutrition({ foodId: "egg", servingIndex: 0, qty: 2 }), { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6 });
  const t = itemsTotal([{ foodId: "egg", servingIndex: 0, qty: 2 }, { foodId: "bread-ww", servingIndex: 0, qty: 1 }]);
  assert.equal(t.calories, 155 + 81); // 1 slice 32 g × 252/100 = 80.6 → 81
  assert.deepEqual(perServing({ calories: 1000, protein: 40, carbs: 100, fat: 30 }, 4), { calories: 250, protein: 10, carbs: 25, fat: 7.5 });
  assert.deepEqual(scaleNutrition({ calories: 250, protein: 10, carbs: 25, fat: 7.5 }, 1.5), { calories: 375, protein: 15, carbs: 37.5, fat: 11.3 });
  assert.equal(itemNutrition({ foodId: "nope", qty: 1 }).calories, 0);
  assert.equal(itemLabel({ foodId: "roti", servingIndex: 0, qty: 2 }), "2 × 1 roti Roti / chapati (whole wheat)");
});
test("food search matches names and common aliases", () => {
  assert.equal(searchFoods("chapati")[0].id, "roti");
  assert.equal(searchFoods("dahi")[0].id, "curd");
  assert.ok(searchFoods("chicken").length >= 3);
  assert.equal(searchFoods("").length, 0);
});
test("saved meals survive normalization", () => {
  assert.deepEqual(normalizeData({}).myMeals, []);
  assert.equal(normalizeData({ myMeals: [{ id: "a" }] }).myMeals.length, 1);
});
