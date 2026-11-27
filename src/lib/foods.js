// Built-in food list for manual meal building (no AI, works offline).
// Values are per 100 g as eaten (cooked where relevant), rounded, from USDA
// FoodData Central standard entries and common Indian home-recipe references.
// They are approximations: brands and recipes vary.
//
// Row format: [id, name, category, kcal, protein g, carbs g, fat g, servings]
// servings: [[label, grams], ...] — the first is the default.

const RAW = [
  // Protein
  ["egg", "Egg, whole (boiled/scrambled)", "Protein", 155, 12.6, 1.1, 10.6, [["1 large egg", 50], ["2 eggs", 100]]],
  ["egg-white", "Egg white", "Protein", 52, 10.9, 0.7, 0.2, [["1 egg white", 33]]],
  ["chicken-breast", "Chicken breast, cooked", "Protein", 165, 31, 0, 3.6, [["100 g", 100], ["1 palm-size piece", 120]]],
  ["chicken-thigh", "Chicken thigh, cooked (skinless)", "Protein", 209, 26, 0, 10.9, [["1 thigh", 85], ["100 g", 100]]],
  ["chicken-curry", "Chicken curry (home style)", "Protein", 148, 13.5, 4.5, 8.5, [["1 katori", 150], ["1 cup", 240]]],
  ["salmon", "Salmon, cooked", "Protein", 206, 22, 0, 12, [["1 fillet", 120], ["100 g", 100]]],
  ["white-fish", "White fish (tilapia/cod), cooked", "Protein", 128, 26, 0, 2.7, [["1 fillet", 120], ["100 g", 100]]],
  ["tuna", "Tuna, canned in water (drained)", "Protein", 116, 25.5, 0, 0.8, [["1 can", 120], ["½ can", 60]]],
  ["shrimp", "Shrimp/prawns, cooked", "Protein", 99, 24, 0.2, 0.3, [["100 g", 100]]],
  ["beef-lean", "Lean ground beef 90%, cooked", "Protein", 217, 26.1, 0, 11.8, [["100 g", 100]]],
  ["goat", "Goat/mutton, cooked", "Protein", 143, 27, 0, 3, [["100 g", 100]]],
  ["tofu", "Tofu, firm", "Protein", 144, 17.3, 2.8, 8.7, [["100 g", 100], ["½ block", 200]]],
  ["tempeh", "Tempeh", "Protein", 192, 20.3, 7.6, 10.8, [["100 g", 100]]],
  ["paneer", "Paneer", "Protein", 265, 18.3, 1.2, 20.8, [["50 g", 50], ["100 g", 100]]],
  ["palak-paneer", "Palak paneer (home style)", "Protein", 142, 6.5, 5.5, 10.5, [["1 katori", 150]]],
  ["whey", "Whey protein powder (generic)", "Protein", 380, 78, 8, 5, [["1 scoop", 30]]],

  // Dairy
  ["greek-yogurt", "Greek yogurt, plain 2%", "Dairy", 73, 9.9, 3.9, 1.9, [["¾ cup", 170], ["1 cup", 227]]],
  ["curd", "Plain yogurt / curd (whole milk)", "Dairy", 61, 3.5, 4.7, 3.3, [["1 katori", 150], ["1 cup", 245]]],
  ["raita", "Raita", "Dairy", 60, 2.8, 4.8, 3.2, [["1 katori", 120]]],
  ["milk-whole", "Milk, whole", "Dairy", 61, 3.2, 4.8, 3.3, [["1 cup", 244], ["½ cup", 122]]],
  ["milk-2", "Milk, 2%", "Dairy", 50, 3.3, 4.8, 2.0, [["1 cup", 244], ["½ cup", 122]]],
  ["soy-milk", "Soy milk, unsweetened", "Dairy", 33, 2.9, 1.7, 1.6, [["1 cup", 243]]],
  ["cottage-cheese", "Cottage cheese, 2%", "Dairy", 84, 11, 4.3, 2.3, [["½ cup", 113]]],
  ["cheddar", "Cheddar cheese", "Dairy", 403, 24.9, 1.3, 33.1, [["1 slice", 28]]],

  // Legumes & dals
  ["lentils", "Lentils, cooked", "Legumes", 116, 9, 20.1, 0.4, [["1 cup", 198], ["½ cup", 99]]],
  ["dal", "Dal, cooked (toor/moong, home style)", "Legumes", 116, 6.8, 16, 2.9, [["1 katori", 150], ["1 cup", 240]]],
  ["sambar", "Sambar", "Legumes", 65, 3, 9, 2, [["1 katori", 150], ["1 cup", 240]]],
  ["chickpeas", "Chickpeas, cooked", "Legumes", 164, 8.9, 27.4, 2.6, [["½ cup", 82], ["1 cup", 164]]],
  ["chole", "Chole / chana masala", "Legumes", 140, 6, 18, 5, [["1 katori", 150]]],
  ["rajma", "Rajma curry", "Legumes", 118, 5.5, 15, 4, [["1 katori", 150]]],
  ["kidney-beans", "Kidney beans, cooked", "Legumes", 127, 8.7, 22.8, 0.5, [["½ cup", 89]]],
  ["black-beans", "Black beans, cooked", "Legumes", 132, 8.9, 23.7, 0.5, [["½ cup", 86]]],
  ["edamame", "Edamame, shelled", "Legumes", 121, 11.9, 8.9, 5.2, [["½ cup", 78], ["¾ cup", 115]]],
  ["hummus", "Hummus", "Legumes", 166, 7.9, 14.3, 9.6, [["2 tbsp", 30], ["¼ cup", 60]]],

  // Grains & breads
  ["white-rice", "White rice, cooked", "Grains", 130, 2.7, 28.2, 0.3, [["1 cup", 158], ["½ cup", 79]]],
  ["brown-rice", "Brown rice, cooked", "Grains", 123, 2.7, 25.6, 1.0, [["1 cup", 195], ["⅔ cup", 130]]],
  ["quinoa", "Quinoa, cooked", "Grains", 120, 4.4, 21.3, 1.9, [["1 cup", 185], ["½ cup", 92]]],
  ["oats", "Rolled oats, dry", "Grains", 379, 13.2, 67.7, 6.5, [["½ cup", 40], ["⅓ cup", 27]]],
  ["roti", "Roti / chapati (whole wheat)", "Grains", 297, 9.8, 46, 7.5, [["1 roti", 40], ["2 rotis", 80]]],
  ["paratha", "Paratha, plain", "Grains", 320, 7, 43, 13.5, [["1 paratha", 80]]],
  ["naan", "Naan", "Grains", 290, 9, 50, 5.6, [["1 piece", 90]]],
  ["idli", "Idli", "Grains", 132, 4.4, 27, 0.6, [["1 idli", 40], ["3 idlis", 120]]],
  ["dosa", "Dosa, plain", "Grains", 168, 3.9, 29, 3.7, [["1 dosa", 80]]],
  ["upma", "Upma", "Grains", 141, 3.5, 21, 4.6, [["1 cup", 200]]],
  ["poha", "Poha", "Grains", 130, 2.6, 23, 3, [["1 cup", 150]]],
  ["khichdi", "Khichdi", "Grains", 110, 4, 18, 2.4, [["1 cup", 200]]],
  ["bread-ww", "Whole-wheat bread", "Grains", 252, 12.4, 42.7, 3.5, [["1 slice", 32], ["2 slices", 64]]],
  ["bread-white", "White bread", "Grains", 266, 8.9, 49, 3.3, [["1 slice", 28]]],
  ["pasta", "Pasta, cooked", "Grains", 158, 5.8, 30.9, 0.9, [["1 cup", 140]]],
  ["corn-tortilla", "Corn tortilla", "Grains", 218, 5.7, 44.6, 2.9, [["1 tortilla", 26]]],
  ["potato", "Potato, boiled", "Grains", 87, 1.9, 20, 0.1, [["1 medium", 150]]],
  ["sweet-potato", "Sweet potato, baked", "Grains", 90, 2, 20.7, 0.2, [["1 medium", 130]]],
  ["popcorn", "Popcorn, air-popped", "Grains", 387, 12.9, 77.8, 4.5, [["3 cups", 24]]],

  // Fruit
  ["apple", "Apple", "Fruit", 52, 0.3, 13.8, 0.2, [["1 medium", 182]]],
  ["banana", "Banana", "Fruit", 89, 1.1, 22.8, 0.3, [["1 medium", 118]]],
  ["orange", "Orange", "Fruit", 47, 0.9, 11.8, 0.1, [["1 medium", 131]]],
  ["blueberries", "Blueberries", "Fruit", 57, 0.7, 14.5, 0.3, [["1 cup", 148], ["½ cup", 74]]],
  ["strawberries", "Strawberries", "Fruit", 32, 0.7, 7.7, 0.3, [["1 cup", 152]]],
  ["mango", "Mango", "Fruit", 60, 0.8, 15, 0.4, [["1 cup", 165]]],
  ["grapes", "Grapes", "Fruit", 69, 0.7, 18.1, 0.2, [["1 cup", 151]]],
  ["papaya", "Papaya", "Fruit", 43, 0.5, 10.8, 0.3, [["1 cup", 145]]],
  ["pear", "Pear", "Fruit", 57, 0.4, 15.2, 0.1, [["1 medium", 178]]],
  ["watermelon", "Watermelon", "Fruit", 30, 0.6, 7.6, 0.2, [["1 cup", 152]]],
  ["avocado", "Avocado", "Fruit", 160, 2, 8.5, 14.7, [["½ avocado", 75], ["⅓ avocado", 50]]],
  ["dates", "Dates (Medjool)", "Fruit", 277, 1.8, 75, 0.2, [["1 date", 24]]],

  // Vegetables
  ["broccoli", "Broccoli, cooked", "Vegetables", 35, 2.4, 7.2, 0.4, [["1 cup", 156]]],
  ["spinach", "Spinach, raw", "Vegetables", 23, 2.9, 3.6, 0.4, [["2 cups", 60]]],
  ["salad-greens", "Salad greens", "Vegetables", 15, 1.4, 2.9, 0.2, [["2 cups", 94]]],
  ["tomato", "Tomato", "Vegetables", 18, 0.9, 3.9, 0.2, [["1 medium", 123]]],
  ["cucumber", "Cucumber", "Vegetables", 15, 0.7, 3.6, 0.1, [["½ cucumber", 150]]],
  ["carrot", "Carrot", "Vegetables", 41, 0.9, 9.6, 0.2, [["1 medium", 61]]],
  ["onion", "Onion", "Vegetables", 40, 1.1, 9.3, 0.1, [["1 medium", 110]]],
  ["bell-pepper", "Bell pepper", "Vegetables", 31, 1, 6, 0.3, [["1 medium", 119]]],
  ["cauliflower", "Cauliflower, cooked", "Vegetables", 23, 1.8, 4.1, 0.5, [["1 cup", 124]]],
  ["green-beans", "Green beans, cooked", "Vegetables", 35, 1.9, 7.9, 0.3, [["1 cup", 125]]],
  ["mushrooms", "Mushrooms", "Vegetables", 22, 3.1, 3.3, 0.3, [["1 cup", 70]]],
  ["peas", "Green peas, cooked", "Vegetables", 84, 5.4, 15.6, 0.2, [["½ cup", 80]]],
  ["sabzi", "Mixed vegetable sabzi (with oil)", "Vegetables", 95, 2.5, 9, 5.5, [["1 katori", 150]]],

  // Fats, nuts & seeds
  ["olive-oil", "Olive oil", "Fats & nuts", 884, 0, 0, 100, [["1 tsp", 4.5], ["1 tbsp", 13.5]]],
  ["ghee", "Ghee", "Fats & nuts", 876, 0.3, 0, 99.5, [["1 tsp", 5], ["1 tbsp", 14]]],
  ["butter", "Butter", "Fats & nuts", 717, 0.9, 0.1, 81, [["1 tsp", 5], ["1 tbsp", 14]]],
  ["peanut-butter", "Peanut butter", "Fats & nuts", 588, 25, 20, 50, [["1 tbsp", 16]]],
  ["almonds", "Almonds", "Fats & nuts", 579, 21.2, 21.6, 49.9, [["10 almonds", 12], ["¼ cup", 35]]],
  ["walnuts", "Walnuts", "Fats & nuts", 654, 15.2, 13.7, 65.2, [["¼ cup", 30]]],
  ["peanuts", "Peanuts", "Fats & nuts", 567, 25.8, 16.1, 49.2, [["1 handful", 28]]],
  ["cashews", "Cashews", "Fats & nuts", 553, 18.2, 30.2, 43.9, [["1 handful", 28]]],
  ["chia", "Chia seeds", "Fats & nuts", 486, 16.5, 42.1, 30.7, [["1 tbsp", 12]]],
  ["pumpkin-seeds", "Pumpkin seeds", "Fats & nuts", 559, 30.2, 10.7, 49, [["1 tbsp", 9]]],
  ["flax", "Flaxseed, ground", "Fats & nuts", 534, 18.3, 28.9, 42.2, [["1 tbsp", 7]]],

  // Drinks, snacks & extras
  ["chai", "Chai with milk & sugar", "Drinks & snacks", 45, 1.5, 6.5, 1.5, [["1 cup", 150]]],
  ["black-coffee", "Black coffee / tea", "Drinks & snacks", 1, 0.1, 0, 0, [["1 cup", 240]]],
  ["orange-juice", "Orange juice", "Drinks & snacks", 45, 0.7, 10.4, 0.2, [["1 cup", 248]]],
  ["sugar", "Sugar", "Drinks & snacks", 387, 0, 100, 0, [["1 tsp", 4.2]]],
  ["honey", "Honey", "Drinks & snacks", 304, 0.3, 82.4, 0, [["1 tsp", 7], ["1 tbsp", 21]]],
  ["dark-chocolate", "Dark chocolate 70–85%", "Drinks & snacks", 598, 7.8, 45.9, 42.6, [["2 squares", 20]]],
  ["samosa", "Samosa", "Drinks & snacks", 262, 4.5, 30, 14, [["1 samosa", 70]]],
  ["pizza", "Cheese pizza", "Drinks & snacks", 266, 11.4, 33, 9.7, [["1 slice", 107]]],
  ["protein-bar", "Protein bar (generic)", "Drinks & snacks", 380, 33, 37, 11, [["1 bar", 60]]]
];

export const FOODS = RAW.map(([id, name, category, kcal, protein, carbs, fat, servings]) => ({
  id, name, category, per100: { calories: kcal, protein, carbs, fat },
  servings: servings.map(([label, grams]) => ({ label, grams }))
}));
export const FOOD_CATEGORIES = [...new Set(FOODS.map(f => f.category))];
const byId = Object.fromEntries(FOODS.map(f => [f.id, f]));
export const getFood = id => byId[id] || null;

const r1 = n => Math.round(n * 10) / 10;
/** Nutrition for a given weight in grams of one food. */
export function foodNutrition(food, grams) {
  const g = Math.max(0, Number(grams) || 0), k = g / 100, p = food.per100;
  return { calories: Math.round(p.calories * k), protein: r1(p.protein * k), carbs: r1(p.carbs * k), fat: r1(p.fat * k) };
}
/** Builder item: { foodId, servingIndex, qty } or { foodId, grams } (custom weight). */
export function itemGrams(item) {
  const food = getFood(item.foodId);
  if (!food) return 0;
  if (item.grams != null) return Math.max(0, Number(item.grams) || 0);
  const s = food.servings[item.servingIndex || 0] || food.servings[0];
  return s.grams * Math.max(0, Number(item.qty) || 0);
}
export function itemNutrition(item) {
  const food = getFood(item.foodId);
  return food ? foodNutrition(food, itemGrams(item)) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
}
export function sumNutrition(list) {
  const t = list.reduce((a, n) => ({ calories: a.calories + n.calories, protein: a.protein + n.protein, carbs: a.carbs + n.carbs, fat: a.fat + n.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  return { calories: Math.round(t.calories), protein: r1(t.protein), carbs: r1(t.carbs), fat: r1(t.fat) };
}
export const itemsTotal = items => sumNutrition(items.map(itemNutrition));
/** Divide a total by servings (recipe → per serving), rounded like everything else. */
export function perServing(total, servings) {
  const s = Math.max(1, Number(servings) || 1);
  return { calories: Math.round(total.calories / s), protein: r1(total.protein / s), carbs: r1(total.carbs / s), fat: r1(total.fat / s) };
}
export const scaleNutrition = (n, factor) => {
  const f = Math.max(0, Number(factor) || 0);
  return { calories: Math.round(n.calories * f), protein: r1(n.protein * f), carbs: r1(n.carbs * f), fat: r1(n.fat * f) };
};
export function itemLabel(item) {
  const food = getFood(item.foodId);
  if (!food) return "Unknown food";
  if (item.grams != null) return `${item.grams} g ${food.name}`;
  const s = food.servings[item.servingIndex || 0] || food.servings[0];
  const q = Number(item.qty);
  return `${q === 1 ? "" : q + " × "}${s.label} ${food.name}`.trim();
}
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
/** Simple word-prefix search; also matches common aliases. */
const ALIASES = { chapati: "roti", phulka: "roti", curd: "curd", dahi: "curd", prawn: "shrimp", mutton: "goat", oatmeal: "oats", chana: "chole", kadala: "chickpeas", chawal: "white-rice", rice: "white-rice", tea: "chai", coffee: "black-coffee", yoghurt: "greek-yogurt" };
export function searchFoods(query, limit = 12) {
  const q = norm(query.trim());
  if (!q) return [];
  const words = q.split(/\s+/);
  const scored = [];
  for (const f of FOODS) {
    const name = norm(f.name);
    if (words.every(w => name.includes(w))) scored.push([name.startsWith(words[0]) ? 0 : name.split(/[\s(,/]+/).some(t => t.startsWith(words[0])) ? 1 : 2, f]);
  }
  const alias = ALIASES[q];
  if (alias && byId[alias] && !scored.some(([, f]) => f.id === alias)) scored.unshift([-1, byId[alias]]);
  return scored.sort((a, b) => a[0] - b[0]).slice(0, limit).map(([, f]) => f);
}
