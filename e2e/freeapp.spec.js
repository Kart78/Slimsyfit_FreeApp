import { test, expect } from "@playwright/test";

test("original landing -> 18 survey questions -> local dashboard -> saved tracking", async ({ page }) => {
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Build a Healthier You, Your Way"})).toBeVisible();
  await expect(page.locator(".public-brand img")).toBeVisible();
  await page.screenshot({path:"test-results/"+test.info().project.name+"-landing.png",fullPage:true});
  await page.getByRole("button",{name:"Build my plan"}).click();

  const questions=[
    ["What's your main goal?","Build healthy habits"],
    ["How do you describe your gender?","Prefer not to say"],
    ["How old are you?","26-35"],
    ["Which body type describes you?","Average"],
    ["What's your goal body type?","Athletic"],
    ["Current weight?",null],
    ["Goal weight?",null],
    ["How tall are you?",null],
    ["How active are you?","Lightly active (1-3/wk)"],
    ["Your food preference?","Vegetarian"],
    ["Meals per day?","3"],
    ["Hours of sleep?","7-8"],
    ["Daily water intake?","2-3 liters"],
    ["Before we suggest fasting, does any of this apply?","None of these apply"],
    ["Tried intermittent fasting?","Never heard of it"],
    ["Which fasting schedule fits?","12:12 — Beginner"],
    ["What's stopped you before?","No time"],
    ["Any timeline motivating you?","No specific date"]
  ];
  for(let i=0;i<questions.length;i++){
    const [title,choice]=questions[i];
    await expect(page.getByRole("heading",{name:title,exact:true})).toBeVisible();
    if(i===5||i===6){
      await page.getByRole("spinbutton",{name:new RegExp(title.replace("?","\\?"))}).fill(i===5?"180":"170");
      await page.getByRole("button",{name:/Continue/}).click();
    }else if(i===7){
      await page.getByRole("spinbutton",{name:"Feet"}).fill("5");
      await page.getByRole("spinbutton",{name:"Inches"}).fill("8");
      await page.getByRole("button",{name:/Continue/}).click();
    }else{
      await page.getByRole("button",{name:new RegExp(choice.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))}).click();
      if(i===16)await page.getByRole("button",{name:/Continue/}).click();
    }
  }
  await expect(page.getByRole("heading",{name:"Your plan is ready!"})).toBeVisible();
  await page.getByRole("textbox",{name:"Your name"}).fill("Test User");
  await page.getByRole("button",{name:/Continue to Free Tracker/}).click();
  await expect(page.getByText("TODAY’S PRIORITY")).toBeVisible();
  await page.screenshot({path:"test-results/"+test.info().project.name+"-dashboard.png",fullPage:true});
  await expect(page.getByRole("heading",{name:"Nutrition"})).toBeVisible();
  await page.getByRole("button",{name:"Nutrition",exact:true}).last().click();
  await expect(page.getByRole("heading",{name:"Nutrition",exact:true})).toBeVisible();
  // Nutrition is meals only: menu + food log, no hydration/sleep/weight/activity cards.
  await expect(page.getByRole("heading",{name:"Today's Menu"})).toBeVisible();
  for(const gone of ["💧 Hydration","🌙 Sleep","⚖️ Weight","🚶 Activity","✅ Daily commitment"])
    await expect(page.getByRole("heading",{name:gone})).toHaveCount(0);
  await page.getByRole("button",{name:"Log this meal"}).first().click();
  await expect(page.getByRole("button",{name:"Logged"})).toHaveCount(1);
  await page.reload();
  await expect(page.getByText("TODAY’S PRIORITY")).toBeVisible();
  await page.getByRole("button",{name:"Nutrition",exact:true}).last().click();
  await expect(page.getByRole("button",{name:"Logged"})).toHaveCount(1);
  // Coach tab is gone; fasting lives in Plan.
  await expect(page.getByRole("button",{name:"Coach",exact:true})).toHaveCount(0);
  await expect(page.locator(".navitem")).toHaveCount(4);
  await page.getByRole("button",{name:"Plan",exact:true}).click();
  await page.getByRole("button",{name:/Open fasting timer/}).click();
  await expect(page.getByRole("heading",{name:"Fasting timer",exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
