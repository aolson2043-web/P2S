// P2S RC42 Importer Fix parser; TypeScript types removed for browser use.
import {EXERCISE_GUIDES} from './exercise-guide-names.js';
                                                           

                            
              
              
                
                     
                
                    
              
                      
                        
  

                                                                      
                                                                                                                                                                                                        

const normalize=(value       )=>value.toLowerCase().replace(/[—–-]+/g,' ').replace(/\//g,' ').replace(/[^a-z0-9+]+/g,' ').replace(/\s+/g,' ').trim();
const titleCase=(value       )=>value.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bDb\b/g,'DB').replace(/\bKb\b/g,'KB').replace(/\bRdl\b/g,'RDL').replace(/\bOhp\b/g,'OHP');

const aliasMap=(()=>{
  const map=new Map               ();
  for(const guide of EXERCISE_GUIDES){
    map.set(normalize(guide.title),guide.title);
    for(const alias of guide.aliases)map.set(normalize(alias),guide.title);
  }
  const extra                      ={
    'db bench':'Dumbbell Bench Press','dumbbell bench':'Dumbbell Bench Press','kb swing':'Kettlebell Swing',
    'ohp':'Overhead Press','strict press':'Overhead Press','rdl':'Romanian Deadlift','pullups':'Pull-Up','pull ups':'Pull-Up',
    'pushups':'Push-Up','push ups':'Push-Up','goblet squats':'Goblet Squat','farmers carry':'Farmer Carry','farmer carries':'Farmer Carry',
    'hanging leg raises':'Hanging Knee / Leg Raise','hanging knee raises':'Hanging Knee / Leg Raise'
  };
  Object.entries(extra).forEach(([k,v])=>map.set(normalize(k),v));
  return map;
})();

const canonicalName=(raw       )=>{
  const cleaned=raw.replace(/^[-•*]\s*/,'').replace(/\s+/g,' ').trim();
  const exact=aliasMap.get(normalize(cleaned));
  if(exact)return exact;
  // Strip common prescription suffixes and retry.
  const stripped=cleaned
    .replace(/\s+\d+\s*(?:x|×)\s*\d+(?:\s*[-–]\s*\d+)?(?:\s*@.*)?$/i,'')
    .replace(/\s+\d+\s+sets?\s+(?:of\s+)?\d+(?:\s*[-–]\s*\d+)?(?:\s*@.*)?$/i,'')
    .replace(/\s+\d+(?:\.\d+)?\s*(?:sec|secs|seconds|min|mins|minutes|mi|mile|miles|m|meters?|yd|yards?)\b.*$/i,'')
    .trim();
  return aliasMap.get(normalize(stripped))||titleCase(stripped||cleaned);
};

const durationTarget=(line       )=>{
  const sec=line.match(/(\d+(?:\.\d+)?)\s*(?:sec|secs|seconds)\b/i);if(sec)return`${sec[1]} sec`;
  const min=line.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minutes)\b/i);if(min)return`${min[1]} min`;
  const dist=line.match(/(\d+(?:\.\d+)?)\s*(mi|mile|miles|km|kilometers?|m|meters?|yd|yards?)\b/i);if(dist)return`${dist[1]} ${dist[2] .toLowerCase()}`;
  return'';
};

const parseRest=(line       )=>{
  const m=line.match(/(?:rest\s*)?(\d+(?:\.\d+)?)(?:\s*[-–—]\s*(\d+(?:\.\d+)?))?\s*(sec|secs|seconds|min|mins|minutes)\s*(?:rest)?/i);
  if(!m)return 0;const v=Math.max(Number(m[1]),Number(m[2]||m[1]));return /min/i.test(m[3] )?Math.round(v*60):Math.round(v);
};

const looksLikeHeading=(line       )=>/^(?:week\s*\d+\s*)?(?:day\s*\d+|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s*[:\-–—].*)?$/i.test(line.trim());
const headingName=(line       )=>line.replace(/^week\s*\d+\s*/i,'').replace(/\s*[:\-–—]\s*/g,' • ').trim();
const looksLikeTitle=(line       )=>line.length<70&&!/\d+\s*(?:x|×|sets?|reps?|sec|min|mi|km|yd|round)/i.test(line)&&!/^rest\b/i.test(line)&&!looksLikeHeading(line);
const isKnownMovementName=(line       )=>aliasMap.has(normalize(line.replace(/^[-•*]\s*/,'')));
const isLikelyPlanTitle=(line       ,nextLines         )=>looksLikeTitle(line)&&!isKnownMovementName(line)&&(/\b(program|plan|training|workout|strength|conditioning|fitness)\b/i.test(line)||nextLines.some(looksLikeHeading));

function parseExerciseLine(line       ,circuitRounds        )                    {
  let text=line.replace(/^[-•*]\s*/,'').replace(/^(?:\d+[a-z]?[.)]|[A-Z]\d+[.)])\s+/,'').trim();
  if(!text||/^rest\b/i.test(text)||/^(?:week|day)\s*\d+/i.test(text))return null;
  let sets=1,target='',weight='',restSeconds=0,mode             ='reps',note='';

  const inlineRest=text.match(/\brest\s*(\d+(?:\.\d+)?)(?:\s*[-–—]\s*(\d+(?:\.\d+)?))?\s*(sec|secs|seconds|min|mins|minutes)\b(?:\s+(?:after|between)\s+rounds?)?/i);
  if(inlineRest){const first=Number(inlineRest[1]),second=inlineRest[2]?Number(inlineRest[2]):first,timerValue=Math.max(first,second),minutes=/min/i.test(inlineRest[3] );restSeconds=Math.round(timerValue*(minutes?60:1));if(inlineRest[2])note=`Rest range ${inlineRest[1]}–${inlineRest[2]} ${inlineRest[3]}; timer uses the upper end (${timerValue} ${inlineRest[3]}).`;text=text.replace(inlineRest[0],'').trim();}
  const load=text.match(/(?:@|(?:load|weight)\s*[:=])\s*([\d.]+)\s*(lb|lbs|kg)?/i);
  if(load){weight=load[1] ;text=text.replace(load[0],'').trim();if(load[2])note=`Load entered in ${/kg/i.test(load[2])?'kg':'lb'}; match your profile units before saving.`;}

  const failure=text.match(/\b(\d+)\s*(?:x|×|sets?\s*(?:of)?)\s*(?:failure|to failure|AMRAP|max reps)\b/i);
  if(failure){sets=Number(failure[1]);target='AMRAP';text=text.replace(failure[0],'').trim();}
  const amrap=text.match(/(\d+(?:\.\d+)?)\s*min(?:ute)?s?\s*amrap/i);
  if(amrap){mode='amrap';target=`${amrap[1]} min AMRAP`;sets=1;text=text.replace(amrap[0],'').trim();}
  const sxr=text.match(/\b(\d+)\s*(?:x|×)\s*(\d+(?:\s*[-–]\s*\d+)?)\s*(reps?|sec|secs|seconds|min|mins|minutes|mi|mile|miles|km|kilometers?|m|meters?|yd|yards?)?\b/i);
  if(sxr){sets=Math.max(1,Number(sxr[1]));const unit=/^reps?$/i.test(sxr[3]||'')?'':sxr[3]?.toLowerCase()||'';target=`${sxr[2] .replace(/\s+/g,'')}${unit?` ${unit}`:''}`;if(/sec|min/.test(unit))mode='timed';else if(unit)mode='cardio';text=text.replace(sxr[0],'').trim();}
  const setsOf=text.match(/\b(\d+)\s*sets?\s*(?:of\s*)?(\d+(?:\s*[-–]\s*\d+)?)\s*(reps?|sec|secs|seconds|min|mins|minutes|mi|mile|miles|km|kilometers?|m|meters?|yd|yards?)?\b/i);
  if(!target&&setsOf){sets=Math.max(1,Number(setsOf[1]));const unit=/^reps?$/i.test(setsOf[3]||'')?'':setsOf[3]?.toLowerCase()||'';target=`${setsOf[2] .replace(/\s+/g,'')}${unit?` ${unit}`:''}`;if(/sec|min/.test(unit))mode='timed';else if(unit)mode='cardio';text=text.replace(setsOf[0],'').trim();}
  const explicitSets=text.match(/\bsets?\s*[:=]\s*(\d+)\b/i)||text.match(/\b(\d+)\s+sets?\b/i);
  if(!target&&explicitSets){sets=Number(explicitSets[1]);text=text.replace(explicitSets[0],'').trim();}
  const repsFirst=text.match(/\breps?\s*[:=]\s*(\d+(?:\s*[-–]\s*\d+)?)/i)||text.match(/\b(\d+(?:\s*[-–]\s*\d+)?)\s*reps?\b/i);
  if(!target&&repsFirst){target=repsFirst[1] ;text=text.replace(repsFirst[0],'').trim();}

  const timed=durationTarget(text);
  if(!target&&timed){target=timed;mode=/sec|min/i.test(timed)?'timed':'cardio';text=text.replace(new RegExp(timed.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),'').trim();}
  const maxMatch=text.match(/\b(?:max|max reps|amrap reps)\b/i);
  if(!target&&maxMatch){target='AMRAP';text=text.replace(maxMatch[0],'').trim();}

  // Circuit shorthand lines like "10 Push-Ups".
  const leadingReps=text.match(/^(\d+)\s+(.+)$/);
  if(!target&&leadingReps){target=leadingReps[1] ;text=leadingReps[2] .trim();}

  const perSide=text.match(/\b(?:each(?:\s+(?:side|leg|arm))?|per\s+(?:side|leg|arm))\b/i);
  if(target&&perSide){target+=' / side';text=(text.slice(0,perSide.index)+text.slice(perSide.index +perSide[0].length)).trim();}
  text=text.replace(/\breps?\s*$/i,'').replace(/^[\s:|,;–—-]+|[\s:|,;–—-]+$/g,'').replace(/\s{2,}/g,' ').trim();
  if(!text)return null;
  const name=canonicalName(text);
  if(!target){target='Complete';mode='completion';}
  if(circuitRounds&&mode==='reps'){note=[note,`${circuitRounds} round circuit`].filter(Boolean).join(' • ');}
  if(sets<1||sets>12||circuitRounds&&circuitRounds>12)note=[note,'Review set count: the builder supports 1–12 sets per exercise.'].filter(Boolean).join(' • ');
  const hasChoice=/\bor\b/i.test(name);
  if(hasChoice)note=[note,'Choose one of the listed exercise alternatives in the builder.'].filter(Boolean).join(' • ');
  const known=[...aliasMap.values()].some(v=>normalize(v)===normalize(name));
  return{name,sets,target,restSeconds,weight,mode,note,needsReview:hasChoice||!known||target==='Complete'||!!load?.[2]||sets<1||sets>12||!!(circuitRounds&&circuitRounds>12)||!!(explicitSets&&!repsFirst&&!target),circuitRounds};
}

const numberWords                      ={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12};
const countValue=(value       )=>numberWords[value.toLowerCase()]||Number(value);
const countPattern='(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)';
const weekdays='monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun';
const dayHeader=new RegExp(`^(?:day\\s*\\d+|${weekdays})(?:\\s*[:–—-]\\s*(.*))?$`,'i');
const routineHeader=/^(?:workout|routine|session)\s+[a-z0-9]+(?:\s*[:–—-]\s*[^0-9]+)?\s*:?$|^(?:upper(?: body)?|lower(?: body)?|push|pull|legs|full body)(?:\s+(?:day|workout))?\s*:?$/i;
const cleanText=(raw       )=>String(raw||'').replace(/\r/g,'').replace(/&#x([0-9a-f]+);|&#(\d+);|&nbsp;/gi,(_,hex,decimal)=>{const code=hex?parseInt(hex,16):decimal?Number(decimal):32;return code>0&&code<=0x10ffff?String.fromCodePoint(code):' ';}).replace(/\u00a0/g,' ')
  .replace(/\[\[\d+\]\]\(https?:\/\/[^)]+\)/g,'')
  .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g,'$1')
  .replace(/https?:\/\/\S+/g,'').replace(/\*\*|__|`/g,'')
  .replace(/^\s*[-•*]\s+/gm,'').replace(/^\s*#{1,6}\s+/gm,'').trim();

export function parseWorkoutPlanText(raw       )                  {
  const source=cleanText(raw);
  if(!source)return{title:'Imported Program',days:[],warnings:['Paste a workout plan to begin.']};
  // A pasted article can contain mutually exclusive programs. Do not merge them.
  if(/^.*\b(?:alternative|option\s*2)\s*:?$/im.test(source)&&/^(?:day\s*\d+|workout\s+[a-z0-9]+)\b/im.test(source)){
    return{title:'Multiple program options',days:[],warnings:['This paste contains separate program options. Paste either the main program or the alternative on its own so their schedules are not combined.'],notes:[source]};
  }
  const lines=source.split('\n').map(v=>v.trim()).filter(Boolean);
  const warnings         =[],notes         =[];
  const frequency=source.match(new RegExp(`\\b${countPattern}\\s*(?:x|times?|days?|workouts?|sessions?)\\s*(?:/|per|a)\\s*week\\b`,'i'));
  const trainingDays=source.match(/^Train on ([^.]+)\./im)?.[1]?.match(/\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi);
  const frequencyPerWeek=frequency?countValue(frequency[1] ):trainingDays?new Set(trainingDays.map(day=>day.toLowerCase())).size:undefined;
  const duration=source.match(new RegExp(`\\b${countPattern}[- ]weeks?\\s+(?:[a-z]+\\s+){0,3}(?:program|plan|cycle)`,'i'))||source.match(new RegExp(`(?:duration\\s*[:=]?|for|repeat for)\\s*${countPattern}\\s*weeks?\\b`,'i'));
  let durationWeeks=duration?countValue(duration[1] ):undefined;
  let title='Imported Program',week                 ,circuitRounds                 ;
  let current                 ={name:'Day 1',exercises:[]};
  const definitions                   =[],weekDays=new Map                           ();
  const schedule                                                        =[];
  let tableHeaders                   ;
  const flush=()=>{if(!current.exercises.length)return;definitions.push(current);if(week){const group=weekDays.get(week)||[];group.push(current);weekDays.set(week,group);}current={name:`Day ${definitions.length+1}`,exercises:[]};};
  const startDay=(name       )=>{flush();current={name:week?`Week ${week} • ${name}`:name,exercises:[]};circuitRounds=undefined;tableHeaders=undefined;};
  for(let i=0;i<lines.length;i++){
    let line=lines[i] .replace(/^(\d+[.)])\s+/,'');
    line=line.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)(?=\s+(?:sets?|reps?|rounds?)\b)/gi,w=>String(countValue(w)));
    if(/^(?:notes?|weekly schedule(?: example)?)\s*:/i.test(line)){notes.push(line);continue;}
    if(/^(?:man|woman|person|athlete)\s+(?:performing|doing|demonstrating)\b/i.test(line)){notes.push(line);continue;}
    // Browser and spreadsheet copies use tabs; some sites use aligned spaces.
    if(line.includes('\t')||/\S {2,}\S/.test(line))line=line.split(/\t+| {2,}/).map(cell=>cell.trim()).join(' | ');
    line=line.replace(/^(day\s*\d+)\s*--+\s*/i,'$1 - ');
    const weekHeading=line.match(/^week\s*(\d+)\s*(?:[:–—-]\s*)?(.*)$/i);
    if(weekHeading){flush();week=Number(weekHeading[1]);const rest=weekHeading[2] .trim();if(!rest)continue;line=rest;}
    // Titles and coaching prose can appear after a weekly schedule.
    if(isLikelyPlanTitle(line,[])&&/\b(?:program|plan|cycle)\b/i.test(line)&&!/\d+\s*[x×]\s*\d+/.test(line)){title=line;continue;}
    if(/\b(?:RPE|rate of perceived effort)\b/i.test(line)&&!/^\|/.test(line)&&!/\d+\s*[x×]\s*\d+/.test(line)){notes.push(line);continue;}
    if(/^\|?\s*:?-{3,}/.test(line))continue;
    if(line.includes('|')){
      const cells=line.replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      if(cells.some(c=>/^(?:exercise|movement|exercise name)$/i.test(c))){tableHeaders=cells.map(normalize);continue;}
      if(tableHeaders){
        const get=(...keys         )=>{const index=tableHeaders .findIndex(h=>keys.includes(h));return index<0?'':cells[index]||'';};
        const movement=get('exercise','movement','exercise name');
        const label=movement.match(/^(\d+[a-z]?)[.)]\s+/i)?.[1];
        const name=movement.replace(/^\d+[a-z]?[.)]\s+/i,'');
        const work=get('work sets','working sets','working set','work set');
        const sets=get('sets','set'),reps=get('reps','repetitions','rep');
        const prescription=work?(/^\d+$/.test(work)&&reps?`${work} x ${reps}`:work):sets&&reps?`${sets} x ${reps}`:reps?`${reps} reps`:get('duration','time','distance');
        if(!name){warnings.push(`Missing exercise name in table row: “${line}”`);continue;}
        const rest=get('rest','rest period');
        const exercise=parseExerciseLine([name,prescription,rest&&parseRest(rest)?`rest ${rest}`:'',get('weight','load')?`@ ${get('weight','load')}`:''].filter(Boolean).join(' '),circuitRounds);
        if(exercise){
          const warm=get('warm up sets','warmup sets','warm up','warmup','warm ups','warm ups sets');
          const method=get('intensity method','intensity technique','method','notes');
          exercise.note=[exercise.note,warm&&warm!=='-'?`Warm-up only: ${warm} (excluded from working sets).`:'',method&&method!=='-'?`Intensity method: ${method}.`:'',label&&/[a-z]$/i.test(label)?`Pair ${label.replace(/[a-z]$/i,'')}: exercise ${label} (superset order).`:''].filter(Boolean).join(' • ');
          if(!prescription||/^\d+$/.test(prescription)){exercise.needsReview=true;warnings.push(`Working-set prescription needs review for ${name}.`);}
          current.exercises.push(exercise);
        }else warnings.push(`Could not parse table exercise: “${line}”`);
        continue;
      }
    }
    const day=line.match(dayHeader);
    if(day){const reference=day[1]?.replace(/:$/,'').trim();if(reference&&/^(?:rest|off|recovery)(?: day)?$/i.test(reference)){notes.push(line);flush();continue;}
      if(reference&&/^cardio$/i.test(reference)){
        flush();notes.push(line);
        const day                 ={name:line,exercises:[{name:'Cardio',sets:1,target:'Complete',restSeconds:0,weight:'',mode:'completion',note:'Cardio type, duration and intensity were not specified. Set these in the builder before training.',needsReview:true}]};
        schedule.push({week,reference,day});continue;
      }
      if(reference&&!/^day\s*\d+/i.test(line)&&routineHeader.test(reference)){flush();schedule.push({week,reference});continue;}
      startDay(line.replace(/:$/,'').trim());continue;
    }
    if(routineHeader.test(line)){startDay(line.replace(/:$/,'').trim());continue;}
    if(/^(?:weekly schedule|workout routines|schedule|exercises|workouts|routines|training days|program details)\s*:?$/i.test(line))continue;
    const rounds=line.match(/^(?:circuit\s*[:–—-]?\s*)?(\d+)\s*rounds?\b/i);if(rounds){circuitRounds=Number(rounds[1]);continue;}
    if(/^rest\s*[:=]?\s*\d/i.test(line)){const seconds=parseRest(line);if(seconds&&current.exercises.length)current.exercises[current.exercises.length-1] .restSeconds=seconds;else notes.push(line);continue;}
    // Multiline prescriptions belong to the preceding exercise, not a new exercise.
    if(/^(?:sets?|reps?|weight|load)\s*[:=]/i.test(line)&&current.exercises.length){const previous=current.exercises.pop() ;const prescription=`${previous.name} sets: ${previous.sets} reps: ${previous.target} ${line}`;let merged                    ;
      if(/^sets?/i.test(line)){merged=parseExerciseLine(`${previous.name} ${line} reps: ${previous.target}`,circuitRounds);}else if(/^reps?/i.test(line)){merged=parseExerciseLine(`${previous.name} sets: ${previous.sets} ${line}`,circuitRounds);}else merged=parseExerciseLine(prescription,circuitRounds);
      if(merged)current.exercises.push({...merged,weight:merged.weight||previous.weight,restSeconds:previous.restSeconds});else current.exercises.push(previous);continue;
    }
    if(i===0&&!/^(?:perform|do|repeat|alternate|duration|frequency)\b/i.test(line)&&isLikelyPlanTitle(line,lines.slice(1,4))&&!/\d+\s*[x×]\s*\d+|\d+\s+sets?\b/i.test(line)){title=line;continue;}
    const hasPrescription=/\d+\s*[x×]\s*\d+|\d+\s*(?:x|×|sets?|reps?|sec|mins?|minutes?|mi|km|meters?|rounds?)\b|sets?\s*[:=]|reps?\s*[:=]|^\d+\s+\w/i.test(line);
    if(!hasPrescription&&!isKnownMovementName(line)){
      if(i===0&&!/^(?:weekly schedule|perform|do|repeat|alternate|duration|frequency)\b/i.test(line)&&isLikelyPlanTitle(line,lines.slice(1,4))){title=line;continue;}
      if(/\b(?:per week|times\/week|days\/week|duration|non.consecutive|alternate|following week|rest day|recovery|warm.up|cool.down|progress|increase|repeat|week.*program)\b/i.test(line)||/^(?:perform|do|switch|\*?\(switch)/i.test(line)){notes.push(line);if(/\b(?:increase|progress|add weight|deload)\b/i.test(line))warnings.push(`Progression needs review: “${line}”. Enter the prescriptions for each week in the builder.`);continue;}
      if(line.length<60&&!/[.!?]/.test(line)&&/:$/.test(line)){startDay(line.replace(/:$/,''));continue;}
      if(line.length<60&&!/[.!?]/.test(line)&&(current.name!=='Day 1'||/^(?:sets?|reps?)\s*[:=]/i.test(lines[i+1]||''))){const exercise=parseExerciseLine(line,circuitRounds);if(exercise){current.exercises.push(exercise);continue;}}
      warnings.push(`Could not identify an exercise or schedule instruction: “${line}”`);continue;
    }
    // Schedule prose may contain numbers but must never become an exercise.
    if(/^(?:perform|do|repeat|alternate|switch|duration|frequency|\*?\(switch)\b/i.test(line)){notes.push(line);continue;}
    const exercise=parseExerciseLine(line,circuitRounds);if(exercise)current.exercises.push(exercise);else warnings.push(`Needs review: “${line}”`);
  }
  flush();
  const resolve=(reference       )=>definitions.find(d=>normalize(d.name.replace(/^Week \d+ • /,''))===normalize(reference));
  if(schedule.length){
    if(schedule.some(entry=>entry.day))warnings.push('Cardio days need review: the source does not specify activity, duration or intensity.');
    const resolved=schedule.map(entry=>({...entry,day:entry.day||resolve(entry.reference)}));
    if(resolved.some(entry=>!entry.day))warnings.push('A scheduled workout has no matching exercise routine. Correct the schedule before saving.');
    else{
      const first=resolved.filter(entry=>entry.week===undefined||entry.week===Math.min(...resolved.map(e=>e.week||1))).map(entry=>entry.day );
      const explicitWeeks=[...new Set(resolved.map(e=>e.week).filter((v)            =>v!==undefined))].sort((a,b)=>a-b);
      let cycle=explicitWeeks.length>1?explicitWeeks.map(w=>resolved.filter(e=>e.week===w).map(e=>e.day .name)):undefined;
      const alternate=/alternate\s+between/i.test(source);
      if(!cycle&&alternate&&definitions.length===2){
        const count=frequencyPerWeek||first.length;
        if(first.length!==count)warnings.push('The training frequency differs from the pasted weekly schedule. Review the days.');
        else cycle=[first.map(d=>d.name),Array.from({length:count},(_,i)=>definitions[(definitions.indexOf(first[0] )+count+i)%2] .name)];
      }
      const referenced=new Set(cycle?.flat()||first.map(d=>d.name));
      const editable=[...first,...definitions.filter(d=>referenced.has(d.name)&&!first.some(f=>f.name===d.name))];
      return{title,days:editable,warnings,notes,frequencyPerWeek:first.length,durationWeeks,weekCycle:cycle};
    }
  }
  if(weekDays.size){
    const numbers=[...weekDays.keys()].sort((a,b)=>a-b),weeks=numbers.map(w=>weekDays.get(w) );
    if(numbers.some((w,i)=>w!==i+1))warnings.push('Some week numbers are missing. Review the weekly order before saving.');
    if(!durationWeeks)durationWeeks=numbers[numbers.length-1];
    return{title,days:definitions,weeks,warnings,notes,frequencyPerWeek:Math.max(...weeks.map(w=>w.length)),durationWeeks};
  }
  if(definitions.length===1&&frequencyPerWeek&&frequencyPerWeek<=7){return{title,days:Array.from({length:frequencyPerWeek},()=>definitions[0] ),warnings,notes,frequencyPerWeek,durationWeeks};}
  if(definitions.length===2&&/alternate\s+between/i.test(source)&&frequencyPerWeek&&frequencyPerWeek<=7){
    const first=Array.from({length:frequencyPerWeek},(_,i)=>definitions[i%2] );
    const cycle=[first.map(d=>d.name),Array.from({length:frequencyPerWeek},(_,i)=>definitions[(frequencyPerWeek+i)%2] .name)];
    return{title,days:first,weekCycle:cycle,warnings,notes,frequencyPerWeek,durationWeeks};
  }
  if(!definitions.length)warnings.push('No exercises were detected.');
  if(frequencyPerWeek&&frequencyPerWeek!==definitions.length)warnings.push('The number of routines differs from the weekly frequency. Choose how to arrange the training days.');
  return{title,days:definitions,warnings,notes,frequencyPerWeek,durationWeeks};
}

export function parsedPlanToDayTemplates(plan                  )                  {
  const now=Date.now();
  return plan.days.map((day,dayIndex)=>({
    id:`import-day-${now}-${dayIndex+1}`,code:`DAY ${dayIndex+1}`,name:day.name||`Day ${dayIndex+1}`,subtitle:'Imported from text',objective:'Imported custom workout',isDayTemplate:true,
    exercises:day.exercises.map((item,exerciseIndex)=>{
      const eid=`import-${now}-${dayIndex+1}-${exerciseIndex+1}`;
      const target=item.target;
      const setCount=item.circuitRounds&&item.mode==='reps'?Math.min(12,Math.max(1,item.circuitRounds)):Math.min(12,Math.max(1,item.sets));
      return{id:eid,name:item.name,cue:item.note||'Imported from your pasted plan. Review before training.',restSeconds:item.restSeconds,increment:0,mode:item.mode,sets:Array.from({length:setCount},(_,setIndex)=>({id:`${eid}-${setIndex+1}`,targetReps:target,weight:item.weight,completed:false,actualReps:0}))};
    })
  }));
}
