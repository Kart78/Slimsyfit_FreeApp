import {useEffect,useState} from "react";
import {ArrowLeft,ChevronRight,Check,ShieldCheck,Leaf,ArrowRight} from "lucide-react";
import {STEPS} from "./surveySteps.js";
import "./survey.css";

const parseNumber=(raw)=>Number(String(raw||"").replace(/[^\d.]/g,""));

export default function SurveyFlow({initialAnswers={},onComplete,onBack,initialName=""}) {
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState(initialAnswers);
  const [value,setValue]=useState("");
  const [unit,setUnit]=useState("lbs");
  const [heightMode,setHeightMode]=useState("ft");
  const [feet,setFeet]=useState("");
  const [inches,setInches]=useState("");
  const [name,setName]=useState(initialName||"");
  const [phase,setPhase]=useState("questions");
  const [goNext,setGoNext]=useState(false);
  const current=STEPS[step];
  useEffect(()=>{
    if(!current)return;
    const existing=answers[current.id];
    if(current.t==="number"){
      const match=String(existing||"").match(/([\d.]+)\s*(lbs|kg)?/);
      setValue(match?.[1]||"");setUnit(match?.[2]||"lbs");
    }else if(current.t==="height"){
      const h=String(existing||"");
      if(h.includes("cm")){setHeightMode("cm");setValue(h.replace(/[^\d.]/g,""))}
      else {const parts=h.match(/(\d+)'(\d+)?/);setHeightMode("ft");setFeet(parts?.[1]||"");setInches(parts?.[2]||"")}
    }
  },[step]);
  const advance=(newAnswers=answers)=>{
    if(step<STEPS.length-1){setStep(i=>i+1);}
    else setPhase("ready");
  };
  const select=(option)=>{
    if(current.t==="multi"){
      setAnswers(prev=>{
        const selected=prev[current.id]||[];
        return {...prev,[current.id]:selected.includes(option)?selected.filter(x=>x!==option):[...selected,option]};
      });
      return;
    }
    const next={...answers,[current.id]:option};setAnswers(next);
    const safety=current.id==="medicalSafety"&&option!=="None of these apply";
    window.setTimeout(()=>{
      if(safety){setStep(STEPS.findIndex(x=>x.id==="barriers"));return;}
      advance(next);
    },190);
  };
  const saveNumeric=()=>{
    let text;
    if(current.t==="number")text=value+" "+unit;
    else text=heightMode==="ft"?feet+"'"+(inches||"0")+'"':value+" cm";
    const next={...answers,[current.id]:text};setAnswers(next);advance(next);
  };
  const num=Number(value);
  let valid=false;
  if(current?.t==="multi")valid=(answers[current.id]||[]).length>0;
  if(current?.t==="number")valid=Number.isFinite(num)&&num>=(unit==="lbs"?70:32)&&num<=(unit==="lbs"?700:318);
  if(current?.t==="height")valid=heightMode==="cm"
    ?num>=90&&num<=244
    :Number(feet)>=3&&Number(feet)<=8&&Number(inches||0)>=0&&Number(inches||0)<=11;
  const stepBack=()=>{
    if(phase==="ready"){setPhase("questions");return;}
    if(step===0){onBack();return;}
    if(step===STEPS.findIndex(x=>x.id==="barriers")
      &&answers.medicalSafety&&answers.medicalSafety!=="None of these apply"){
      setStep(STEPS.findIndex(x=>x.id==="medicalSafety"));return;
    }
    setStep(i=>i-1);
  };
  if(phase==="ready"){
    const safety=answers.medicalSafety!=="None of these apply";
    const fasting=safety?"Clinician review":String(answers.fastingWindow||"12:12").split(" ")[0];
    const diet=answers.diet||"Any";
    return <div className="survey-root"><div className="survey-top">
      <button className="survey-back" onClick={stepBack}><ArrowLeft size={17}/></button>
      <div className="survey-progress"><div style={{width:"100%"}}/></div><span>18/18</span>
    </div>
    <div className="survey-brand">◆ SlimSyFit FreeApp</div>
    <div className="survey-main">
      <span className="survey-kicker">✓ PLAN READY</span>
      <h1>Your plan is ready!</h1>
      <p className="survey-muted">Your answers are saved to your free manual tracker. No AI or subscriptions.</p>
      <div className="survey-results-grid">
        <div><span>⏱️</span><strong>{fasting}</strong><small>Fasting preference</small></div>
        <div><span>🥗</span><strong>{diet}</strong><small>Food preference</small></div>
        <div><span>💧</span><strong>Manual</strong><small>Daily tracking</small></div>
      </div>
      <div className="survey-preview">
        <h3>Your 4-week plan</h3>
        {[
          ["Week 1","Awareness and routine"],
          ["Week 2","Build consistency"],
          ["Week 3","Move and recover"],
          ["Week 4","Lifestyle habits"]
        ].map(([week,focus])=><div className="survey-preview-row" key={week}><strong>{week}</strong><span>{focus}</span><Check size={16}/></div>)}
      </div>
      {safety&&<div className="survey-safety">Your answers suggest fasting may need medical review. The app will not set fasting targets until you change that preference after consulting a clinician.</div>}
      <label className="survey-input-label" htmlFor="survey-name">Your name</label>
      <input id="survey-name" className="survey-big-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" maxLength={70}/>
      <button className="survey-continue" disabled={!name.trim()} onClick={()=>onComplete(answers,name.trim())}>Continue to Free Tracker <ArrowRight size={17}/></button>
      <p className="survey-footnote"><ShieldCheck size={13}/> No payment or AI integration required</p>
    </div></div>;
  }
  return <div className="survey-root">
    <div className="survey-top">
      <button className="survey-back" onClick={stepBack} aria-label="Go back"><ArrowLeft size={17}/></button>
      <div className="survey-progress"><div style={{width:((step+1)/STEPS.length*100)+"%"}}/></div>
      <span>{step+1}/{STEPS.length}</span>
    </div>
    <div className="survey-brand">◆ SlimSyFit FreeApp</div>
    <div className="survey-main" key={step}>
      <h1>{current.q}</h1>
      {current.sub&&<p className="survey-muted">{current.sub}</p>}
      <div className="survey-options">
        {(current.t==="single"||current.t==="multi")&&(current.opts||[]).map((option,i)=>{
          const checked=current.t==="multi"?(answers[current.id]||[]).includes(option.l):answers[current.id]===option.l;
          return <button type="button" className={"survey-option"+(checked?" active":"")} key={i} onClick={()=>select(option.l)}>
            {option.i&&<span className="survey-emoji">{option.i}</span>}
            <span className="survey-option-content"><strong>{option.l}</strong>{option.d&&<small>{option.d}</small>}</span>
            {checked?<Check size={17} color="#0A8F84"/>:<ChevronRight size={16} color="#D8EDEA"/>}
          </button>;
        })}
        {current.t==="number"&&<div>
          <div className="survey-segmented">{current.unit.map(u=><button type="button" key={u} className={unit===u?"active":""} onClick={()=>setUnit(u)}>{u}</button>)}</div>
          <input className="survey-big-input survey-center" type="number" value={value} onChange={e=>setValue(e.target.value)}
            aria-label={current.q+" in "+unit} placeholder={current.placeholder}/>
          <p className="survey-footnote">{unit==="lbs"?"Enter 70–700 lb":"Enter 32–318 kg"}</p>
          <button className="survey-continue" disabled={!valid} onClick={saveNumeric}>Continue <ArrowRight size={17}/></button>
        </div>}
        {current.t==="height"&&<div>
          <div className="survey-segmented">{["ft","cm"].map(u=><button type="button" key={u} className={heightMode===u?"active":""} onClick={()=>setHeightMode(u)}>{u==="ft"?"ft / in":"cm"}</button>)}</div>
          {heightMode==="ft"?<div className="survey-height-row">
            <div><input className="survey-big-input survey-center" aria-label="Feet" type="number" value={feet} onChange={e=>setFeet(e.target.value)} placeholder="5"/><small>feet</small></div>
            <div><input className="survey-big-input survey-center" aria-label="Inches" type="number" value={inches} onChange={e=>setInches(e.target.value)} placeholder="8"/><small>inches</small></div>
          </div>:<input className="survey-big-input survey-center" aria-label="Centimeters" type="number" value={value} onChange={e=>setValue(e.target.value)} placeholder="172"/>}
          <p className="survey-footnote">{heightMode==="ft"?"Enter 3–8 feet and 0–11 inches":"Enter 90–244 cm"}</p>
          <button className="survey-continue" disabled={!valid} onClick={saveNumeric}>Continue <ArrowRight size={17}/></button>
        </div>}
      </div>
      {current.t==="multi"&&<div className="survey-sticky"><button className="survey-continue" disabled={!valid} onClick={()=>advance()}>Continue <ArrowRight size={17}/></button></div>}
    </div>
  </div>;
}
