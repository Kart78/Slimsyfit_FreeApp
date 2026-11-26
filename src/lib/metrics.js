export function parseHeightCm(value) {
  const text=String(value??"").trim();
  const cm=text.match(/^([\d.]+)\s*cm$/i);
  if(cm){const n=Number(cm[1]);return n>=90&&n<=244?n:null;}
  const ft=text.match(/^(\d+)'\s*(\d{1,2})"?$/);
  if(ft){
    const feet=Number(ft[1]),inches=Number(ft[2]);
    if(feet>=3&&feet<=8&&inches>=0&&inches<=11)return +(feet*30.48+inches*2.54).toFixed(2);
  }
  return null;
}
export function parseWeightKg(value,fallbackUnit="kg") {
  const text=String(value??"").trim();
  const match=text.match(/^([\d.]+)\s*(kg|lbs|lb)?$/i);
  if(!match)return null;
  const n=Number(match[1]),unit=(match[2]||fallbackUnit).toLowerCase();
  if(!Number.isFinite(n)||n<=0||n>1000)return null;
  return unit==="kg"?n:n*0.45359237;
}
export function bmiValue(heightValue,weight,unit="kg") {
  const h=parseHeightCm(heightValue),kg=parseWeightKg(weight,unit);
  if(!h||!kg)return null;
  const m=h/100;
  const bmi=kg/(m*m);
  return Number.isFinite(bmi)&&bmi>=5&&bmi<=100?Number(bmi.toFixed(1)):null;
}
export function weightGoalProgress(current,starting,target,unit="kg") {
  const c=parseWeightKg(current,unit),s=parseWeightKg(starting,unit),t=parseWeightKg(target,unit);
  if(!c||!s||!t||Math.abs(s-t)<0.01)return null;
  const fraction=(s-c)/(s-t);
  return Math.round(Math.max(0,Math.min(1,fraction))*100);
}
