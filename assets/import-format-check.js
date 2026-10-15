import {parseWorkoutPlanText} from './p2s-workout-parser.js';

// Strict checks for the tab-separated format supplied by the AI prompt.
// These checks report issues without modifying the user's workout.
export function checkImportFormat(raw) {
  const errors = [], warnings = [];
  if (!raw.trim()) return {errors:['Choose a .txt file or paste its workout text first.'],warnings,plan:null};
  if (raw.length > 1000000) return {errors:['This text is too large for the checker. Use a file under 1 MB.'],warnings,plan:null};
  if (/^\s*\{\\rtf/i.test(raw)) return {errors:['This is rich text. Save the workout as a plain-text .txt file.'],warnings,plan:null};
  if (/```|<TAB>|\\t/.test(raw)) errors.push('Remove code fences and literal <TAB> or \\t placeholders. Use actual tab characters between columns.');
  const lines=raw.replace(/\r\n?/g,'\n').split('\n');
  const nonempty=lines.map((text,index)=>({text,index})).filter(x=>x.text.trim());
  const first=nonempty[0]?.text.trim();
  if (!first || first.includes('\t') || /^(?:#{1,6}\s*)?(?:week|day)\s*\d+/i.test(first)) errors.push('Put the program title on the first line, before the week/day headings.');
  const weeks=[]; let week=null,day=null,haveHeader=false;
  const finishDay=()=>{if(day && !day.rows.length)errors.push(`Week ${week.number}, Day ${day.number} has no exercise rows. Empty rest days are not stored as training slots; review the mapping.`);};
  const header='Exercise\tSets\tReps\tRest\tNotes';
  for (const {text,index} of nonempty.slice(1)) {
    const line=text.trim(); const label=`Line ${index+1}`;
    const wh=line.match(/^(?:##\s*)?Week\s+(\d+)$/i);
    if (wh) {
      finishDay(); week={number:Number(wh[1]),days:[]};weeks.push(week);day=null;haveHeader=false;continue;
    }
    const dh=line.match(/^Day\s+(\d+)\s*-\s*(.+)$/i);
    if (dh) {
      finishDay();
      if (!week) {errors.push(`${label}: add a Week 1 heading before the first day.`);continue;}
      day={number:Number(dh[1]),name:dh[2],rows:[]};week.days.push(day);haveHeader=false;
      if (/^(?:rest|off|recovery)(?: day)?$/i.test(dh[2])) errors.push(`${label}: P2S skips a plain rest/off/recovery heading. Ask how to map the source schedule before generating the file.`);
      continue;
    }
    if (text===header) {if(!day)errors.push(`${label}: the table header needs a numbered day heading.`);haveHeader=true;continue;}
    if (!day || !haveHeader) {errors.push(`${label}: expected a week heading, day heading, or the exact tab-separated Exercise / Sets / Reps / Rest / Notes header.`);continue;}
    const cells=text.split('\t').map(v=>v.trim());
    if(cells.length!==5) {errors.push(`${label}: expected 5 tab-separated columns; found ${cells.length}.`);continue;}
    const [name,sets,reps,rest,notes]=cells;
    if(cells.some(v=>!v))errors.push(`${label}: fill all five columns; use - for empty notes.`);
    if(!/^\d+$/.test(sets)||Number(sets)<1||Number(sets)>12)errors.push(`${label}: working sets must be an integer from 1 to 12.`);
    if(!name||/^\d+[a-z]?[.)]\s/i.test(name))errors.push(`${label}: use an exercise name without list numbering.`);
    if(!reps||/^(?:-|reps?|duration|target|number of reps)$/i.test(reps))errors.push(`${label}: provide the actual rep, time or distance target.`);
    if(/\bRPE\b|rate of perceived effort/i.test(text))errors.push(`${label}: use Effort: [value] in Notes in place of the RPE label; the current importer can skip rows containing that label.`);
    const ruck=/^Ruck$/i.test(name);
    const fixed=/^\d+(?:\.\d+)?\s*(?:sec|secs|seconds|min|mins|minutes)$/i.test(rest);
    if(!fixed&&!(ruck&&/^as needed$/i.test(rest)))errors.push(`${label}: use one fixed rest time with units, such as 90 sec or 3 min. As needed is supported for a confirmed ruck instruction.`);
    if(ruck&&Number(sets)!==1)errors.push(`${label}: the prompt's ruck format uses 1 set.`);
    if(ruck&&!/\d/.test(reps))errors.push(`${label}: specify the source's ruck duration or distance.`);
    if(/\bruck\b/i.test(name)&&!ruck)warnings.push(`${label}: use the exercise name Ruck and put extra details in Notes.`);
    day.rows.push(cells);
  }
  finishDay();
  if(!weeks.length)errors.push('Include an explicit Week 1 heading, with additional week headings for a multiweek plan.');
  if(weeks.length>12)errors.push('The current builder supports up to 12 weeks. Ask how to handle a longer source plan.');
  for(let i=0;i<weeks.length;i++) {
    const w=weeks[i];
    if(w.number!==i+1)errors.push('Week numbers must start at 1 and continue in order without duplicates or gaps.');
    if(!w.days.length||w.days.length>7)errors.push(`Week ${w.number}: use 1–7 training slots.`);
    for(let j=0;j<w.days.length;j++)if(w.days[j].number!==j+1)errors.push(`Week ${w.number}: the training-day numbers have gaps, duplicates or a different order. Confirm the mapping to consecutive P2S training slots.`);
    if(w.days.length!==weeks[0].days.length)errors.push('The number of training slots changes between weeks. Review how this maps into the current builder before importing.');
  }
  const plan=parseWorkoutPlanText(raw);
  warnings.push(...plan.warnings);
  const expected=weeks.flatMap(w=>w.days).reduce((sum,d)=>sum+d.rows.length,0);
  const detected=plan.days.reduce((sum,d)=>sum+d.exercises.length,0);
  if(expected!==detected)errors.push(`The importer detected ${detected} exercise rows, while the file lists ${expected}. Review rows the importer may have skipped or combined.`);
  if(weeks.length && (plan.weeks?.length!==weeks.length || plan.days.length!==weeks.reduce((n,w)=>n+w.days.length,0)))errors.push('The importer’s detected week/day grouping does not match the file. Review the headings and source schedule.');
  const inputRows=weeks.flatMap(w=>w.days).flatMap(d=>d.rows);
  const detectedRows=plan.days.flatMap(d=>d.exercises);
  if(expected===detected) inputRows.forEach((row,i)=>{
    const parsed=detectedRows[i];
    if(parsed.sets!==Number(row[1]))errors.push(`${row[0]}: the detected set count differs from the file.`);
    if(parsed.target==='Complete')errors.push(`${row[0]}: the rep, duration or distance target was not recognized. Ask the AI to clarify the prescription before importing.`);
    const rest=row[3].match(/^(\d+(?:\.\d+)?)\s*(sec|secs|seconds|min|mins|minutes)$/i);
    if(rest){const seconds=Math.round(Number(rest[1])*(/^min/i.test(rest[2])?60:1));if(parsed.restSeconds!==seconds)errors.push(`${row[0]}: the rest timer did not parse as specified.`);}
    if(parsed.needsReview&&!/^Ruck$/i.test(row[0]))warnings.push(`Review ${row[0]} in P2S: it may be a custom movement or need prescription review.`);
  });
  return {errors:[...new Set(errors)],warnings:[...new Set(warnings)],plan,weeks};
}
