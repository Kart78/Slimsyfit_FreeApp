import {test,expect} from "@playwright/test";

test("original-style Home, Hydration, Weight, Plan and Results pages remain functional",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.addInitScript(()=>{
   localStorage.setItem("slimsyfit-freeapp:guest-active","1");
   // Seed once. Re-running this init script on reload must not overwrite saved edits.
   if(localStorage.getItem("slimsyfit-freeapp:v1:guest"))return;
   const today=(()=>{
     const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
   })();
   localStorage.setItem("slimsyfit-freeapp:v1:guest",JSON.stringify({
     profile:{name:"Karthik",gender:"Male",age:"26-35",height:"5'8\"",currentWeight:"180 lbs",targetWeight:"165 lbs",
       weightUnit:"lbs",diet:"Non-vegetarian",activityGoal:30,waterGoalMl:2000,sleepGoal:8,fastingHours:12,fastingAllowed:true},
     days:{[today]:{weight:178,waterMl:0,meals:[],activity:[],habits:{}}},
     fasting:{activeStart:null,completed:[]}
   }));
 });
 await page.goto("/");
 await expect(page.getByText("TODAY’S PRIORITY")).toBeVisible();
 await expect(page.getByText("YOUR PERSONAL PLAN")).toBeVisible();
 await expect(page.getByText("LATEST HEALTH METRICS")).toBeVisible();
 await expect(page.getByRole("heading",{name:"Weight & Progress"})).toBeVisible();
 await page.screenshot({path:"test-results/"+test.info().project.name+"-home-parity.png",fullPage:true});

 await page.locator(".original-tile").filter({hasText:"Hydration"}).click();
 await expect(page.getByRole("heading",{name:"Hydration",exact:true})).toBeVisible();
 await expect(page.getByRole("img",{name:"0 of 8 cups"})).toBeVisible();
 await page.getByRole("button",{name:"Add a cup"}).click();
 await expect(page.getByRole("img",{name:"1 of 8 cups"})).toBeVisible();
 await page.getByRole("button",{name:"Remove a cup"}).click();
 await expect(page.getByRole("img",{name:"0 of 8 cups"})).toBeVisible();
 await page.screenshot({path:"test-results/"+test.info().project.name+"-hydration-parity.png",fullPage:true});
 await page.getByRole("button",{name:"Back"}).click();

 await page.locator(".original-tile").filter({hasText:"Weight & Progress"}).click();
 await expect(page.getByRole("heading",{name:"Weight & Progress"})).toBeVisible();
 await expect(page.getByRole("heading",{name:"Weight Trend"})).toBeVisible();
 await expect(page.getByText("Recent weigh-ins")).toBeVisible();
 await page.getByRole("spinbutton",{name:"Weight (lbs)"}).fill("177");
 await page.getByRole("button",{name:"Save",exact:true}).click();
 await expect(page.getByText("177 lbs").first()).toBeVisible();
 await page.screenshot({path:"test-results/"+test.info().project.name+"-weight-parity.png",fullPage:true});
 await page.getByRole("button",{name:"Back"}).click();

 await page.getByRole("button",{name:"Nutrition",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Today's Menu"})).toBeVisible();
 for(const meal of ["Breakfast","Lunch","Snacks","Dinner"])await expect(page.locator(".sf-meal-label b",{hasText:meal})).toBeVisible();
 await expect(page.locator(".sf-meal img")).toHaveCount(4);
 // Non-vegetarian dishes and diet-specific photos match the original SlimSyFit menu.
 for(const dish of ["Egg avocado toast","Chicken quinoa salad","Greek yogurt and berries","Salmon vegetable rice bowl"])await expect(page.getByRole("heading",{name:dish})).toBeVisible();
 await expect(page.locator(".sf-meal img").nth(2)).toHaveAttribute("src",/non-vegetarian-snacks/);
 await page.getByRole("button",{name:/Breakfast/}).first().click();
 await expect(page.getByRole("heading",{name:"Ingredients"})).toBeVisible();
 await expect(page.getByText("2 eggs, scrambled or poached")).toBeVisible();
 await page.getByRole("tab",{name:"Vegan"}).click();
 for(const dish of ["Apple overnight oats","Chickpea spinach rice bowl","Edamame and pear","Ginger tofu quinoa bowl"])await expect(page.getByRole("heading",{name:dish})).toBeVisible();
 await page.screenshot({path:"test-results/"+test.info().project.name+"-nutrition-menu.png",fullPage:true});
 await page.getByRole("button",{name:"Plan",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Your Plan"})).toBeVisible();
 await expect(page.locator(".sf-meal")).toHaveCount(0);
 await expect(page.getByRole("heading",{name:"Your 4-week program"})).toBeVisible();
 await page.getByRole("checkbox",{name:"Moved my body"}).check();
 await expect(page.getByText("1/4 done")).toBeVisible();
 await page.getByLabel("Hours slept").fill("7.5");
 await page.getByRole("button",{name:"Save",exact:true}).click();
 await expect(page.getByText("7.5 h")).toBeVisible();
 await page.screenshot({path:"test-results/"+test.info().project.name+"-plan-parity.png",fullPage:true});
 await page.getByRole("button",{name:"Results",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Results & Insights"})).toBeVisible();
 await expect(page.getByRole("heading",{name:"Weight Trend (lbs)"})).toBeVisible();
 for(const range of ["1W","1M","3M","6M","1Y"])await page.getByRole("button",{name:range,exact:true}).click();
 await page.getByRole("tab",{name:/Health Metrics/}).click();
 await expect(page.getByRole("heading",{name:"Your latest result"})).toBeVisible();
 await page.getByRole("tab",{name:/Achievements/}).click();
 await expect(page.getByText("My achievements")).toBeVisible();
 await page.getByRole("tab",{name:/Weekly/}).click();
 await expect(page.getByRole("heading",{name:"Day by day"})).toBeVisible();
 await expect(page.getByRole("tab",{name:/Mood/})).toHaveCount(0);
 await page.getByRole("tab",{name:/Overview/}).click();
 await page.screenshot({path:"test-results/"+test.info().project.name+"-results-parity.png",fullPage:true});
 await expect.poll(async()=>page.evaluate(()=>{
   const value=JSON.parse(localStorage.getItem("slimsyfit-freeapp:v1:guest")||"{}");
   const d=new Date(),today=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
   return value.days?.[today]?.weight;
 })).toBe(177);
 await page.reload();
 await expect(page.getByText("TODAY’S PRIORITY")).toBeVisible();
 await page.locator(".original-tile").filter({hasText:"Weight & Progress"}).click();
 await expect(page.getByText("177 lbs").first()).toBeVisible();
 expect(errors).toEqual([]);
});
