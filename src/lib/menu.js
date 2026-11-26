// Today's Menu — dishes match the original SlimSyFit shared/dietary-menu.js.
// Portions and nutrition are approximate, calculated from standard food values,
// for a moderate ~1,400–1,700 kcal day. They are illustrative, not prescriptions.
const D = "/images/nutrition/diet/";

export const MENUS = {
  "Non-vegetarian": [
    { meal: "Breakfast", time: "8:00 AM", title: "Egg avocado toast", image: D + "non-vegetarian-breakfast.png",
      description: "Eggs, avocado and whole-grain toast.", protein: "Eggs",
      ingredients: ["2 eggs, scrambled or poached", "⅓ ripe avocado, mashed", "1 slice whole-grain bread, toasted", "5 cherry tomatoes, halved", "Pinch of salt, black pepper and chili flakes"],
      steps: ["Toast the bread and spread with mashed avocado.", "Cook the eggs in a non-stick pan with no added oil, or poach for 3–4 minutes.", "Top the toast with eggs and tomatoes; season to taste."],
      swaps: ["Use 3 egg whites + 1 egg for more protein, fewer calories", "Swap toast for a small whole-wheat wrap"],
      nutrition: { calories: 320, protein: 17, carbs: 22, fat: 18 } },
    { meal: "Lunch", time: "12:00 PM", title: "Chicken quinoa salad", image: D + "non-vegetarian-lunch.png",
      description: "Grilled chicken, quinoa, cucumber, tomato and leafy greens.", protein: "Chicken and quinoa",
      ingredients: ["100 g grilled chicken breast (cooked weight)", "½ cup cooked quinoa", "½ cucumber, diced", "1 tomato, diced", "2 cups leafy greens", "Dressing: 2 tsp olive oil, lemon juice, salt, pepper"],
      steps: ["Season chicken with salt, pepper and paprika; grill 6–7 minutes per side until cooked through.", "Toss greens, quinoa, cucumber and tomato.", "Slice the chicken on top and drizzle with the lemon–olive oil dressing."],
      swaps: ["Turkey or canned tuna instead of chicken", "Brown rice or couscous instead of quinoa"],
      nutrition: { calories: 390, protein: 37, carbs: 26, fat: 15 } },
    { meal: "Snacks", time: "3:30 PM", title: "Greek yogurt and berries", image: D + "non-vegetarian-snacks.png",
      description: "Plain Greek yogurt with fresh berries.", protein: "Greek yogurt",
      ingredients: ["¾ cup (170 g) plain Greek yogurt, 2%", "½ cup mixed berries", "Optional: dash of cinnamon"],
      steps: ["Spoon yogurt into a bowl.", "Top with berries and cinnamon."],
      swaps: ["Cottage cheese instead of yogurt", "Apple or banana slices instead of berries"],
      nutrition: { calories: 180, protein: 17, carbs: 16, fat: 4 } },
    { meal: "Dinner", time: "6:00 PM", title: "Salmon vegetable rice bowl", image: D + "non-vegetarian-dinner.png",
      description: "Salmon, broccoli, carrots and brown rice.", protein: "Salmon",
      ingredients: ["120 g salmon fillet (cooked weight)", "⅔ cup cooked brown rice", "1 cup broccoli florets", "1 carrot, sliced", "1 tsp olive oil, garlic, lemon, salt and pepper"],
      steps: ["Bake salmon at 200 °C / 400 °F for 12–15 minutes with lemon, garlic and pepper.", "Steam or roast broccoli and carrots with the olive oil.", "Serve over brown rice."],
      swaps: ["Cod, tilapia or chicken thigh instead of salmon", "Cauliflower rice for a lighter bowl"],
      nutrition: { calories: 480, protein: 32, carbs: 42, fat: 20 } }
  ],
  Vegetarian: [
    { meal: "Breakfast", time: "8:00 AM", title: "Greek yogurt berry oats", image: D + "vegetarian-breakfast.png",
      description: "Plain Greek yogurt, oats, berries and pumpkin seeds.", protein: "Greek yogurt and pumpkin seeds",
      ingredients: ["¾ cup (170 g) plain Greek yogurt, 2%", "⅓ cup rolled oats", "½ cup berries", "1 tbsp pumpkin seeds"],
      steps: ["Stir oats into the yogurt (or soak overnight for a softer texture).", "Top with berries and pumpkin seeds."],
      swaps: ["Hung curd instead of Greek yogurt", "Chia or sunflower seeds instead of pumpkin seeds"],
      nutrition: { calories: 340, protein: 24, carbs: 35, fat: 11 } },
    { meal: "Lunch", time: "12:00 PM", title: "Paneer chickpea salad", image: D + "vegetarian-lunch.png",
      description: "Paneer, chickpeas, cucumber, tomato and whole-grain bread.", protein: "Paneer and chickpeas",
      ingredients: ["60 g paneer, cubed and pan-seared", "½ cup cooked chickpeas", "½ cucumber and 1 tomato, diced", "1 slice whole-grain bread", "1 tsp olive oil, lemon, chaat masala or cumin"],
      steps: ["Sear paneer cubes in a dry non-stick pan until golden.", "Toss with chickpeas, cucumber, tomato, lemon, olive oil and spices.", "Serve with the bread on the side."],
      swaps: ["Tofu or low-fat cottage cheese instead of paneer", "Kidney beans instead of chickpeas"],
      nutrition: { calories: 470, protein: 23, carbs: 43, fat: 23 } },
    { meal: "Snacks", time: "3:30 PM", title: "Yogurt and fruit", image: D + "vegetarian-snacks.png",
      description: "Plain yogurt with fruit and a small handful of nuts.", protein: "Yogurt and nuts",
      ingredients: ["¾ cup plain low-fat yogurt", "1 cup chopped fruit (apple, papaya or berries)", "10 almonds"],
      steps: ["Combine yogurt and fruit.", "Sprinkle chopped almonds on top."],
      swaps: ["Walnuts or pistachios instead of almonds", "Roasted chana instead of nuts"],
      nutrition: { calories: 250, protein: 12, carbs: 32, fat: 9 } },
    { meal: "Dinner", time: "6:00 PM", title: "Lentil vegetable rice bowl", image: D + "vegetarian-dinner.png",
      description: "Lentils, spinach, roasted carrots and brown rice.", protein: "Lentils",
      ingredients: ["¾ cup cooked lentils (dal)", "⅔ cup cooked brown rice", "1 cup spinach, wilted", "1 cup carrots, roasted", "1 tsp olive oil, turmeric, cumin, garlic"],
      steps: ["Cook lentils with turmeric, cumin and garlic until soft.", "Roast carrots with the olive oil at 200 °C / 400 °F for 20 minutes; wilt spinach into the lentils.", "Serve lentils and carrots over brown rice."],
      swaps: ["Moong or masoor dal", "Millet or quinoa instead of rice"],
      nutrition: { calories: 425, protein: 18, carbs: 73, fat: 7 } }
  ],
  Vegan: [
    { meal: "Breakfast", time: "8:00 AM", title: "Apple overnight oats", image: D + "vegan-breakfast.png",
      description: "Oats, unsweetened soy milk, apple, pumpkin seeds and peanut butter.", protein: "Soy milk, pumpkin seeds and peanut butter",
      ingredients: ["½ cup rolled oats", "¾ cup unsweetened soy milk", "1 small apple, diced", "1 tbsp pumpkin seeds", "1 tbsp peanut butter", "Cinnamon to taste"],
      steps: ["Mix oats, soy milk and cinnamon in a jar; refrigerate overnight.", "In the morning, top with apple, pumpkin seeds and peanut butter."],
      swaps: ["Pea-protein milk instead of soy milk", "Almond butter instead of peanut butter"],
      nutrition: { calories: 440, protein: 17, carbs: 54, fat: 19 } },
    { meal: "Lunch", time: "12:00 PM", title: "Chickpea spinach rice bowl", image: D + "vegan-lunch.png",
      description: "Chickpeas, spinach, tomatoes and brown rice.", protein: "Chickpeas",
      ingredients: ["¾ cup cooked chickpeas", "⅔ cup cooked brown rice", "2 cups spinach", "1 tomato, chopped", "1 tsp olive oil, garlic, cumin, lemon"],
      steps: ["Sauté garlic and cumin in the oil, add tomato and cook 3 minutes.", "Add chickpeas and spinach; cook until spinach wilts.", "Serve over brown rice with a squeeze of lemon."],
      swaps: ["Black beans instead of chickpeas", "Quinoa instead of brown rice"],
      nutrition: { calories: 420, protein: 16, carbs: 69, fat: 9 } },
    { meal: "Snacks", time: "3:30 PM", title: "Edamame and pear", image: D + "vegan-snacks.png",
      description: "Steamed edamame with a fresh pear.", protein: "Edamame",
      ingredients: ["¾ cup shelled edamame", "1 medium pear", "Pinch of sea salt"],
      steps: ["Steam or microwave edamame for 3–4 minutes; sprinkle with salt.", "Serve with the sliced pear."],
      swaps: ["Roasted chickpeas instead of edamame", "Apple or orange instead of pear"],
      nutrition: { calories: 250, protein: 14, carbs: 37, fat: 6 } },
    { meal: "Dinner", time: "6:00 PM", title: "Ginger tofu quinoa bowl", image: D + "vegan-dinner.png",
      description: "Tofu, broccoli, carrots, quinoa and ginger.", protein: "Tofu and quinoa",
      ingredients: ["150 g firm tofu, cubed", "¾ cup cooked quinoa", "1 cup broccoli florets", "1 carrot, sliced", "1 tsp sesame oil, 1 tbsp low-sodium soy sauce, fresh ginger and garlic"],
      steps: ["Press tofu for 10 minutes, then pan-sear in sesame oil until golden.", "Add ginger, garlic, broccoli and carrot; stir-fry 4–5 minutes.", "Splash with soy sauce and serve over quinoa."],
      swaps: ["Tempeh instead of tofu", "Brown rice or soba noodles instead of quinoa"],
      nutrition: { calories: 500, protein: 35, carbs: 46, fat: 21 } }
  ]
};

export function menuDiet(diet) {
  return diet === "Vegan" ? "Vegan" : diet === "Vegetarian" ? "Vegetarian" : "Non-vegetarian";
}
export function menuFor(diet) { return MENUS[menuDiet(diet)]; }
export function menuTotals(meals) {
  return meals.reduce((t, m) => ({
    calories: t.calories + m.nutrition.calories, protein: t.protein + m.nutrition.protein,
    carbs: t.carbs + m.nutrition.carbs, fat: t.fat + m.nutrition.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
/** Nutrition-tab meal type used when logging a menu item. */
export const logType = meal => meal === "Snacks" ? "Snack" : meal;
