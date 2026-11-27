import { test, expect } from "@playwright/test";

test("build a meal from foods, save a recipe, log it, attach a photo", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("slimsyfit-freeapp:guest-active", "1");
    if (localStorage.getItem("slimsyfit-freeapp:v1:guest")) return;
    localStorage.setItem("slimsyfit-freeapp:v1:guest", JSON.stringify({
      profile: { name: "Karthi", weightUnit: "lbs", diet: "Vegetarian", activityGoal: 30, waterGoalMl: 2000, sleepGoal: 8 },
      days: {}, fasting: { activeStart: null, completed: [] }
    }));
  });
  await page.goto("/");
  await page.locator(".navitem", { hasText: "Nutrition" }).click();
  await page.getByText("Add your own meal").click();

  // Build: 2 rotis + 1 katori dal → (80 g × 297 + 150 g × 116)/100 = 238 + 174 = 412 kcal
  await page.getByLabel("Search foods").fill("chapati");
  await page.getByRole("button", { name: "Add Roti / chapati (whole wheat)" }).click();
  await page.getByRole("button", { name: "More Roti / chapati (whole wheat)" }).click(); // 1 → 1.5
  await page.getByLabel("Quantity of Roti / chapati (whole wheat)").fill("2");
  await page.getByLabel("Search foods").fill("dal");
  await page.getByRole("button", { name: /^Add Dal, cooked/ }).click();
  await expect(page.getByLabel("Meal total")).toContainText("412 kcal");
  await page.screenshot({ path: "test-results/" + test.info().project.name + "-meal-builder.png", fullPage: true });

  // Save as a 2-serving recipe → 206 kcal per serving
  await page.getByLabel("Meal name").fill("Roti dal");
  await page.getByRole("button", { name: "Save to My meals" }).click();
  await page.getByLabel("This makes how many servings?").fill("2");
  await expect(page.getByText(/206 kcal .* per serving/)).toBeVisible();
  await page.getByRole("button", { name: "Save to My meals" }).click();
  await expect(page.getByText("Saved to My meals.")).toBeVisible();

  // Log from My meals in one tap
  await page.getByRole("tab", { name: "My meals (1)" }).click();
  await page.getByLabel("Servings of Roti dal").selectOption("1.5");
  await page.getByRole("button", { name: "Log Roti dal" }).click();
  await expect(page.locator(".mb-log-row")).toContainText("Roti dal (1.5 servings)");
  await expect(page.locator(".mb-log-row")).toContainText("309 kcal");

  // Saved meals persist across reload
  await page.reload();
  await page.locator(".navitem", { hasText: "Nutrition" }).click();
  await page.getByText("Add your own meal").click();
  await page.getByRole("tab", { name: "My meals (1)" }).click();
  await expect(page.getByText("Recipe · 2 servings")).toBeVisible();

  // Photo diary: attach, view, persists on reload, removed with the entry
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==", "base64");
  await page.locator('input[type=file][data-testid^="meal-photo-input-"]').first().setInputFiles({ name: "meal.png", mimeType: "image/png", buffer: png });
  await expect(page.getByRole("button", { name: "View photo of Roti dal (1.5 servings)" })).toBeVisible();
  await page.reload();
  await page.locator(".navitem", { hasText: "Nutrition" }).click();
  await page.getByRole("button", { name: "View photo of Roti dal (1.5 servings)" }).click();
  await expect(page.getByRole("dialog", { name: /Photo of Roti dal/ })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Remove Roti dal (1.5 servings)" }).click();
  await expect(page.locator(".mb-log-row")).toHaveCount(0);
  const left = await page.evaluate(() => new Promise(r => { const q = indexedDB.open("slimsyfit-freeapp-photos", 1); q.onsuccess = () => { const c = q.result.transaction("meal-photos").objectStore("meal-photos").count(); c.onsuccess = () => r(c.result); }; }));
  expect(left).toBe(0);
  expect(errors).toEqual([]);
});
