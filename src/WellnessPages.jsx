import {useState,useEffect} from "react";
import {ArrowLeft,ArrowRight,Plus,Minus,ChevronRight,TrendingUp,Trophy,Check,ShieldCheck} from "lucide-react";
import {bmiValue,parseHeightCm,parseWeightKg,weightGoalProgress} from "./lib/metrics.js";
import {earnedBadges,levelInfo,localDay,safeNumber,rangeDates} from "./lib/tracker.js";
import "./wellness-pages.css";
const A="/assets/slimsyfit";
const dateLabel=date=>new Date(date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const weightRows=data=>Object.entries(data.days).filter(([,d])=>d.weight!=null&&Number(d.weight)>0).sort((a,b)=>a[0].localeCompare(b[0]));
const latestWeight=data=>weightRows(data).at(-1)?.[1].weight??null;
const displayWeight=(w,p)=>w==null?"—":Number(w)+" "+(p.weightUnit||"lbs");
const waterGoal=p=>Math.max(250,Number(p.waterGoalMl)||2000);
function Header({title,subtitle,onBack,action}){return <div className="sf-page-header">{onBack&&<button aria-label="Back" className="sf-back" onClick={onBack}><ArrowLeft size={18}/></button>}<div><h1>{title}</h1>{subtitle&&<small>{subtitle}</small>}</div>{action||null}</div>}
export function ColorMetrics({data}){
 const p=data.profile,w=latestWeight(data),bmi=bmiValue(p.height||p.heightCm,w,p.weightUnit);
 const age=Number(p.exactAge),h=parseHeightCm(p.height||p.heightCm),kg=parseWeightKg(w,p.weightUnit),sex=p.gender;
 const bmr=h&&kg&&Number.isInteger(age)&&age>=18&&age<=110&&(sex==="Male"||sex==="Female")?Math.round(10*kg+6.25*h-5*age+(sex==="Male"?5:-161)):null;
 const label=bmi==null?"Not available":bmi<18.5?"Underweight":bmi<25?"Normal":bmi<30?"Overweight":"High";
 return <div className="sf-metrics-trio">
  <div className="sf-metric blue"><img src={A+"/images/icons/scale.png"} alt="Scale"/><span>Weight</span><strong>{displayWeight(w,p)}</strong><small>{w==null?"Not logged":"Latest entry"}</small></div>
  <div className="sf-metric mint"><img src={A+"/images/icons/bmi-walking.png"} alt="Walking"/><span>BMI</span><strong>{bmi??"—"}</strong><small className="sf-bmi-label">{label}</small></div>
  <div className="sf-metric cream"><img src={A+"/images/icons/bmr-fire.png"} alt="Fire"/><span>BMR</span><strong>{bmr??"—"}</strong><small>{bmr==null?"Exact age needed":"cal/day · estimate"}</small></div>
 </div>;
}
export function WeightLine({records,unit="lbs",height=162}){
 const values=records.filter(([,d])=>Number.isFinite(Number(d.weight))).map(([date,d])=>({date,w:Number(d.weight)}));
 if(!values.length)return <div className="sf-empty">No weigh-ins yet. Log your first weight to see a trend.</div>;
 const min=Math.min(...values.map(x=>x.w)),max=Math.max(...values.map(x=>x.w)),lo=min-Math.max(.5,(max-min)*.2),hi=max+Math.max(.5,(max-min)*.2);
 const X=i=>values.length===1?165:15+300*i/(values.length-1);
 const Y=n=>120-98*(n-lo)/Math.max(1,hi-lo);
 return <div className="sf-line-plot"><svg viewBox={"0 0 330 "+height} preserveAspectRatio="none" role="img" aria-label={"Weight trend from "+values.length+" real check-ins"}>
   {[36,75,114].map(y=><line key={y} x1="15" y1={y} x2="315" y2={y} stroke="#E8F0EF"/>)}
   {values.length>1&&<polyline points={values.map((v,i)=>X(i)+","+Y(v.w)).join(" ")} fill="none" stroke="#0A8F84" strokeWidth="2.8" strokeLinejoin="round"/>}
   {values.map((v,i)=><circle key={v.date} cx={X(i)} cy={Y(v.w)} r="4.5" fill={i===values.length-1?"#0A8F84":"white"} stroke="#0A8F84" strokeWidth="2"><title>{dateLabel(v.date)+": "+v.w+" "+unit}</title></circle>)}
   <text x="15" y={height-8} fill="#7A9E9B" fontSize="11">{dateLabel(values[0].date)}</text>
   <text x="315" y={height-8} textAnchor="end" fill="#7A9E9B" fontSize="11">{dateLabel(values.at(-1).date)}</text>
 </svg></div>;
}
export function WaterView({data,today,onBack,onWater}){
 const p=data.profile,goal=waterGoal(p),ml=Number(data.days[today]?.waterMl)||0,drank=Math.round(ml/(goal/8)),radius=85,circ=2*Math.PI*radius;
 return <div className="sf-detail"><Header title="Hydration" subtitle="Daily water tracking" onBack={onBack}/>
  <div className="sf-water-card">
   <div className="sf-water-ring"><svg viewBox="0 0 220 220" role="img" aria-label={drank+" of 8 cups"}>
    <circle cx="110" cy="110" r={radius} stroke="#D8E9EC" strokeWidth="26" fill="none"/>
    <circle cx="110" cy="110" r={radius} stroke="#0A8F84" strokeWidth="26" fill="none" strokeDasharray={circ} strokeDashoffset={circ*(1-Math.min(1,ml/goal))} strokeLinecap="round" transform="rotate(-90 110 110)" style={{transition:"stroke-dashoffset .3s"}}/>
   </svg><div className="sf-water-value"><img src={A+"/images/icons/water-drop.png"} alt="Water drop"/><strong>{drank}</strong><span>of 8 cups</span></div></div>
   <div className="sf-water-controls">
    <button aria-label="Remove a cup" onClick={()=>onWater(-goal/8)} disabled={ml<=0}><Minus size={28}/></button>
    <div><img src={A+"/images/icons/water-glass.png"} alt="Glass of water"/><small>{ml} ml</small></div>
    <button className="add" aria-label="Add a cup" onClick={()=>onWater(goal/8)}><Plus size={30}/></button>
   </div><p className="sf-help">Each cup is {Math.round(goal/8)} ml. You can change the daily goal in Settings.</p>
  </div>
  <div className="sf-card"><h3>Last 7 days</h3><div className="sf-water-week">{rangeDates(today,7).map(date=><div className="sf-water-day" key={date}><div className="sf-water-track"><div style={{height:Math.min(100,100*(data.days[date]?.waterMl||0)/goal)+"%"}}/></div><small>{new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</small></div>)}</div></div>
 </div>;
}
export function WeightView({data,today,onBack,updateDay}){
 const p=data.profile,rows=weightRows(data),newest=latestWeight(data);const [value,setValue]=useState(newest==null?"":String(newest)),[showAll,setShowAll]=useState(false);
 useEffect(()=>setValue(newest==null?"":String(newest)),[newest]);
 const save=()=>{const n=safeNumber(value,600);if(n!==null&&n>0)updateDay(today,d=>({...d,weight:n}));};
 return <div className="sf-detail"><Header title="Weight & Progress" subtitle={rows.length+" weigh-ins logged"} onBack={onBack} action={<button type="button" className="sf-log-shortcut" onClick={()=>document.getElementById("sf-weight-log")?.scrollIntoView({behavior:"smooth",block:"center"})}><Plus size={13}/> Log Weight</button>}/>
  <img className="sf-weight-banner" src={A+"/images/wellness/weight-bmi-bmr.png"} alt="Wellness scale"/>
  <div className="sf-card"><h3>Your latest result</h3><ColorMetrics data={data}/></div>
  <div className="sf-card"><div className="sf-heading-row"><h3>Weight Trend</h3><button onClick={()=>setShowAll(!showAll)}>{showAll?"Show less":"Full history"}</button></div><WeightLine records={showAll?rows:rows.slice(-8)} unit={p.weightUnit}/></div>
  <div className="sf-card"><h3>Recent weigh-ins</h3>{rows.length?rows.slice().reverse().slice(0,showAll?rows.length:5).map(([date,d])=><div className="sf-history-row" key={date}><span>{dateLabel(date)}</span><strong>{displayWeight(d.weight,p)}</strong></div>):<div className="sf-empty">No weight entries yet.</div>}</div>
  <div className="sf-card"><h3>Log Weight</h3><div className="sf-inline-entry"><label htmlFor="sf-weight-log">Weight ({p.weightUnit})</label><input id="sf-weight-log" type="number" min="1" max="600" step=".1" value={value} onChange={e=>setValue(e.target.value)}/><button onClick={save} disabled={!(Number(value)>0&&Number(value)<=600)}><Plus size={15}/> Save</button></div><p className="sf-help">BMI is a screening measure. BMR needs an exact age and is shown only when available.</p></div>
 </div>;
}
const menus={
 "Non-vegetarian":[
 ["Breakfast","8:00 AM","Egg avocado toast","Eggs, avocado and whole-grain toast.","Eggs","/images/nutrition/diet/non-vegetarian-breakfast.png"],
 ["Lunch","12:00 PM","Chicken quinoa salad","Grilled chicken, quinoa, cucumber, tomato and leafy greens.","Chicken","/images/nutrition/lunch-chicken-quinoa-salad.png"],
 ["Snacks","3:30 PM","Greek yogurt and berries","Plain Greek yogurt with fresh berries.","Yogurt","/images/nutrition/breakfast-yogurt-berry-bowl.png"],
 ["Dinner","6:00 PM","Salmon vegetable rice bowl","Salmon, broccoli, carrots and brown rice.","Salmon","/images/nutrition/dinner-grilled-salmon-veggies.png"]
 ],
 Vegetarian:[
 ["Breakfast","8:00 AM","Yogurt berry bowl","Yogurt, fruit and nuts.","Yogurt","/images/nutrition/diet/vegetarian-breakfast.png"],
 ["Lunch","12:00 PM","Quinoa and chickpea salad","Quinoa, chickpeas, greens.","Chickpeas","/images/nutrition/diet/vegetarian-lunch.png"],
 ["Snacks","3:30 PM","Fruit and nuts","Fresh fruit and nuts.","Nuts","/images/nutrition/diet/vegetarian-snacks.png"],
 ["Dinner","6:00 PM","Vegetable paneer bowl","Paneer, vegetables and rice.","Paneer","/images/nutrition/diet/vegetarian-dinner.png"]
 ],
 Vegan:[
 ["Breakfast","8:00 AM","Fruit oat bowl","Oats, fruit and chia seeds.","Seeds","/images/nutrition/diet/vegan-breakfast.png"],
 ["Lunch","12:00 PM","Lentil grain salad","Lentils, grains, and greens.","Lentils","/images/nutrition/diet/vegan-lunch.png"],
 ["Snacks","3:30 PM","Fruit and nuts","Fresh fruit and nuts.","Nuts","/images/nutrition/diet/vegan-snacks.png"],
 ["Dinner","6:00 PM","Tofu vegetable rice bowl","Tofu, fresh greens and rice.","Tofu","/images/nutrition/diet/vegan-dinner.png"]
 ]
};
export function PlanView({data,onBack,onTrack}){
 const diet=data.profile.diet==="Vegan"?"Vegan":data.profile.diet==="Vegetarian"?"Vegetarian":"Non-vegetarian";
 const icons=["☀️","☼","🍎","☾"];
 return <div className="sf-detail sf-menu"><Header title="Your Plan" onBack={onBack}/>
  <div className="sf-coach-banner"><div><b>Your wellness guide</b><p>Fuel your body with real, whole foods.<br/>Stay consistent, see the change. 💚</p></div><span>❧</span></div>
  <h3 className="sf-menu-title">Today's Menu</h3><p className="sf-muted">{diet}</p><p className="sf-help">Illustrative meal ideas. Adjust portions and ingredients for your needs and allergies; these are not prescribed nutrition targets.</p>
  <div className="sf-menu-list">{menus[diet].map(([type,time,name,description,protein,img],i)=><article className="sf-meal" key={type}>
   <div><div className="sf-meal-label"><span>{icons[i]}</span><div><b>{type}</b><small>◉ {time}</small></div></div><h4>{name}</h4><p className="sf-meal-protein">Protein: {protein}</p><p>{description}</p><span className="sf-diet-chip">♧ {diet}</span></div><img src={A+img} alt={name}/></article>)}</div>
  <button className="sf-primary-action" onClick={onTrack}>Log meals manually <ArrowRight size={16}/></button>
  <div className="sf-card"><h3>Your 4-week routine</h3>{["Start with awareness","Build consistency","Move and recover","Make it a lifestyle"].map((s,i)=><div className="sf-history-row" key={s}><span>Week {i+1}</span><strong>{s}</strong></div>)}</div>
 </div>;
}
const ranges=[["1W",7],["1M",30],["3M",90],["6M",180],["1Y",365]];
export function ResultsView({data,today,onWeight,onTrack}){
 const [section,setSection]=useState("Overview"),[range,setRange]=useState("3M");
 const p=data.profile,all=weightRows(data),days=ranges.find(x=>x[0]===range)?.[1]||90,from=new Date(today+"T12:00:00");from.setDate(from.getDate()-days+1);
 const selected=all.filter(([date])=>date>=localDay(from)&&date<=today);const latest=latestWeight(data),first=all[0]?.[1].weight??null;
 const diff=latest==null||first==null?null:+(latest-first).toFixed(1);
 const badges=earnedBadges(data),level=levelInfo(data),day=data.days[today]||{};
 const measures=[["Nutrition",day.meals?.length||0,4,"/images/nutrition/front-plan-bowl.png","meals"],["Hydration",day.waterMl||0,waterGoal(p),"/images/icons/water-drop.png","ml"],["Activity",(day.activity||[]).reduce((s,v)=>s+(Number(v.minutes)||0),0),p.activityGoal||30,"/images/activity/move-today.png","min"]];
 return <div className="sf-detail sf-results"><Header title="Results & Insights"/>
  <div className="sf-result-tabs" role="tablist">{["Overview","Health Metrics","Achievements"].map(t=><button key={t} role="tab" aria-selected={section===t} className={section===t?"active":""} onClick={()=>setSection(t)}>{t==="Overview"?"↗ ":t==="Health Metrics"?"♡ ":"♜ "}{t}</button>)}</div>
  {section==="Overview"&&<>
   <div className="sf-overview-note"><TrendingUp size={19}/><div><b>Your Progress</b><small>You're making steady progress towards your goals.</small></div></div>
   <div className="sf-range-tabs">{ranges.map(([label])=><button key={label} className={range===label?"active":""} onClick={()=>setRange(label)}>{label}</button>)}</div>
   <div className="sf-card"><div className="sf-heading-row"><h3>Weight Trend ({p.weightUnit})</h3><span className="sf-green-chip">{diff==null?"Not logged":(diff>0?"+":"")+diff+" "+p.weightUnit}</span></div>
    <WeightLine records={selected} unit={p.weightUnit} height={180}/><p className="sf-help">{selected.length} measurements in the selected {range} range.</p></div>
   <div className="sf-overview-note"><Trophy size={18}/><div><b>You're making great progress!</b><small>Keep it up. Small, consistent changes lead to better results.</small></div></div>
   <div className="sf-card"><ColorMetrics data={data}/></div>
   <div className="sf-card">{measures.map(([name,value,max,img,units])=><button className="sf-result-progress" key={name} onClick={onTrack}>
    <img src={A+img} alt=""/><div><b>{name}</b><small>{value?value+" "+units:"Not logged"}</small></div>
    <div className="sf-mini-progress"><span style={{width:Math.min(100,value/Math.max(1,max)*100)+"%"}}/></div><strong>{Math.round(value/Math.max(1,max)*100)}%</strong></button>)}</div>
   <div className="sf-card"><div className="sf-heading-row"><h3>Recent weigh-ins</h3><button onClick={onWeight}>View all</button></div>
    {all.slice(-3).reverse().map(([date,d])=><div className="sf-history-row" key={date}><span>{dateLabel(date)}</span><strong>{displayWeight(d.weight,p)}</strong></div>)}
    {!all.length&&<div className="sf-empty">No weight measurements yet.</div>}</div>
  </>}
  {section==="Health Metrics"&&<><div className="sf-card"><h3>Your latest result</h3><ColorMetrics data={data}/><p className="sf-help">BMI and BMR are screening/estimation metrics. BMR needs an exact age to avoid inventing a value.</p></div>
   <div className="sf-card"><h3>Weight goal</h3><p>{weightGoalProgress(latest,p.currentWeight,p.targetWeight,p.weightUnit)===null?"Record your weight to see progress.":weightGoalProgress(latest,p.currentWeight,p.targetWeight,p.weightUnit)+"% of your recorded goal."}</p><button className="sf-link-action" onClick={onWeight}>Weight & Progress <ChevronRight size={15}/></button></div></>}
  {section==="Achievements"&&<><div className="sf-overview-note"><Trophy size={20}/><div><b>{level.name}</b><small>{level.count} weight-check-in days · {badges.length} earned badges</small></div></div>
   <div className="sf-card"><h3>My achievements</h3>{Array.from({length:10},(_,i)=>(i+1)*10).map(n=><div key={n} className={"sf-award"+(badges.some(b=>b.count===n)?"":" locked")}>
    <img src={A+"/milestones/milestone-"+n+(n===10?".png":".jpg")} alt=""/><div><b>{n} entries</b><small>{badges.some(b=>b.count===n)?"Unlocked!":"Locked — keep tracking"}</small></div>{badges.some(b=>b.count===n)?<Check size={17}/>:<ShieldCheck size={16}/>}</div>)}</div></>}
 </div>;
}
