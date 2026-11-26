import test from "node:test";
import assert from "node:assert/strict";
import {parseHeightCm,parseWeightKg,bmiValue,weightGoalProgress} from "../src/lib/metrics.js";

test("original survey feet/inches and centimeter heights are parsed safely",()=>{
  assert.equal(parseHeightCm("5'8\""),172.72);
  assert.equal(parseHeightCm("172 cm"),172);
  assert.equal(parseHeightCm(""),null);
  assert.equal(parseHeightCm("20 cm"),null);
});
test("weight conversions and BMI rely only on real measured values",()=>{
  assert.ok(Math.abs(parseWeightKg("180 lbs")-81.65)<0.1);
  assert.equal(bmiValue("172 cm",null,"kg"),null);
  assert.equal(bmiValue("172 cm","70 kg","kg"),23.7);
});
test("weight goal progress never predicts future changes",()=>{
  assert.equal(weightGoalProgress("175 lbs","180 lbs","170 lbs"),50);
  assert.equal(weightGoalProgress("180 lbs","180 lbs","170 lbs"),0);
  assert.equal(weightGoalProgress("170 lbs","180 lbs","170 lbs"),100);
  assert.equal(weightGoalProgress(null,"180 lbs","170 lbs"),null);
});
