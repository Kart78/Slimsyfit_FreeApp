export const STEPS = [
  { id:"goal", q:"What's your main goal?", t:"single", opts:[
    {i:"🏋️",l:"Lose weight"},{i:"💪",l:"Build healthy habits"},
    {i:"⚡",l:"Boost energy"},{i:"🧘",l:"Improve wellness"}]},
  { id:"gender", q:"How do you describe your gender?", t:"single", opts:[
    {l:"Male"},{l:"Female"},{l:"Non-binary"},{l:"Prefer not to say"}]},
  { id:"age", q:"How old are you?", t:"single", opts:[
    {l:"18-25"},{l:"26-35"},{l:"36-45"},{l:"46-55"},{l:"56+"}]},
  { id:"bodyType", q:"Which body type describes you?", t:"single",
    sub:"Be honest — this personalizes your plan", opts:[
    {l:"Slim"},{l:"Average"},{l:"A bit overweight"},{l:"Overweight"},{l:"Obese"}]},
  { id:"targetBody", q:"What's your goal body type?", t:"single", opts:[
    {l:"Slim"},{l:"Athletic"},{l:"Average"},{l:"Curvy"}]},
  { id:"currentWeight", q:"Current weight?", t:"number", unit:["lbs","kg"], placeholder:"Enter weight" },
  { id:"targetWeight",  q:"Goal weight?",    t:"number", unit:["lbs","kg"], placeholder:"Enter weight" },
  { id:"height", q:"How tall are you?", t:"height" },
  { id:"activity", q:"How active are you?", t:"single", opts:[
    {i:"🛋️",l:"Sedentary"},{i:"🚶",l:"Lightly active (1-3/wk)"},
    {i:"🏃",l:"Moderately active (3-5/wk)"},{i:"💪",l:"Very active (6-7/wk)"}]},
  { id:"diet", q:"Your food preference?", t:"single", opts:[
    {i:"🌱",l:"Vegan"},{i:"🥗",l:"Vegetarian"},{i:"🍗",l:"Non-vegetarian"}]},
  { id:"meals", q:"Meals per day?", t:"single", opts:[
    {l:"1-2"},{l:"3"},{l:"4-5"},{l:"I snack all day"}]},
  { id:"sleep", q:"Hours of sleep?", t:"single", opts:[
    {l:"Less than 5"},{l:"5-6"},{l:"7-8"},{l:"More than 8"}]},
  { id:"water", q:"Daily water intake?", t:"single", opts:[
    {l:"Less than 1L"},{l:"1-2 liters"},{l:"2-3 liters"},{l:"More than 3L"}]},
  { id:"medicalSafety", q:"Before we suggest fasting, does any of this apply?", t:"single",
    sub:"Pregnant or nursing, underweight, diabetes, eating-disorder history, medication or a condition requiring regular meals", opts:[
    {l:"None of these apply"},{l:"One or more apply / I’m not sure"}]},
  { id:"fastingExp", q:"Tried intermittent fasting?", t:"single", opts:[
    {l:"Never heard of it"},{l:"Heard of it, never tried"},
    {l:"Tried a few times"},{l:"I fast regularly"}]},
  { id:"fastingWindow", q:"Which fasting schedule fits?", t:"single", opts:[
    {l:"12:12 — Beginner",d:"Fast 12h, eat 12h"},
    {l:"14:10 — Moderate",d:"A gentle step up"},
    {l:"16:8 — Popular",d:"May suit experienced adults"},
    {l:"18:6 — Advanced",d:"For experienced fasters"}]},
  { id:"barriers", q:"What's stopped you before?", t:"multi", sub:"Select all that apply", opts:[
    {i:"😩",l:"Lack of motivation"},{i:"🍫",l:"Cravings"},
    {i:"⏰",l:"No time"},{i:"📖",l:"Don't know where to start"},
    {i:"🤸",l:"Nothing seems to work"}]},
  { id:"timeline", q:"Any timeline motivating you?", t:"single", opts:[
    {i:"🚀",l:"In 1 month"},{i:"📅",l:"In 3 months"},
    {i:"🗓️",l:"In 6 months"},{i:"😌",l:"No specific date"}]}
];

