import { test, expect } from "@playwright/test";

const seed = (weights) => {
  const d = new Date(), day = n => { const x = new Date(d); x.setDate(d.getDate() - n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
  const days = {};
  for (let i = 0; i < weights; i++) days[day(i + 1)] = { weight: 180 - i * 0.2, waterMl: 0, meals: [], activity: [], habits: {} };
  return { days, today: day(0) };
};

test("Activity page, Photos, unit switch and milestone celebration work", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  const { days, today } = seed(9);
  await page.addInitScript(([days, today]) => {
    localStorage.setItem("slimsyfit-freeapp:guest-active", "1");
    if (localStorage.getItem("slimsyfit-freeapp:v1:guest")) return;
    localStorage.setItem("slimsyfit-freeapp:v1:guest", JSON.stringify({
      profile: { name: "Karthik", gender: "Male", height: "5'8\"", currentWeight: "180 lbs", targetWeight: "165 lbs",
        weightUnit: "lbs", diet: "Non-vegetarian", activityGoal: 30, waterGoalMl: 2000, sleepGoal: 8, fastingHours: 12, fastingAllowed: true },
      days, fasting: { activeStart: null, completed: [] }
    }));
  }, [days, today]);
  await page.goto("/");

  // Activity tile now opens a dedicated Activity page (previously went to Nutrition).
  await page.locator(".original-tile").filter({ hasText: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add 10 minutes Walking" }).click();
  await page.getByRole("button", { name: "Add 15 minutes Running" }).click();
  await expect(page.getByTestId("activity-minutes")).toHaveText("25");
  await page.getByLabel("Set steps").fill("6500");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByLabel("Steps today")).toHaveText("6,500");
  await page.getByRole("button", { name: "Remove Walking" }).click();
  await expect(page.getByTestId("activity-minutes")).toHaveText("15");
  await page.reload();
  await page.locator(".original-tile").filter({ hasText: "Activity" }).click();
  await expect(page.getByLabel("Steps today")).toHaveText("6,500");
  await page.screenshot({ path: "test-results/" + test.info().project.name + "-activity.png", fullPage: true });
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.locator(".original-tile").filter({ hasText: "Activity" })).toContainText("6,500 steps");

  await page.getByRole("button", { name: "Results", exact: true }).click();
  // Results: Photos tab stores a downscaled image locally.
  await page.getByRole("tab", { name: /Photos/ }).click();
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==", "base64");
  await page.getByTestId("photo-input").setInputFiles({ name: "me.png", mimeType: "image/png", buffer: png });
  await expect(page.locator(".sf-photo")).toHaveCount(1);
  await page.screenshot({ path: "test-results/" + test.info().project.name + "-photos.png", fullPage: true });

  // 10th weigh-in triggers the milestone celebration.
  await page.getByRole("tab", { name: /Overview/ }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.locator(".original-tile").filter({ hasText: "Weight & Progress" }).click();
  await page.getByRole("spinbutton", { name: "Weight (lbs)" }).fill("177");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Milestone unlocked" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Great Start!" })).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "test-results/" + test.info().project.name + "-milestone.png" });
  await page.getByRole("button", { name: "Keep going" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0); // not re-shown on reload

  // Settings: switching lbs -> kg converts recorded weights instead of relabelling them.
  await page.getByRole("button", { name: "Open account settings" }).click();
  await page.getByLabel("Weight unit").selectOption("kg");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Profile and goals saved.")).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.locator(".original-tile").filter({ hasText: "Weight & Progress" }).click();
  await expect(page.getByText("80.3 kg").first()).toBeVisible();

  expect(errors).toEqual([]);
});
