import {checkImportFormat} from './import-format-check.js';

const prompt=document.getElementById('ai-prompt');
const copy=document.getElementById('copy-prompt');
const status=document.getElementById('copy-status');
const file=document.getElementById('workout-file');
const input=document.getElementById('workout-text');
const check=document.getElementById('check-workout');
const results=document.getElementById('check-results');
const track=(name,params={})=>{if(typeof window.gtag==='function')window.gtag('event',name,{send_to:'G-F4FX8FFV2Y',...params});};
copy.disabled=false;check.disabled=false;
copy.addEventListener('click',async()=>{
  try {
    if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
    await navigator.clipboard.writeText(prompt.textContent);
    status.textContent='Prompt copied. Paste it into your preferred AI assistant and add your workout.';
    copy.textContent='Prompt copied ✓';track('workout_prompt_copy');
  } catch {
    prompt.closest('details').open=true;
    const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(prompt);selection.removeAllRanges();selection.addRange(range);
    status.textContent='Select and copy the prompt below, or use Download prompt (.txt).';prompt.focus();
  }
});
document.getElementById('download-prompt').addEventListener('click',()=>track('workout_prompt_download'));
const add=(parent,tag,text,className)=>{const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;parent.append(el);return el;};
file.addEventListener('change',async()=>{
  const chosen=file.files?.[0];if(!chosen)return;
  results.replaceChildren();
  if(!/\.txt$/i.test(chosen.name)){add(results,'p','Choose the plain-text .txt workout file, rather than the prompt or a rich-text document.');return;}
  if(chosen.size>1000000){add(results,'p','Choose a workout file under 1 MB.');return;}
  try{input.value=await chosen.text();add(results,'p','Workout loaded. Select Check format to review it.');}
  catch{add(results,'p','This file could not be read. Try pasting its plain text below.');}
});
check.addEventListener('click',()=>{
  results.replaceChildren();
  let outcome;
  try{outcome=checkImportFormat(input.value);}
  catch{add(results,'p','The checker could not read this content. Check that it contains only the generated plain-text workout.');return;}
  const {errors,warnings,plan}=outcome;
  add(results,'h3',errors.length?'Review the format before importing':'Format check passed',errors.length?'':'check-heading');
  if(errors.length){const list=add(results,'ul','');errors.slice(0,25).forEach(text=>add(list,'li',text));if(errors.length>25)add(results,'p','More issues were found. Correct the listed format issues, then check again.');}
  if(plan?.days.length){
    add(results,'p',`${plan.weeks?.length||1} ${plan.weeks?.length===1?'week':'weeks'} · ${plan.days.length} total sessions · ${plan.days.reduce((n,d)=>n+d.exercises.length,0)} exercise entries detected`);
    const wrap=add(results,'div','','table-wrap');const table=add(wrap,'table','');
    const caption=add(table,'caption','Detected sessions');caption.style.textAlign='left';
    const row=add(add(table,'thead',''),'tr','');['Week / day','Exercises','Rest timers'].forEach(text=>add(row,'th',text));
    const body=add(table,'tbody','');
    plan.days.slice(0,84).forEach(day=>{const r=add(body,'tr','');add(r,'td',day.name);add(r,'td',day.exercises.map(e=>`${e.name}: ${e.sets} × ${e.target}`).join('; '));add(r,'td',day.exercises.map(e=>e.restSeconds?`${e.restSeconds} sec`:'No fixed timer').join('; '));});
  }
  if(warnings.length){add(results,'h3','Items to review in P2S');const list=add(results,'ul','');warnings.slice(0,15).forEach(text=>add(list,'li',text));}
  if(!errors.length)add(results,'p','The checked structure is readable by the P2S importer. Compare it with your original workout and review it in P2S before saving.');
  track('workout_import_check',{format_result:errors.length?'needs_review':'passed'});
  results.focus();
});
