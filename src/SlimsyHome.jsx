import {Settings,ChevronRight,ArrowRight,Sun,Activity,CalendarDays,Heart,Flame} from "lucide-react";
import {levelInfo, earnedBadges} from "./lib/tracker.js";
import {ColorMetrics} from "./WellnessPages.jsx";
import {bmiValue} from "./lib/metrics.js";
import "./slimsy-home.css";

const A="/assets/slimsyfit";
const TILES=[
  {id:"nutrition",title:"Nutrition",image:"/images/nutrition/front-plan-bowl.png",color:"#EFFBF7",border:"#D4F1E9"},
  {id:"water",title:"Hydration",image:"/images/icons/water-drop.png",color:"#DAEFFD",border:"#C8E9F3"},
  {id:"activity",title:"Activity",image:"/images/activity/move-today.png",color:"#FFF4E8",border:"#FBE4CD"},
  {id:"weight",title:"Weight & Progress",image:"/images/wellness/weight-bmi-bmr.png",color:"#F3F1FF",border:"#E4E3F8"}
];
export default function SlimsyHome({data,today,setTab,onOpenPlan,onOpenSettings,onOpenWater,onOpenWeight,addWater}) {
  const p=data.profile,d=data.days[today]||{};
  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const name=(p.name||"Friend").split(" ")[0];
  const logged=d.meals||[];
  const count=new Set(logged.map(m=>m.type)).size;
  const water=Math.max(0,d.waterMl||0);
  const cups=Math.round(water/((p.waterGoalMl||2000)/8));
  const activity=(d.activity||[]).reduce((n,a)=>n+(Number(a.minutes)||0),0);
  const weight=d.weight||Object.entries(data.days).filter(([,x])=>x.weight!=null).sort((a,b)=>b[0].localeCompare(a[0]))[0]?.[1]?.weight;
  const level=levelInfo(data);
  const bmi=bmiValue(p.height||p.heightCm,weight,p.weightUnit);
  const stats={
    nutrition:{value:count+"/4 meals",detail:Math.round(count/4*100)+"% of today's meal logging",pct:count/4*100},
    water:{value:cups+"/8 cups",detail:Math.round(water/Math.max(p.waterGoalMl||2000,1)*100)+"% of daily hydration",pct:water/(p.waterGoalMl||2000)*100},
    activity:{value:activity+"/"+(p.activityGoal||30)+" min",detail:Math.round(activity/(p.activityGoal||30)*100)+"% of daily movement",pct:activity/(p.activityGoal||30)*100},
    weight:{value:weight?weight+" "+(p.weightUnit||"kg"):"Add weight",detail:bmi?"BMI "+bmi+" · recorded progress":"Add a weigh-in to get started",pct:0}
  };
  const openTile=id=>id==="water"?onOpenWater():id==="weight"?onOpenWeight():setTab("track");
  return <div className="original-home">
    <div className="original-home-head">
      <div>
        <h1>{greeting}, {name}! <span role="img" aria-label="sun">☀️</span></h1>
        <p>Keep building healthy habits</p>
      </div>
      <button className="original-settings" onClick={onOpenSettings} aria-label="Open account settings"><Settings size={23}/></button>
    </div>

    <div className="original-priority">
      <img src={A+"/images/activity/move-today.png"} alt="Walking illustration"/>
      <div><span>TODAY’S PRIORITY</span><h2>Move your body</h2><p>Choose a comfortable activity you can repeat consistently.</p></div>
    </div>

    <button type="button" className="original-plan" onClick={onOpenPlan}>
      <div><span>YOUR PERSONAL PLAN</span>
        <h2>Your daily wellness plan</h2>
        <p>Nutrition, activity and habits built around your routine.</p>
        <b>View My Plan <ArrowRight size={15}/></b>
      </div>
      <img src={A+"/images/nutrition/front-plan-bowl.png"} alt="Balanced nutrition bowl"/>
    </button>
    <div className="original-tiles">
      {TILES.map(t=><button type="button" className="original-tile" key={t.id}
        style={{background:t.color,borderColor:t.border}} onClick={()=>openTile(t.id)}>
        <div className="original-tile-top">
          <img src={A+t.image} alt="" />
          <ChevronRight size={21}/>
        </div>
        <h3>{t.title}</h3>
        <strong>{stats[t.id].value}</strong>
        <p>{stats[t.id].detail}</p>
        <div className="original-track"><div style={{width:Math.min(100,stats[t.id].pct)+"%"}}/></div>
      </button>)}
    </div>
    <div className="original-focus">
      <div className="original-focus-mark">◎</div>
      <div><span>TODAY'S FOCUS</span><h3>Make healthy choices one step at a time.</h3></div>
    </div>
    <div className="original-latest">
      <div className="original-latest-title"><div><span>LATEST HEALTH METRICS</span><h3>Your latest result</h3></div>
        <button type="button" onClick={()=>setTab("progress")}>View all</button></div>
      <ColorMetrics data={data}/>
    </div>
    <div className="original-subcards">
      <div className="original-mini">
        <div className="original-mini-head"><img src={A+"/animations/walking.gif"} alt="Walking animation"/><div><span>MOVE TODAY</span><h3>Activity matters</h3></div></div>
        <p>Log your daily movement and keep your energy up.</p>
        <button onClick={()=>setTab("track")}>Log Activity <ChevronRight size={15}/></button>
      </div>
      <div className="original-mini">
        <div className="original-mini-head"><span className="original-emblem">🏅</span><div><span>YOUR COMMITMENT</span><h3>{level.name}</h3></div></div>
        <p>{level.count} weight entries · {earnedBadges(data).length} achievement badges</p>
        <button onClick={()=>setTab("progress")}>View Results <ChevronRight size={15}/></button>
      </div>
    </div>
    <div className="original-disclaimer">Free manual tracker · No AI · No payments or subscriptions</div>
  </div>;
}
