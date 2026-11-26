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
import { convertWeight, convertWeightText, changeWeightUnit, reminderSchedule, dayHasEntry, normalizeData, moodHistory } from "../src/lib/tracker.js";
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
test("steps and mood count as real entries; old data gains reminder defaults", () => {
  assert.equal(dayHasEntry({ steps: 1200 }), true);
  assert.equal(dayHasEntry({ mood: { mood: 4, energy: 3 } }), true);
  assert.equal(dayHasEntry({ steps: 0 }), false);
  const n = normalizeData({ profile: { name: "A" } });
  assert.deepEqual(n.profile.reminders, { water: false, meals: false, checkin: false });
  assert.equal(n.profile.stepGoal, 8000);
});
test("mood history returns one slot per day", () => {
  const d = createEmptyData(); d.days["2026-11-26"] = { mood: { mood: 5 } };
  const h = moodHistory(d, "2026-11-26", 7);
  assert.equal(h.length, 7); assert.equal(h[6].mood.mood, 5); assert.equal(h[0].mood, null);
});
