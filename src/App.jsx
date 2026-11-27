import { cloneElement, useEffect, useId, useRef, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Award, CalendarDays, Check, ChevronRight,
  CircleUserRound, Clock3, Cloud, CloudOff, Droplets, Flame, Footprints,
  Heart, Home, Leaf, LogOut, Moon, Plus, Scale, ShieldCheck,
  Sparkles, Sunrise, Target, Trash2, TrendingUp, UtensilsCrossed
} from "lucide-react";
import { supabase, isCloudConfigured, googleAvailable, googleLogin, emailSignIn, emailSignUp, requestPasswordReset, updateAccountPassword } from "./lib/supabase.js";
import PublicLandingPage from "./PublicLandingPage.jsx";
import { bmiValue, weightGoalProgress } from "./lib/metrics.js";
import SurveyFlow from "./SurveyFlow.jsx";
import SlimsyHome from "./SlimsyHome.jsx";
import {WaterView,WeightView,PlanView,ResultsView} from "./WellnessPages.jsx";
import {ActivityView,MilestoneModal,useReminders,RemindersCard} from "./ExtraPages.jsx";
import {MenuView} from "./MenuPage.jsx";
import "./public-landing.css";
import {
  blankDay, changeWeightUnit, createEmptyData, earnedBadges, levelInfo, loadLocal,
  localDay, normalizeData, rangeDates, safeMl, safeNumber, saveLocal, toClock
} from "./lib/tracker.js";

const NAV = [
  { id: "home", label: "Home", Icon: Home },
  { id: "track", label: "Nutrition", Icon: Activity },
  { id: "plan", label: "Plan", Icon: CalendarDays },
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
  const id = useId();
  return <div className="field"><label htmlFor={id}>{label}</label>{children ? cloneElement(children, { id }) :
    <input id={id} className="input" type={type} value={value ?? ""} min={min} max={max} step={step}
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
  const [hasGoogle, setHasGoogle] = useState(false);
  useEffect(() => { let on = true; googleAvailable().then(v => { if (on) setHasGoogle(v); }); return () => { on = false; }; }, []);
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
      {hasGoogle&&<><Button block outline disabled={busy} onClick={google}><Cloud size={17}/> Continue with Google</Button>
      <div className="dividerline"/></>}
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
    <p className="footer">Local mode saves on this device only. Sign in to sync across your devices.</p>
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

function DatePicker({ date, onPick }) {
  const days = rangeDates(localDay(),7);
  return <div className="picker" aria-label="Choose day">
    {days.map(day=><button key={day} type="button" className={day===date?"active":""} onClick={()=>onPick(day)}>
      <span>{new Date(day+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</span>
      <div style={{fontSize:16,marginTop:3}}>{day.slice(-2)}</div>
    </button>)}
  </div>;
}
function TrackScreen({ data, date, onDate, updateDay }) {
  const d=data.days[date]||blankDay();
  const [food,setFood]=useState({type:"Breakfast",name:"",calories:"",carbs:"",fat:"",protein:""});
  const [foodError,setFoodError]=useState("");
  const patch = changes => updateDay(date,old=>({...old,...changes}));
  const meals=d.meals||[];
  const addFood=e=>{
    e.preventDefault();
    if(!food.name.trim())return;
    const n = safeNumber(food.calories,20000);
    if(n===null){setFoodError("Enter valid calories (0–20,000)");return}
    const parts=["carbs","fat","protein"].map(k=>safeNumber(food[k],3000));
    if(parts.some(x=>x===null)){setFoodError("Enter nonnegative carbs, fat and protein amounts.");return}
    patch({meals:[...meals,{id:Date.now().toString(36),type:food.type,name:food.name.trim(),calories:n,carbs:parts[0],fat:parts[1],protein:parts[2]}]});
    setFood({...food,name:"",calories:"",carbs:"",fat:"",protein:""});setFoodError("");
  };
  const t=meals.reduce((a,x)=>({calories:a.calories+(+x.calories||0),protein:a.protein+(+x.protein||0)}),{calories:0,protein:0});
  const types=new Set(meals.map(m=>m.type)).size;
  const isToday=date===localDay();
  return <div className="sf-detail">
    <div className="sf-page-header"><div><h1>Nutrition</h1><small>Your meal plan and food log</small></div></div>
    <DatePicker date={date} onPick={onDate}/>
    <div className="sf-nutrition-summary">
      <img src="/assets/slimsyfit/images/nutrition/front-plan-bowl.png" alt="Balanced nutrition bowl"/>
      <div><span>{isToday?"TODAY'S NUTRITION":dateShort(date).toUpperCase()}</span><h3>{types}/4 meals</h3>
        <p>{t.calories} kcal · {t.protein}g protein logged</p></div>
    </div>
    <h2 className="sf-section">{isToday?"Today's Menu":"Menu for "+dateShort(date)}</h2>
    <MenuView data={data} date={date} updateDay={updateDay}/>
    <div className="sf-card">
      <div className="sf-heading-row"><h3>My food log</h3><span className="sf-green-chip">{t.calories} kcal</span></div>
      {meals.map((m,i)=><div className="sf-history-row" key={m.id||i}>
        <span><UtensilsCrossed size={14}/><span><b>{m.name}</b><br/><small className="sf-muted">{m.type} · P {m.protein}g · C {m.carbs}g · F {m.fat}g</small></span></span>
        <strong>{m.calories} kcal<button className="sf-icon-btn" aria-label={"Remove "+m.name}
          onClick={()=>patch({meals:meals.filter((_,j)=>j!==i)})}><Trash2 size={13}/></button></strong>
      </div>)}
      {meals.length===0&&<div className="sf-empty">No meals logged yet. Log a menu meal above or add your own below.</div>}
    </div>
    <div className="card">
      <h3>Add your own meal</h3>
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
      <p className="mini-help" style={{marginTop:10}}>Enter values from food labels or your own records. No AI estimation.</p>
    </div>
  </div>;
}

function FastingScreen({ data, now, onStart, onFinish, onHoursChange, onBack }) {
  const start=data.fasting.activeStart;
  const hours=data.profile.fastingHours;
  const elapsed=start ? Math.max(0,now-start):0;
  const goal=hours*3600*1000;
  const pct=Math.min(100,Math.floor(elapsed/goal*100));
  const logs=data.fasting.completed.slice().reverse().slice(0,10);
  return <>
    <BackHead title="Fasting timer" onBack={onBack}/>
    <div className="content">
      <Card>
        <div className="row"><h3>Choose a routine</h3><Tag>{hours}:{24-hours}</Tag></div>
        <div className="choice">
          {[12,14,16,18].map(h=><button key={h} type="button" className={h===hours?"active":""}
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

function MeScreen({ data, identity, session, onProfile, onUnitChange, onReminders, onSignOut, onReset, onDeleteAccount, onConnect, onEditSurvey, syncState }) {
  const p=data.profile;
  const [name,setName]=useState(p.name);
  const [diet,setDiet]=useState(p.diet);
  const [water,setWater]=useState(p.waterGoalMl);
  const [sleep,setSleep]=useState(p.sleepGoal);
  const [activity,setActivity]=useState(p.activityGoal);
  const [steps,setSteps]=useState(p.stepGoal||8000);
  const [unit,setUnit]=useState(p.weightUnit);
  const [exactAge,setExactAge]=useState(p.exactAge||"");
  const [targetWeight,setTargetWeight]=useState(p.targetWeight||"");
  const [message,setMessage]=useState("");
  const save=()=>{
    if(!name.trim())return;
    const validatedAge=exactAge===""?"":(Number.isInteger(Number(exactAge))&&Number(exactAge)>=18&&Number(exactAge)<=110?Number(exactAge):null);
    if(validatedAge===null){setMessage("Enter a valid exact age (18–110), or leave it blank.");return}
    const sleepGoal=Number(sleep),activityGoal=Number(activity),stepGoal=Number(steps),waterGoalMl=safeMl(water);
    if(!(sleepGoal>=1&&sleepGoal<=16)){setMessage("Sleep goal must be between 1 and 16 hours.");return}
    if(!(activityGoal>=1&&activityGoal<=1440)){setMessage("Activity goal must be between 1 and 1,440 minutes.");return}
    if(!(stepGoal>=100&&stepGoal<=100000)){setMessage("Step goal must be between 100 and 100,000.");return}
    if(waterGoalMl<250){setMessage("Water goal must be at least 250 ml.");return}
    onProfile({...p,name:name.trim(),diet,waterGoalMl,sleepGoal,activityGoal,stepGoal,exactAge:validatedAge,targetWeight});
    if(unit!==p.weightUnit)onUnitChange(unit);
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
        <div className="grid2">
          <FormField label="Activity goal (min)" type="number" min={1} max={1440} value={activity} onChange={setActivity}/>
          <FormField label="Daily step goal" type="number" min={100} max={100000} step={500} value={steps} onChange={setSteps}/>
        </div>
        {unit!==p.weightUnit&&<p className="mini-help">Saving will convert all your recorded weights to {unit}.</p>}
        <Button block onClick={save} disabled={!name.trim()}>Save preferences</Button>
        {message&&<div role="status" className={message.endsWith("saved.")?"success":"error"}>{message}</div>}
      </Card>
      <RemindersCard reminders={p.reminders||{}} onChange={onReminders}/>
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
  const badgeCountRef = useRef(null);
  const [celebrate,setCelebrate] = useState(null);
  useReminders(dataReady?data.profile.reminders:null);
  useEffect(()=>{
    if(!dataReady){badgeCountRef.current=null;return}
    const badges=earnedBadges(data);
    // First render after load just records the baseline; only new unlocks celebrate.
    if(badgeCountRef.current!==null&&badges.length>badgeCountRef.current)setCelebrate(badges.at(-1));
    badgeCountRef.current=badges.length;
  },[data,dataReady]);
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
  const patchProfile=profile=>setData(d=>({...d,profile:{...profile,weightUnit:d.profile.weightUnit}}));
  const switchUnit=unit=>setData(d=>changeWeightUnit(d,unit));
  const setReminders=reminders=>setData(d=>({...d,profile:{...d.profile,reminders}}));
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
      setData(prev=>{
        const profile={...prev.profile,name,age:answers.age||"",gender:answers.gender||"",
          goal:answers.goal||"",diet:answers.diet||"Any",activity:answers.activity||"",
          bodyType:answers.bodyType||"",targetBody:answers.targetBody||"",
          currentWeight:answers.currentWeight||"",targetWeight:answers.targetWeight||"",
          height:answers.height||"",sleepPreference:answers.sleep||"",
          waterPreference:answers.water||"",fastingExperience:answers.fastingExp||"",
          fastingAllowed:!needsReview,fastingHours:needsReview?12:fastingChoice,
          weightUnit,surveyAnswers:answers};
        const hasWeight=Object.values(prev.days).some(d=>d.weight!=null&&Number(d.weight)>0);
        const supplied=Number(String(answers.currentWeight||"").match(/^[0-9.]+/)?.[0]);
        const days=!hasWeight&&Number.isFinite(supplied)&&supplied>0
          ? {...prev.days,[today]:{...blankDay(),...(prev.days[today]||{}),weight:supplied}}
          : prev.days;
        return {...prev,profile,days};
      });
      setShowSurvey(false);setTab("home");setDetailPage(null);
    }}
  /></div>;
  const openTab=id=>{
    setDetailPage(null);
    if(id==="plan"){setShowPlan(true);setTab("home")}
    else{setShowPlan(false);setTab(id)}
    window.scrollTo(0,0);
  };
  const openDetail=page=>{setShowPlan(false);setDetailPage(page);window.scrollTo(0,0)};
  const goBack=()=>{setDetailPage(null);setShowPlan(false);setTab("home");window.scrollTo(0,0)};
  return <div className="shell">
    {detailPage==="water"?<WaterView data={data} today={today} onWater={changeWater} onBack={goBack}/>:
      detailPage==="weight"?<WeightView data={data} today={today} updateDay={updateDay} onBack={goBack}/>:
      detailPage==="activity"?<ActivityView data={data} today={today} updateDay={updateDay} onBack={goBack}/>:
      showPlan?<PlanView data={data} today={today} updateDay={updateDay}
        onFasting={()=>openTab("fasting")} onSettings={()=>openTab("me")}
        onWater={()=>openDetail("water")} onActivity={()=>openDetail("activity")} onWeight={()=>openDetail("weight")}/>:
      tab==="home"?<SlimsyHome data={data} today={today} setTab={openTab} addWater={addWater}
        onOpenPlan={()=>openTab("plan")} onOpenSettings={()=>openTab("me")}
        onOpenWater={()=>{setShowPlan(false);setDetailPage("water");window.scrollTo(0,0)}}
        onOpenWeight={()=>{setShowPlan(false);setDetailPage("weight");window.scrollTo(0,0)}}
        onOpenActivity={()=>{setShowPlan(false);setDetailPage("activity");window.scrollTo(0,0)}}/>:
      tab==="track"?<TrackScreen data={data} date={date} onDate={setDate} updateDay={updateDay}/>:
      tab==="fasting"?<FastingScreen data={data} now={now} onStart={startFasting} onFinish={finishFasting}
        onHoursChange={h=>setData(d=>({...d,profile:{...d.profile,fastingHours:h}}))} onBack={()=>openTab("plan")}/>:
      tab==="progress"?<ResultsView data={data} today={today} identity={currentIdentity}
        onActivity={()=>openDetail("activity")} onWater={()=>openDetail("water")}
        onWeight={()=>{setDetailPage("weight");window.scrollTo(0,0)}} onTrack={()=>openTab("track")}/>:
      <MeScreen data={data} identity={currentIdentity} session={session} onProfile={patchProfile}
        onUnitChange={switchUnit} onReminders={setReminders}
        onSignOut={signOut} onReset={reset} onDeleteAccount={deleteAccount} syncState={syncState}
        onEditSurvey={()=>setShowSurvey(true)}
        onConnect={()=>{
          guestDraftRef.current=structuredClone(data);
          try{sessionStorage.setItem("freeapp:guest-transfer",JSON.stringify(data))}catch{}
          saveLocal("guest",data);
          setGuestMode(false);setShowSurvey(false);setShowLogin(true);
          try{localStorage.removeItem("slimsyfit-freeapp:guest-active")}catch{}
        }}/>}
    <MilestoneModal badge={celebrate} onClose={()=>setCelebrate(null)}/>
    {syncError && <div className="error" role="status" style={{margin:"0 20px 12px"}}>{syncError}</div>}
    <div className="navwrap"><nav className="navbar" aria-label="Main navigation">
      {NAV.map(({id,label,Icon})=><button type="button" key={id} className={"navitem"+((detailPage?false:(showPlan||tab==="fasting")?id==="plan":tab===id)?" on":"")}
        onClick={()=>openTab(id)}><Icon size={22}/><span>{label}</span></button>)}
    </nav></div>
  </div>;
}
