import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyData, blankDay, entryCount, levelInfo, earnedBadges, safeMl, safeNumber, rangeDates } from "../src/lib/tracker.js";

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
test("level unlocks follow 7 and 21 distinct logged days", () => {
  const d = createEmptyData();
  for (let i=1;i<=21;i++) d.days["2026-11-" + String(i).padStart(2,"0")] = { waterMl: 250 };
  assert.equal(levelInfo(d).name, "Lifestyle");
  assert.deepEqual(earnedBadges(d).map(x=>x.count),[10,20]);
});
test("values are bounded and future dates do not duplicate", () => {
  assert.equal(safeMl(-100), 0);
  assert.equal(safeMl(15000), 12000);
  assert.equal(safeNumber(-4),null);
  assert.equal(rangeDates("2026-11-26",7).length,7);
  assert.equal(new Set(rangeDates("2026-11-26",7)).size,7);
});