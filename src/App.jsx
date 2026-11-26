import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Award, CalendarDays, Check, ChevronRight,
  CircleUserRound, Clock3, Cloud, CloudOff, Droplets, Flame, Footprints,
  Heart, Home, Leaf, LogOut, Moon, Plus, Scale, ShieldCheck,
  Sparkles, Sunrise, Target, Trash2, TrendingUp, UtensilsCrossed, MessageCircle
} from "lucide-react";
import { supabase, isCloudConfigured, googleLogin, emailSignIn, emailSignUp, requestPasswordReset, updateAccountPassword } from "./lib/supabase.js";
import PublicLandingPage from "./PublicLandingPage.jsx";
import { bmiValue, weightGoalProgress } from "./lib/metrics.js";
import SurveyFlow from "./SurveyFlow.jsx";
import SlimsyHome from "./SlimsyHome.jsx";
import {WaterView,WeightView,PlanView,ResultsView} from "./WellnessPages.jsx";
import "./public-landing.css";
import {
  blankDay, createEmptyData, earnedBadges, entryCount, levelInfo, loadLocal,
  localDay, normalizeData, rangeDates, safeMl, safeNumber, saveLocal, toClock, weeklyWaterMl
} from "./lib/tracker.js";

const NAV = [
  { id: "home", label: "Home", Icon: Home },
  { id: "track", label: "Nutrition", Icon: Activity },
  { id: "plan", label: "Plan", Icon: CalendarDays },
  { id: "habits", label: "Coach", Icon: MessageCircle },
  { id: "progress", label: "Results", Icon: TrendingUp }
];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const MOVES = ["Walking", "Running", "Cycling", "Yoga", "Strength", "Other"];
const MILESTONE_EMOJI = { 10: "🌱", 20: "🌟", 30: "🏅", 40: "🏆", 50: "🥇", 60: "🔥", 70: "💎", 80: "⚡", 90: "🚀", 100: "👑" };
const MEAL_IDEAS = {
  Any: ["Eggs, fruit and whole-grain toast", "Protein, vegetables and rice", "Lentil soup with salad"],
  Vegetarian: ["Greek yogurt, nuts and fruit", "Chickpea and grain bowl", "Paneer or tofu with vegetables"],
  Vegan: ["Oats with berries and seeds", "Lentil and vegetable bowl", "Tofu, greens and brown rice"],
  "Non-vegetarian": ["Eggs with vegetables", "Grilled chicken with quinoa", "Fish, vegetables and rice"]
};

function Button({ children, onClick, outline, ghost, danger, small, block, disabled, type = "button" }) {
  return <button type={type} disabled={disabled} onClick={onClick}
    className={"button" + (outline ? " outline" : "") + (ghost ? " ghost" : "") + (danger ? " danger" : "") + (small ? " sm" : "") + (block ? " block" : "")}>
    {children}
  </button>;
}
function Card({ children, style, className = "" }) {
  return <div className={"card " + className} style={style}>{children}</div>;
}
function Tag({ children, gold, light }) {
  return <span className={"pill" + (gold ? " gold" : "") + (light ? " light" : "")}>{children}</span>;
}
function FormField({ label, value, onChange, type = "text", placeholder, min, max, step, children }) {
  return <div className="field"><label>{label}</label>{children ||
    <input className="input" type={type} value={value ?? ""} min={min} max={max} step={step}
      placeholder={placeholder} onChange={e => onChange(e.target.value)}/>}</div>;
}
function SelectField({ label, value, onChange, options }) {
  return <FormField label={label}><select className="input" value={value} onChange={e=>onChange(e.target.value)}>
    {options.map(x=><option key={x} value={x}>{x}</option>)}
  </select></FormField>;
}
function ProgressLine({ value, total }) {
  return <div className="progressline" role="progressbar" aria-valuenow={Math.min(value,total)}
    aria-valuemin="0" aria-valuemax={total}><span style={{width:Math.min(100,Math.round(value / (total||1) * 100))+"%"}}/></div>;
}
function SectionTitle({ children, note }) {
  return <div className="headline"><h2>{children}</h2>{note && <small>{note}</small>}</div>;
}
function BackHead({ title, onBack }) {
  return <div className="row" style={{padding:"22px 20px 16px"}}><button type="button"
    onClick={onBack} className="button ghost sm"><ArrowLeft size={17}/></button><h2 style={{margin:0}}>{title}</h2><span style={{width:36}}/></div>;
}
function dateShort(date) {
  return new Date(date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
}
function formatHours(v) { return v == null ? "—" : Number(v).toFixed(1)+"h"; }
function formatWeight(v, unit) { return v == null ? "—" : Number(v)+" "+unit; }
function pageGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function AuthLanding({ enterLocal }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const login = async e => {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "forgot") {
        await requestPasswordReset(email.trim());
        setMessage("Check your inbox for a reset-password link.");
      } else if (mode === "signup") {
        await emailSignUp(email.trim(), password);
        setMessage("Check your inbox for the confirmation email, then sign in.");
      } else {
        await emailSignIn(email.trim(), password);
      }
    } catch (e) { setMessage(e.message || "Sign-in failed"); }
    finally { setBusy(false); }
  };
  const google = async () => {
    setBusy(true); setMessage("");
    try { await googleLogin(); } catch (e) { setMessage(e.message || "Google sign-in failed"); setBusy(false); }
  };
  return <main className="authscreen">
    <div className="logo" style={{width:56,height:56}}><Leaf size={30}/></div>
    <Tag>100% Free · No AI · No Subscription</Tag>
    <h1>Your wellness.<br/><span className="accent">Your pace.</span></h1>
    <p className="sub">Welcome to Slimsyfit FreeApp. Track fasting, meals, water, sleep, movement and weight in one simple place.</p>
    <Card>
      <h2 style={{marginBottom:5}}>{mode === "signin" ? "Welcome back" : mode === "forgot" ? "Reset your password" : "Create your free account"}</h2>
      <p>{isCloudConfigured ? "Sync your tracking data securely across devices." : "Cloud sign-in will be available after setting up the new Supabase project."}</p>
      <Button block outline disabled={!isCloudConfigured || busy} onClick={google}><Cloud size={17}/> Continue with Google</Button>
      <div className="dividerline"/>
      <form onSubmit={login}>
        <FormField label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com"/>
        {mode !== "forgot"&&<FormField label="Password" value={password} onChange={setPassword} type="password" placeholder="At least 6 characters"/>}
        <Button type="submit" block disabled={!isCloudConfigured||busy||!email.includes("@")||(mode!=="forgot"&&password.length<6)}>
          {busy?"Please wait…":mode==="signin"?"Sign in":mode==="forgot"?"Send reset link":"Sign up"} <ArrowRight size={15}/>
        </Button>
      </form>
      <button type="button" style={{border:0,background:"none",color:"#0A8F84",fontWeight:800,marginTop:13,width:"100%",fontSize:12}}
        onClick={()=>{setMode(mode==="signin"?"signup":"signin");setMessage("")}}>
        {mode==="signin"?"New here? Create a free account":"Already registered? Sign in"}
      </button>
      {mode==="signin"&&<button type="button" style={{border:0,background:"none",color:"#3D5A58",fontSize:12,width:"100%",marginTop:9}}
        onClick={()=>{setMode("forgot");setMessage("")}}>Forgot password?</button>}
      {message && <div className={message.startsWith("Check")?"success":"error"} role="status">{message}</div>}
    </Card>
    <Button ghost block onClick={enterLocal}><CloudOff size={17}/> Continue without an account</Button>
    <p className="footer">Local mode saves on this device only. Google login requires a separate Supabase project.</p>
  </main>;
}

function ResetPasswordScreen({ onDone }) {
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const save=async e=>{
    e.preventDefault();setBusy(true);setError("");
    try{
      if(password.length<10)throw new Error("Use at least 10 characters.");
      if(password!==confirm)throw new Error("Passwords do not match.");
      await updateAccountPassword(password);
      onDone();
    }catch(err){setError(err.message)}finally{setBusy(false)}
  };
  return <main className="authscreen"><h1>Choose a new password</h1>
    <Card><form onSubmit={save}>
      <FormField label="New password" type="password" value={password} onChange={setPassword}/>
      <FormField label="Confirm password" type="password" value={confirm} onChange={setConfirm}/>
      <Button type="submit" block disabled={busy||password.length<10||password!==confirm}>
        {busy?"Saving…":"Update password"}
      </Button>
      {error&&<div role="alert" className="error">{error}</div>}
    </form></Card>
  </main>;
}

function Onboard({ original, onSave }) {
  const [p, setP] = useState({...original});
  const change = (key,value) => setP(x=>({...x,[key]:value}));
  const submit = e => {
    e.preventDefault();
    if(!p.name.trim()) return;
    onSave({...p,name:p.name.trim()});
  };
  return <main className="onboard">
    <Tag><Leaf size={13}/> Let's start</Tag>
    <h1 style={{marginTop:20}}>Create your healthy routine</h1>
    <p className="sub">Your details help set up manual goals. You can edit everything later.</p>
    <form onSubmit={submit}>
      <Card>
        <FormField label="Your name *" value={p.name} onChange={v=>change("name",v)} placeholder="Enter your name"/>
        <div className="grid2">
          <FormField label="Age (optional)" type="number" value={p.age} onChange={v=>change("age",v)} min={1} max={120}/>
          <SelectField label="Weight unit" value={p.weightUnit} onChange={v=>change("weightUnit",v)} options={["kg","lbs"]}/>
        </div>
        <SelectField label="Diet preference" value={p.diet} onChange={v=>change("diet",v)} options={["Any","Vegetarian","Vegan","Non-vegetarian"]}/>
        <SelectField label="Activity" value={p.activity} onChange={v=>change("activity",v)}
          options={["Sedentary","Lightly active","Moderately active","Very active"]}/>
        <SelectField label="Fasting preference" value={String(p.fastingHours)} onChange={v=>change("fastingHours",Number(v))}
          options={["12","14","16"]}/>
        <div className="grid2">
          <FormField label="Water goal (ml)" type="number" value={p.waterGoalMl}
            onChange={v=>change("waterGoalMl",safeMl(v))} min={250} max={12000} step={250}/>
          <FormField label="Sleep goal (hours)" type="number" value={p.sleepGoal}
            onChange={v=>change("sleepGoal",Number(v))} min={1} max={16} step={0.5}/>
        </div>
        <Button type="submit" block disabled={!p.name.trim()}>Open my free tracker <ArrowRight size={17}/></Button>
      </Card>
    </form>
    <div className="notice">Fasting is not appropriate for everyone. If pregnant, under 18, or managing diabetes, an eating disorder or medication affecting meals, consult your clinician before fasting.</div>
  </main>;
}

function DatePicker({ date, onPick }) {
  const days = rangeDates(localDay(),7);
  return <div className="picker" aria-label="Choose day">
    {days.map(day=><button key={day} type="button" className={day===date?"active":""} onClick={()=>onPick(day)}>
      <span>{new Date(day+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</span>
      <div style={{fontSize:16,marginTop:3}}>{day.slice(-2)}</div>
    </button>)}
  </div>;
}
function HomeScreen({ data, today, setTab, addWater, showPlan }) {
  const p = data.profile;
  const d = data.days[today] || blankDay();
  const info = levelInfo(data);
  const water = d.waterMl || 0;
  const meals = d.meals || [];
  const totalCalories=meals.reduce((s,x)=>s+(Number(x.calories)||0),0);
  const movement=(d.activity||[]).reduce((s,x)=>s+(Number(x.minutes)||0),0);
  const tiles=[
    { icon:"💧", label:"Water", value:(water/1000).toFixed(2)+" L", action:()=>setTab("track") },
    { icon:"🥗", label:"Food", value:totalCalories+" kcal", action:()=>setTab("track") },
    { icon:"🌙", label:"Sleep", value:formatHours(d.sleepHours), action:()=>setTab("track") },
    { icon:"🚶", label:"Activity", value:movement+" min", action:()=>setTab("track") }
  ];
  return <>
    <header className="hero">
      <div className="logorow"><div className="logo"><Leaf size={23}/></div>
        <div><strong>Slimsyfit FreeApp</strong><span className="logo-caption">Build habits, not pressure</span></div>
        <Tag light><ShieldCheck size={12}/> FREE</Tag>
      </div>
      <h1>{pageGreeting()},<br/>{p.name.split(" ")[0]}! 👋</h1>
      <p>Small steps are adding up. Keep going at your own pace.</p>
      <div className="statstripe">
        <div><b>{info.count}</b><span>Weight logs</span></div>
        <div><b>{info.name}</b><span>Current level</span></div>
        <div><b>{earnedBadges(data).length}</b><span>Badges earned</span></div>
      </div>
    </header>
    <SectionTitle note={dateShort(today)}>Today's overview</SectionTitle>
    <div className="content">
      <div className="grid2">
        {tiles.map(t=><button type="button" onClick={t.action} key={t.label}
          className="card metric" style={{textAlign:"left",border:0,cursor:"pointer"}}>
          <span className="emoji">{t.icon}</span><div><b>{t.value}</b><span>{t.label}</span></div>
        </button>)}
      </div>
      <Card>
        <div className="row"><div><h3 style={{marginBottom:3}}>Water goal</h3><span className="muted">{water.toLocaleString()} / {p.waterGoalMl.toLocaleString()} ml</span></div><Droplets color="#2f9972" size={23}/></div>
        <div style={{margin:"13px 0"}}><ProgressLine value={water} total={p.waterGoalMl}/></div>
        <Button small ghost onClick={addWater}><Plus size={14}/> Add 250 ml</Button>
      </Card>
      <Card>
        <div className="row"><div><h3>Progress level</h3><Tag><Award size={13}/>{info.name}</Tag></div>
          <span className="number" style={{fontSize:24}}>{info.nextAt||"✓"}</span></div>
        <p style={{margin:"12px 0"}}>{info.nextAt ? "Record weight on "+(info.nextAt-info.count)+" more distinct days to unlock the next level." : "Lifestyle unlocked! Keep showing up for yourself."}</p>
        <ProgressLine value={info.progress} total={100}/>
      </Card>
      <Card>
        <h3>Your plan, your choice</h3><p>Simple meal ideas, a personal fasting goal and practical habits. No AI recommendations or subscription required.</p>
        <Button outline block onClick={showPlan}><CalendarDays size={16}/> View my 4-week plan <ChevronRight size={16}/></Button>
      </Card>
      <div className="notice">Wellness information only. Listen to your body's needs; fasting and calorie restriction are not recommended for everyone.</div>
    </div>
  </>;
}

function TrackScreen({ data, date, onDate, updateDay }) {
  const d=data.days[date]||blankDay(), p=data.profile;
  const [food,setFood]=useState({type:"Breakfast",name:"",calories:"",carbs:"",fat:"",protein:""});
  const [sleep,setSleep]=useState("");
  const [weight,setWeight]=useState("");
  const [minutes,setMinutes]=useState("");
  const [move,setMove]=useState("Walking");
  const [foodError,setFoodError]=useState("");
  useEffect(()=>{setSleep(d.sleepHours ?? "");setWeight(d.weight ?? "")},[date,d.sleepHours,d.weight]);
  const patch = changes => updateDay(date,old=>({...old,...changes}));
  const addFood=e=>{
    e.preventDefault();
    if(!food.name.trim())return;
    const n = safeNumber(food.calories,20000);
    if(n===null){setFoodError("Enter valid calories (0–20,000)");return}
    const parts=["carbs","fat","protein"].map(k=>safeNumber(food[k],3000));
    if(parts.some(x=>x===null)){setFoodError("Enter nonnegative carbs, fat and protein amounts.");return}
    patch({meals:[...(d.meals||[]),{id:Date.now().toString(36),type:food.type,name:food.name.trim(),calories:n,carbs:parts[0],fat:parts[1],protein:parts[2]}]});
    setFood({...food,name:"",calories:"",carbs:"",fat:"",protein:""});setFoodError("");
  };
  const totals=(d.meals||[]).reduce((a,x)=>({calories:a.calories+(+x.calories||0),protein:a.protein+(+x.protein||0)}),{calories:0,protein:0});
  const activityTotal=(d.activity||[]).reduce((n,x)=>n+x.minutes,0);
  return <>
    <SectionTitle note="Manual entries only">Daily tracking</SectionTitle>
    <div className="content">
      <DatePicker date={date} onPick={onDate}/>
      <Card>
        <div className="row"><h3>💧 Hydration</h3><Tag>{Math.round((d.waterMl||0)/(p.waterGoalMl||2000)*100)}% goal</Tag></div>
        <div className="water-controls">
          <div><div className="number" style={{fontSize:30}}>{(d.waterMl||0).toLocaleString()} <span style={{fontSize:16}}>ml</span></div><span className="muted">Daily goal: {p.waterGoalMl} ml</span></div>
          <div style={{display:"flex",gap:8}}><Button outline small disabled={!d.waterMl} onClick={()=>patch({waterMl:safeMl(d.waterMl-250)})}>− 250</Button>
            <Button small onClick={()=>patch({waterMl:safeMl((d.waterMl||0)+250)})}><Plus size={14}/>250</Button></div>
        </div>
        <div className="mini-grid">
          {Array.from({length:8},(_,i)=><span key={i} className={"drop"+(i*250<(d.waterMl||0)?" filled":"")}>♥</span>)}
        </div>
        <ProgressLine value={d.waterMl||0} total={p.waterGoalMl}/>
      </Card>
      <Card>
        <div className="row"><h3>🥗 Nutrition</h3><Tag>{totals.calories} kcal · {totals.protein}g protein</Tag></div>
        <div style={{display:"flex",gap:8,margin:"12px 0",overflowX:"auto"}}>
          {["breakfast-yogurt-berry-bowl.png","lunch-chicken-quinoa-salad.png","dinner-grilled-salmon-veggies.png"].map(x=>
            <img key={x} src={"/assets/slimsyfit/images/nutrition/"+x} alt="Meal inspiration"
              loading="lazy" style={{width:90,height:72,borderRadius:13,objectFit:"cover"}}/>
          )}
        </div>
        {(d.meals||[]).map((m,i)=><div className="entry" key={m.id||i}>
          <div className="circleicon"><UtensilsCrossed size={16}/></div><div className="entrymain"><b>{m.name}</b><small>{m.type} · {m.calories} kcal · P {m.protein}g</small></div>
          <button className="button danger sm" aria-label={"Remove "+m.name}
            onClick={()=>patch({meals:(d.meals||[]).filter((_,j)=>j!==i)})}><Trash2 size={13}/></button>
        </div>)}
        {(d.meals||[]).length===0&&<div className="empty">No meals logged yet. Add your first meal below.</div>}
        <form onSubmit={addFood}>
          <SelectField label="Meal type" value={food.type} onChange={v=>setFood(x=>({...x,type:v}))} options={MEAL_TYPES}/>
          <FormField label="Food or dish" value={food.name} onChange={v=>setFood(x=>({...x,name:v}))} placeholder="Example: Vegetable rice bowl"/>
          <div className="grid2">
            {["calories","carbs","fat","protein"].map(k=><FormField key={k} label={k==="calories"?"Calories (kcal)":k[0].toUpperCase()+k.slice(1)+" (g)"}
              type="number" min={0} step="0.1" value={food[k]} onChange={v=>setFood(x=>({...x,[k]:v}))} placeholder="0"/>)}
          </div>
          {foodError&&<div className="error" role="alert">{foodError}</div>}
          <Button type="submit" block outline disabled={!food.name.trim()||food.calories===""||["carbs","fat","protein"].some(k=>food[k]==="")}><Plus size={15}/> Save meal manually</Button>
        </form>
        <p className="mini-help" style={{marginTop:10}}>Enter nutrition values from food labels or personal records. No AI calorie estimation.</p>
      </Card>
      <Card>
        <div className="row"><h3>🌙 Sleep</h3><Tag>{formatHours(d.sleepHours)}</Tag></div>
        <p>Record the hours you slept. Your target is {p.sleepGoal} hours.</p>
        <FormField label="Hours slept" type="number" min={0} max={24} step={0.25} value={sleep}
          onChange={setSleep} placeholder="Example: 7.5"/>
        <Button block outline onClick={()=>{
          const n=safeNumber(sleep,24);if(n!==null)patch({sleepHours:n});
        }}>Save sleep</Button>
      </Card>
      <Card>
        <div className="row"><h3>⚖️ Weight</h3><Tag>{formatWeight(d.weight,p.weightUnit)}</Tag></div>
        <FormField label={"Weight ("+p.weightUnit+")"} type="number" min={0} max={600} step={0.1} value={weight}
          onChange={setWeight} placeholder="Enter weight"/>
        <Button block outline onClick={()=>{const n=safeNumber(weight,600);if(n!==null&&n>0)patch({weight:n})}}>Save weight</Button>
      </Card>
      <Card>
        <div className="row"><h3>🚶 Activity</h3><Tag>{activityTotal} min</Tag></div>
        <div style={{display:"flex",gap:7,alignItems:"center",overflowX:"auto",margin:"8px 0 12px"}}>
          {["walking","running","cycling","strength","stretching"].map(a=>
            <img key={a} src={"/assets/slimsyfit/animations/"+a+".gif"} loading="lazy"
              alt={a+" animation"} style={{width:65,height:65,objectFit:"cover",borderRadius:13,background:"#EFFEFA"}}/>
          )}
        </div>
        {(d.activity||[]).map((a,i)=><div className="entry" key={a.id||i}>
          <div className="circleicon"><Footprints size={16}/></div><div className="entrymain"><b>{a.name}</b><small>{a.minutes} minutes</small></div>
          <button className="button danger sm" onClick={()=>patch({activity:(d.activity||[]).filter((_,j)=>j!==i)})}><Trash2 size={13}/></button>
        </div>)}
        <SelectField label="Activity" value={move} onChange={setMove} options={MOVES}/>
        <FormField label="Minutes" type="number" min={1} max={1440} value={minutes} onChange={setMinutes} placeholder="30"/>
        <Button block outline disabled={!(Number(minutes)>0&&Number(minutes)<=1440)} onClick={()=>{
          patch({activity:[...(d.activity||[]),{id:Date.now().toString(36),name:move,minutes:Number(minutes)}]});setMinutes("");
        }}><Plus size={15}/> Log movement</Button>
      </Card>
      <Card>
        <h3>✅ Daily commitment</h3>
        <p>Check off the habits you completed today.</p>
        {[["nutrition","Balanced meals"],["water","Hydration awareness"],["movement","Movement"],["sleep","Sleep routine"]].map(([id,label])=><label
          key={id} className="entry" style={{cursor:"pointer"}}>
          <input className="check" type="checkbox" checked={Boolean(d.habits?.[id])}
            onChange={e=>patch({habits:{...(d.habits||{}),[id]:e.target.checked}})}/>
          <span style={{fontWeight:700,fontSize:13}}>{label}</span>
        </label>)}
      </Card>
    </div>
  </>;
}


function HabitsScreen({data,today,onFasting,onTrack,onProgress}) {
  const day=data.days[today]||blankDay();
  const activity=(day.activity||[]).reduce((n,x)=>n+(Number(x.minutes)||0),0);
  const completed=Object.values(day.habits||{}).filter(Boolean).length;
  const goal=levelInfo(data);
  return <>
    <SectionTitle note="Manual wellness guidance · No AI">Healthy habits</SectionTitle>
    <div className="content">
      <Card>
        <div className="row start">
          <img src="/assets/slimsyfit/animations/walking.gif" alt="Walking animation" style={{width:76,height:76,borderRadius:16,objectFit:"cover"}}/>
          <div><Tag>Today's focus</Tag><h3 style={{margin:"8px 0 4px"}}>Move your body</h3><p>Small daily actions build consistency.</p></div>
        </div>
        <Button block onClick={onTrack}>Log daily habits <ArrowRight size={16}/></Button>
      </Card>
      <div className="grid2">
        <Card className="metric"><span className="emoji">✅</span><div><b>{completed}/4</b><span>Today's check-ins</span></div></Card>
        <Card className="metric"><span className="emoji">🚶</span><div><b>{activity} min</b><span>Movement logged</span></div></Card>
      </div>
      <Card>
        <div className="row start"><div className="circleicon"><Clock3 size={20}/></div>
          <div><h3 style={{marginBottom:4}}>Intermittent fasting</h3>
            <p>{data.profile.fastingAllowed===false?"Clinician review recommended before fasting":data.profile.fastingHours+":"
              +(24-data.profile.fastingHours)+" routine · optional"}</p></div></div>
        <Button outline block disabled={data.profile.fastingAllowed===false} onClick={onFasting}><Flame size={16}/> Open fasting timer</Button>
      </Card>
      <Card><h3>Your commitment</h3><Tag>{goal.name}</Tag>
        <p style={{marginTop:12}}>Commitment levels unlock at 7 and 30 days with a real weight entry, matching the original SlimSyFit rules.</p>
        <Button ghost block onClick={onProgress}>Achievements and progress <ChevronRight size={16}/></Button>
      </Card>
    </div>
  </>;
}

function FastingScreen({ data, now, onStart, onFinish, onHoursChange }) {
  const start=data.fasting.activeStart;
  const hours=data.profile.fastingHours;
  const elapsed=start ? Math.max(0,now-start):0;
  const goal=hours*3600*1000;
  const pct=Math.min(100,Math.floor(elapsed/goal*100));
  const logs=data.fasting.completed.slice().reverse().slice(0,10);
  return <>
    <SectionTitle note="Simple manual timer">Fasting</SectionTitle>
    <div className="content">
      <Card>
        <div className="row"><h3>Choose a routine</h3><Tag>{hours}:{24-hours}</Tag></div>
        <div className="choice">
          {[12,14,16].map(h=><button key={h} className={h===hours?"active":""}
            disabled={Boolean(start)} onClick={()=>onHoursChange(h)}>{h}:{24-h} {h===12?"Beginner":""}</button>)}
        </div>
        <div className="timer">
          <p>{start?"Fasting in progress":"Ready when you are"}</p>
          <div className="clock">{start?toClock(elapsed):"00:00:00"}</div>
          <Tag>{start?pct+"% of "+hours+"-hour goal":hours+"-hour goal"}</Tag>
        </div>
        <ProgressLine value={elapsed} total={goal}/>
        <div style={{marginTop:18}}>
          {start ? <Button block onClick={onFinish}><Check size={16}/> Finish fasting and save</Button>
            :<Button block onClick={onStart}><Flame size={17}/> Start fasting</Button>}
        </div>
        {start&&<p className="muted" style={{marginTop:11,textAlign:"center"}}>Started {new Date(start).toLocaleString()}</p>}
      </Card>
      <div className="notice">
        Fasting is optional. Do not fast if it conflicts with health needs, treatment or medication. Speak with a clinician if unsure, and stop if you feel unwell.
      </div>
      <Card>
        <h3>Recent fasting history</h3>
        {logs.length ? logs.map((f,i)=><div className="entry" key={i}>
          <div className="circleicon"><Clock3 size={17}/></div>
          <div className="entrymain"><b>{(f.durationMin/60).toFixed(1)} hours</b><small>{new Date(f.start).toLocaleDateString()} · {f.goalHours}-hour goal</small></div>
          <Tag>{f.durationMin >= f.goalHours*60?"Goal met":"Logged"}</Tag>
        </div>) : <div className="empty">No fasting sessions yet.</div>}
      </Card>
    </div>
  </>;
}

function PlanScreen({data,onBack}) {
  const p=data.profile;
  const ideas=MEAL_IDEAS[p.diet]||MEAL_IDEAS.Any;
  const weeks=[
    {title:"Begin with awareness",focus:"Notice daily water, meal and sleep patterns",number:1},
    {title:"Build a rhythm",focus:"Aim for a realistic repeatable routine",number:2},
    {title:"Strengthen consistency",focus:"Review activity and check-in trends",number:3},
    {title:"Make it a lifestyle",focus:"Celebrate progress and adjust goals",number:4}
  ];
  return <>
    <BackHead title="Your Free Plan" onBack={onBack}/>
    <div className="content">
      <div className="notice">This plan is a general wellness checklist, not a medically personalized diet or fasting prescription.</div>
      <Card><h3>My routine</h3>
        <div className="row"><span className="sub">Fasting (optional)</span><Tag>{p.fastingHours}:{24-p.fastingHours}</Tag></div>
        <div className="dividerline"/>
        <div className="row"><span className="sub">Water goal</span><strong>{p.waterGoalMl} ml</strong></div>
        <div className="dividerline"/>
        <div className="row"><span className="sub">Sleep goal</span><strong>{p.sleepGoal} hours</strong></div>
        <div className="dividerline"/>
        <div className="row"><span className="sub">Activity goal</span><strong>{p.activityGoal} minutes</strong></div>
      </Card>
      <Card><h3>Easy meal ideas · {p.diet}</h3>
        <img src="/assets/slimsyfit/images/nutrition/front-plan-bowl.png" alt="Balanced nutritious bowl"
          style={{width:"100%",height:160,objectFit:"cover",borderRadius:15,margin:"2px 0 12px"}}/>
        {ideas.map((m,i)=>{
          const selectedDiet=p.diet==="Vegan"?"vegan":p.diet==="Vegetarian"?"vegetarian":"non-vegetarian";
          const meal=["breakfast","lunch","dinner"][i];
          return <div key={m} className="entry">
            <img src={"/assets/slimsyfit/images/nutrition/diet/"+selectedDiet+"-"+meal+".png"} alt=""
              style={{width:53,height:53,objectFit:"cover",borderRadius:13}}/>
            <div className="entrymain"><b>{["Breakfast","Lunch","Dinner"][i]}</b><small>{m}</small></div>
          </div>;
        })}
        <p className="mini-help">Examples only. Log real foods and quantities in the Track tab.</p>
      </Card>
      {weeks.map(w=><Card key={w.number}><div className="row start"><div className="circleicon">0{w.number}</div><div><h3 style={{marginBottom:3}}>{w.title}</h3><span className="sub">{w.focus}</span></div></div></Card>)}
    </div>
  </>;
}

function ProgressScreen({ data, today }) {
  const p=data.profile,info=levelInfo(data),badges=earnedBadges(data);
  const water=weeklyWaterMl(data,today);
  const weights=Object.entries(data.days).filter(([,d])=>d.weight!=null)
    .sort((a,b)=>b[0].localeCompare(a[0])).slice(0,12);
  const sleep=Object.entries(data.days).filter(([,d])=>d.sleepHours!=null)
    .sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7);
  const avg=water.reduce((s,x)=>s+x.ml,0)/7;
  const latestWeight=weights[0]?.[1]?.weight??null;
  const bmi=bmiValue(p.height||p.heightCm,latestWeight,p.weightUnit);
  const goalProgress=weightGoalProgress(latestWeight,p.currentWeight,p.targetWeight,p.weightUnit);
  const trend=weights.slice(0,8).reverse();
  const numericWeights=trend.map(([,d])=>Number(d.weight)).filter(Number.isFinite);
  const rangeMin=numericWeights.length?Math.min(...numericWeights):0;
  const rangeMax=numericWeights.length?Math.max(...numericWeights):0;
  return <>
    <SectionTitle note="Based on real entries">Your progress</SectionTitle>
    <div className="content">
      <div className="grid2">
        <Card className="metric"><span className="emoji">📆</span><div><b>{info.count}</b><span>Weight logs</span></div></Card>
        <Card className="metric"><span className="emoji">🏅</span><div><b>{badges.length}</b><span>Badges earned</span></div></Card>
      </div>
      <Card>
        <div className="row"><div><h3>My current level</h3><Tag><Award size={13}/>{info.name}</Tag></div><span className="number">{info.count} days</span></div>
        <p style={{marginTop:13}}>{info.nextAt?"Next level unlocks at "+info.nextAt+" distinct weight entries.":"You've reached Lifestyle!"}</p>
        <ProgressLine value={info.progress} total={100}/>
        <div className="mini-help" style={{marginTop:9}}>Levels unlock at 7 and 30 weight check-ins. Locked levels remain hidden until achieved.</div>
      </Card>
      <Card>
        <div className="row"><h3>Water · last 7 days</h3><Tag>Avg {(avg/1000).toFixed(2)} L</Tag></div>
        <div className="chart">
          {water.map(x=><div className="barcol" key={x.date}>
            <div className="bar" title={dateShort(x.date)+": "+x.ml+" ml"}
              style={{height:Math.max(3,Math.round(x.ml/Math.max(p.waterGoalMl,250)*80))+"px"}}/>
            <small>{new Date(x.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</small>
          </div>)}
        </div>
        <p className="mini-help" style={{marginTop:12}}>Water chart uses only recorded daily amounts.</p>
      </Card>
      <Card>
        <div className="row"><h3>Weight, BMI & goal</h3><Tag>Recorded data only</Tag></div>
        <div className="grid2" style={{marginBottom:16}}>
          <div><span className="muted">Latest weigh-in</span><div className="number" style={{fontSize:22}}>{formatWeight(latestWeight,p.weightUnit)}</div></div>
          <div><span className="muted">BMI · screening metric</span><div className="number" style={{fontSize:22}}>{bmi??"—"}</div></div>
        </div>
        {goalProgress!==null&&<div>
          <div className="row"><span className="sub">Weight-goal progress</span><strong>{goalProgress}%</strong></div>
          <div style={{margin:"10px 0 14px"}}><ProgressLine value={goalProgress} total={100}/></div>
        </div>}
        {trend.length>=2&&<div className="chart" aria-label="Weight trend from actual measurements">
          {trend.map(([date,d])=><div className="barcol" key={date}>
            <div className="bar" title={date+": "+d.weight+" "+p.weightUnit}
              style={{height:(18+60*(Number(d.weight)-rangeMin)/(Math.max(1,rangeMax-rangeMin)))+"px"}}/>
            <small>{date.slice(5)}</small>
          </div>)}
        </div>}
        <p className="mini-help" style={{marginTop:10}}>BMI is an approximate screening measure, not a diagnosis. It appears only when height and an actual weigh-in are available. Weight predictions are intentionally omitted.</p>
      </Card>
      <Card>
        <h3>Weight history</h3>
        {weights.length ? weights.map(([date,d])=><div className="entry" key={date}>
          <div className="circleicon"><Scale size={17}/></div>
          <div className="entrymain"><b>{dateShort(date)}</b></div><strong>{formatWeight(d.weight,p.weightUnit)}</strong>
        </div>) : <div className="empty">Log your weight to see a trend here.</div>}
      </Card>
      <Card>
        <h3>Sleep history</h3>
        {sleep.length ? sleep.map(([date,d])=><div key={date} className="entry">
          <div className="circleicon"><Moon size={17}/></div><div className="entrymain"><b>{dateShort(date)}</b></div><strong>{formatHours(d.sleepHours)}</strong>
        </div>) : <div className="empty">Sleep entries will appear here.</div>}
      </Card>
      <Card>
        <h3>Achievements</h3>
        {badges.length ? badges.slice().reverse().map(b=><div className="badge-row" key={b.count}>
          <div className="badge-emblem" style={{padding:0,overflow:"hidden"}}>
            <img alt={b.title} loading="lazy" src={"/assets/slimsyfit/milestones/milestone-"+b.count+(b.count===10?".png":".jpg")}
              style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
          <div><strong style={{fontSize:13}}>{b.title}</strong><div className="muted">{b.count} logged days</div></div>
          <Check size={16} style={{marginLeft:"auto",color:"#1c8e68"}}/>
        </div>) : <div className="empty">Your first badge unlocks after 10 real weight entries.</div>}
        <p className="mini-help">Badges unlock for 10, 20, 30 ... 100 recorded weight entries.</p>
      </Card>
    </div>
  </>;
}

function MeScreen({ data, identity, session, onProfile, onSignOut, onReset, onDeleteAccount, onConnect, onEditSurvey, syncState }) {
  const p=data.profile;
  const [name,setName]=useState(p.name);
  const [diet,setDiet]=useState(p.diet);
  const [water,setWater]=useState(p.waterGoalMl);
  const [sleep,setSleep]=useState(p.sleepGoal);
  const [activity,setActivity]=useState(p.activityGoal);
  const [unit,setUnit]=useState(p.weightUnit);
  const [exactAge,setExactAge]=useState(p.exactAge||"");
  const [targetWeight,setTargetWeight]=useState(p.targetWeight||"");
  const [message,setMessage]=useState("");
  const save=()=>{
    if(!name.trim())return;
    const validatedAge=exactAge===""?"":(Number.isInteger(Number(exactAge))&&Number(exactAge)>=18&&Number(exactAge)<=110?Number(exactAge):null);
    if(validatedAge===null){setMessage("Enter a valid exact age (18–110), or leave it blank.");return}
    onProfile({...p,name:name.trim(),diet,waterGoalMl:safeMl(water),sleepGoal:Number(sleep),activityGoal:Number(activity),weightUnit:unit,exactAge:validatedAge,targetWeight});
    setMessage("Profile and goals saved.");setTimeout(()=>setMessage(""),3000);
  };
  const exportData=()=>{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="slimsyfit-freeapp-"+localDay()+".json";
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  };
  return <>
    <SectionTitle note="Your details">My account</SectionTitle>
    <div className="content">
      <Card>
        <div className="row start"><div className="circleicon"><CircleUserRound size={20}/></div>
          <div><strong>{p.name}</strong><div className="muted">{session?.user?.email||"Local-only tracker"}</div></div></div>
        <div style={{marginTop:12}}><Tag>{identity==="guest"?"Saved on this device":syncState==="synced"?"Cloud synced":syncState==="saving"?"Syncing…":"Secure sign-in"}</Tag></div>
      </Card>
      <Card>
        <h3>Profile & goals</h3>
        <FormField label="Name" value={name} onChange={setName}/>
        <SelectField label="Diet" value={diet} onChange={setDiet} options={["Any","Vegetarian","Vegan","Non-vegetarian"]}/>
        <SelectField label="Weight unit" value={unit} onChange={setUnit} options={["kg","lbs"]}/>
        <FormField label="Exact age (optional, for BMR estimate)" type="number" min={18} max={110} value={exactAge} onChange={setExactAge}/>
        <FormField label="Target weight (optional, include unit)" value={targetWeight} onChange={setTargetWeight} placeholder="Example: 165 lbs"/>
        <div className="grid2">
          <FormField label="Water goal (ml)" type="number" min={250} max={12000} step={250} value={water} onChange={setWater}/>
          <FormField label="Sleep goal (h)" type="number" min={1} max={16} step={0.5} value={sleep} onChange={setSleep}/>
        </div>
        <FormField label="Activity goal (minutes)" type="number" min={1} max={1440} value={activity} onChange={setActivity}/>
        <Button block onClick={save} disabled={!name.trim()}>Save preferences</Button>
        {message&&<div role="status" className="success">{message}</div>}
      </Card>
      <Card>
        <h3>Wellness questionnaire</h3>
        <p>Review or update the original 18-question SlimSyFit survey without AI.</p>
        <Button outline block onClick={onEditSurvey}><CalendarDays size={16}/> Retake my survey</Button>
      </Card>
      {!session&&<Card>
        <h3>Sync your history</h3>
        <p>Sign in with Google or email to save your guest tracking history to your own cloud account.</p>
        <Button block onClick={onConnect}><Cloud size={16}/> Sign in and sync history</Button>
      </Card>}
      <Card>
        <h3>Your data</h3>
        <p>Export a copy of your activity history. In guest mode, data lives only on this device. Cloud mode uses your separate Supabase project.</p>
        <Button block outline onClick={exportData}>Export my data (JSON)</Button>
      </Card>
      <Card>
        <h3>Account actions</h3>
        <div className="action-list">
          <Button block outline onClick={onSignOut}><LogOut size={16}/>{session?"Sign out":"Exit local mode"}</Button>
          <Button block danger onClick={onReset}><Trash2 size={15}/> Delete tracking history</Button>
          {session&&<Button block danger onClick={onDeleteAccount}><Trash2 size={15}/> Delete account and data</Button>}
        </div>
      </Card>
      <div className="footer">Slimsyfit FreeApp v1.0.0 · No AI · No Stripe · No subscriptions</div>
    </div>
  </>;
}

export default function App() {
  const [session,setSession] = useState(null);
  const [sessionReady,setSessionReady] = useState(!supabase);
  const [guestMode,setGuestMode] = useState(() => {
    try{return localStorage.getItem("slimsyfit-freeapp:guest-active")==="1"}catch{return false}
  });
  const [showSurvey,setShowSurvey] = useState(false);
  const [showLogin,setShowLogin] = useState(false);
  const [cloudWritable,setCloudWritable] = useState(true);
  const [loadedIdentity,setLoadedIdentity] = useState(null);
  const [passwordRecovery,setPasswordRecovery] = useState(false);
  const guestDraftRef=useRef(null);
  const [data,setData] = useState(createEmptyData);
  const [dataReady,setDataReady] = useState(false);
  const [tab,setTab] = useState("home");
  const [showPlan,setShowPlan] = useState(false);
  const [detailPage,setDetailPage] = useState(null);
  const [date,setDate] = useState(localDay());
  const [now,setNow] = useState(Date.now());
  const [syncState,setSyncState] = useState("local");
  const [syncError,setSyncError] = useState("");
  const currentIdentity = session?.user?.id || (guestMode?"guest":null);
  const keyRef = useRef(null);
  useEffect(()=>{
    if(!supabase)return;
    let live=true;
    supabase.auth.getSession().then(({data,error})=>{
      if(!live)return;
      if(error)setSyncError(error.message);
      setSession(data?.session||null);setSessionReady(true);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{
      if(!live)return;
      if(event==="PASSWORD_RECOVERY")setPasswordRecovery(true);
      if(event==="SIGNED_OUT"){setDataReady(false);setLoadedIdentity(null)}
      setSession(s||null);setSessionReady(true);
      if(s?.user){
        setGuestMode(false);
        try{localStorage.removeItem("slimsyfit-freeapp:guest-active")}catch{}
      }
    });
    return ()=>{live=false;subscription.unsubscribe()};
  },[]);
  useEffect(()=>{
    const id=setInterval(()=>setNow(Date.now()),1000);
    return ()=>clearInterval(id);
  },[]);
  useEffect(()=>{
    if(!sessionReady||!currentIdentity){setDataReady(false);return;}
    let live=true;
    const identity=currentIdentity;
    keyRef.current=identity;
    setDataReady(false);setLoadedIdentity(null);
    setSyncState(identity==="guest"?"local":"loading");
    setCloudWritable(identity==="guest");
    const restore=async()=>{
      let restored=loadLocal(identity);
      if(identity!=="guest"&&supabase){
        try{
          const {data:row,error}=await supabase.from("wellness_records")
            .select("payload").eq("user_id",identity).maybeSingle();
          if(error)throw error;
          if(row?.payload&&Object.keys(row.payload).length) restored=normalizeData(row.payload);
          else {
            let pending=guestDraftRef.current;
            if(!pending){try{pending=JSON.parse(sessionStorage.getItem("freeapp:guest-transfer")||"null")}catch{}}
            if(pending?.profile?.name)restored=normalizeData(pending);
          }
          guestDraftRef.current=null;
          try{sessionStorage.removeItem("freeapp:guest-transfer")}catch{}
          if(live){setCloudWritable(true);setSyncError("")}
        }catch(err){
          if(live){
            setCloudWritable(false);
            setSyncError("Cloud restore failed. Changes remain local; cloud sync is paused until you sign in again. "+err.message);
          }
        }
      }
      if(!live||keyRef.current!==identity)return;
      setData(restored);
      setTab("home");setShowPlan(false);setDetailPage(null);
      setLoadedIdentity(identity);setDataReady(true);
      setSyncState(identity==="guest"?"local":"synced");
    };
    void restore();
    return ()=>{live=false};
  },[currentIdentity,sessionReady]);
  useEffect(()=>{
    if(!dataReady||!currentIdentity||loadedIdentity!==currentIdentity)return;
    const identity=currentIdentity;
    saveLocal(identity,data);
    if(identity==="guest"||!supabase||!cloudWritable)return;
    setSyncState("saving");
    const timer=setTimeout(async()=>{
      try{
        const {error}=await supabase.from("wellness_records").upsert({
          user_id:identity,payload:data,updated_at:new Date().toISOString()
        },{onConflict:"user_id"});
        if(error)throw error;
        if(keyRef.current===identity){setSyncState("synced");setSyncError("")}
      }catch(err){
        if(keyRef.current===identity){setSyncState("error");setSyncError("Cloud save failed; local backup kept: "+err.message)}
      }
    },700);
    return ()=>clearTimeout(timer);
  },[data,dataReady,currentIdentity,cloudWritable,loadedIdentity]);
  const today=localDay();
  const updateDay=(dateKey,change)=>{
    setData(previous=>{
      const old=previous.days[dateKey]||blankDay();
      const next=change(old);
      const updated={...previous,days:{...previous.days,[dateKey]:next}};
      // Manual logs must survive an immediate page reload; persist at mutation time.
      // The existing data effect separately synchronizes signed-in users to Supabase.
      if(currentIdentity&&loadedIdentity===currentIdentity)saveLocal(currentIdentity,updated);
      return updated;
    });
  };
  const patchProfile=profile=>setData(d=>({...d,profile}));
  const addWater=()=>updateDay(today,d=>({...d,waterMl:safeMl((d.waterMl||0)+250)}));
  const changeWater=delta=>updateDay(today,d=>({...d,waterMl:safeMl((d.waterMl||0)+Math.round(delta))}));
  const startFasting=()=>{
    if(data.profile.fastingAllowed===false){setSyncError("Fasting is disabled based on your medical-safety survey answer. Consult your clinician before enabling fasting.");return}
    setData(d=>({...d,fasting:{...d.fasting,activeStart:Date.now()}}))
  };
  const finishFasting=()=>{
    setData(d=>{
      const start=d.fasting.activeStart;if(!start)return d;
      const end=Date.now();
      const item={start,end,durationMin:Math.max(0,Math.floor((end-start)/60000)),goalHours:d.profile.fastingHours};
      return {...d,fasting:{activeStart:null,completed:[...d.fasting.completed,item]}};
    });
  };
  const reset=async()=>{
    if(window.prompt("To delete all tracking records, type DELETE")!=="DELETE")return;
    if(!window.confirm("Permanently remove all wellness entries and goals?"))return;
    if(session?.user&&supabase){
      const {error}=await supabase.from("wellness_records").delete().eq("user_id",session.user.id);
      if(error){setSyncError("Deletion failed: "+error.message);return}
    }
    setData(createEmptyData());
    setTab("home");
  };
  const deleteAccount=async()=>{
    if(!session?.user?.id||!supabase)return;
    if(window.prompt("To delete your FreeApp login account and tracking history, type DELETE")!=="DELETE")return;
    if(!window.confirm("Permanently delete your FreeApp account, all linked logs, and cloud records?"))return;
    try{
      const {data:result,error}=await supabase.functions.invoke("delete-account",{
        body:{confirmation:"DELETE"}
      });
      if(error||result?.deleted!==true)throw error||new Error("Deletion could not be confirmed.");
      try{localStorage.removeItem("slimsyfit-freeapp:v1:"+session.user.id)}catch{}
      try{await supabase.auth.signOut()}catch{}
      setData(createEmptyData());setSession(null);setGuestMode(false);
      setShowLogin(false);setShowSurvey(false);setDataReady(false);setLoadedIdentity(null);
      setSyncError("");
    }catch(err){
      setSyncError("Account deletion could not be completed: "+(err.message||"Please deploy the FreeApp delete-account Supabase function."));
    }
  };
  const signOut=async()=>{
    if(supabase&&session) await supabase.auth.signOut();
    setSession(null);setGuestMode(false);setDataReady(false);setLoadedIdentity(null);
    try{localStorage.removeItem("slimsyfit-freeapp:guest-active")}catch{}
    setShowLogin(false);setShowSurvey(false);setShowPlan(false);setCloudWritable(false);
  };
  if(passwordRecovery)return <ResetPasswordScreen onDone={()=>{
    setPasswordRecovery(false);setShowLogin(false);setShowSurvey(false);
    window.history.replaceState({}, "", "/");
  }}/>;
  if(!sessionReady)return <div className="authscreen"><div className="logo"><Leaf/></div><h2>Loading FreeApp…</h2></div>;
  if(!currentIdentity) return showLogin
    ? <AuthLanding enterLocal={()=>{
        try{localStorage.setItem("slimsyfit-freeapp:guest-active","1")}catch{}
        setGuestMode(true);setShowSurvey(!loadLocal("guest").profile.name);setShowLogin(false);
      }}/>
    : <PublicLandingPage
        onNew={()=>{
          try{localStorage.setItem("slimsyfit-freeapp:guest-active","1")}catch{}
          setGuestMode(true);setShowSurvey(true);
        }}
        onSignIn={()=>setShowLogin(true)}/>;
  if(!dataReady)return <div className="authscreen"><div className="logo"><Leaf/></div><h2>Restoring your tracker…</h2></div>;
  if(showSurvey||!data.profile.name)return <div className="shell"><SurveyFlow
    initialAnswers={data.profile.surveyAnswers||{}}
    initialName={data.profile.name||session?.user?.user_metadata?.full_name||""}
    onBack={()=>{
      if(!data.profile.name){
        setGuestMode(false);setShowLogin(false);setShowSurvey(false);
        try{localStorage.removeItem("slimsyfit-freeapp:guest-active")}catch{}
      }else setShowSurvey(false);
    }}
    onComplete={(answers,name)=>{
      const needsReview=answers.medicalSafety&&answers.medicalSafety!=="None of these apply";
      const fastingChoice=Number(String(answers.fastingWindow||"12:12").split(":")[0])||12;
      const weightUnit=String(answers.currentWeight||"").includes("kg")?"kg":"lbs";
      setData(prev=>({...prev,profile:{
        ...prev.profile,name,age:answers.age||"",gender:answers.gender||"",
        goal:answers.goal||"",diet:answers.diet||"Any",activity:answers.activity||"",
        bodyType:answers.bodyType||"",targetBody:answers.targetBody||"",
        currentWeight:answers.currentWeight||"",targetWeight:answers.targetWeight||"",
        height:answers.height||"",sleepPreference:answers.sleep||"",
        waterPreference:answers.water||"",fastingExperience:answers.fastingExp||"",
        fastingAllowed:!needsReview,fastingHours:needsReview?12:fastingChoice,
        weightUnit, surveyAnswers:answers
      }}));
      setShowSurvey(false);setTab("home");setDetailPage(null);
    }}
  /></div>;
  const openTab=id=>{
    setDetailPage(null);
    if(id==="plan"){setShowPlan(true);setTab("home")}
    else{setShowPlan(false);setTab(id)}
    window.scrollTo(0,0);
  };
  const goBack=()=>{setDetailPage(null);setShowPlan(false);setTab("home");window.scrollTo(0,0)};
  return <div className="shell">
    {detailPage==="water"?<WaterView data={data} today={today} onWater={changeWater} onBack={goBack}/>:
      detailPage==="weight"?<WeightView data={data} today={today} updateDay={updateDay} onBack={goBack}/>:
      showPlan?<PlanView data={data} onBack={goBack} onTrack={()=>openTab("track")}/>:
      tab==="home"?<SlimsyHome data={data} today={today} setTab={openTab} addWater={addWater}
        onOpenPlan={()=>openTab("plan")} onOpenSettings={()=>openTab("me")}
        onOpenWater={()=>{setShowPlan(false);setDetailPage("water");window.scrollTo(0,0)}}
        onOpenWeight={()=>{setShowPlan(false);setDetailPage("weight");window.scrollTo(0,0)}}/>:
      tab==="track"?<TrackScreen data={data} date={date} onDate={setDate} updateDay={updateDay}/>:
      tab==="habits"?<HabitsScreen data={data} today={today} onFasting={()=>openTab("fasting")}
        onTrack={()=>openTab("track")} onProgress={()=>openTab("progress")}/>:
      tab==="fasting"?<FastingScreen data={data} now={now} onStart={startFasting} onFinish={finishFasting}
        onHoursChange={h=>setData(d=>({...d,profile:{...d.profile,fastingHours:h}}))}/>:
      tab==="progress"?<ResultsView data={data} today={today}
        onWeight={()=>{setDetailPage("weight");window.scrollTo(0,0)}} onTrack={()=>openTab("track")}/>:
      <MeScreen data={data} identity={currentIdentity} session={session} onProfile={patchProfile}
        onSignOut={signOut} onReset={reset} onDeleteAccount={deleteAccount} syncState={syncState}
        onEditSurvey={()=>setShowSurvey(true)}
        onConnect={()=>{
          guestDraftRef.current=structuredClone(data);
          try{sessionStorage.setItem("freeapp:guest-transfer",JSON.stringify(data))}catch{}
          saveLocal("guest",data);
          setGuestMode(false);setShowSurvey(false);setShowLogin(true);
          try{localStorage.removeItem("slimsyfit-freeapp:guest-active")}catch{}
        }}/>}
    {syncError && <div className="error" role="status" style={{margin:"0 20px 12px"}}>{syncError}</div>}
    <div className="navwrap"><nav className="navbar" aria-label="Main navigation">
      {NAV.map(({id,label,Icon})=><button type="button" key={id} className={"navitem"+((showPlan?id==="plan":(detailPage?false:tab===id))?" on":"")}
        onClick={()=>openTab(id)}><Icon size={22}/><span>{label}</span></button>)}
    </nav></div>
  </div>;
}
