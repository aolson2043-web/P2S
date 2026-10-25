(function(root){
'use strict';
const terrain={paved:['Paved / Firm',1],dirt:['Dirt Road',1.1],light:['Light Brush',1.2],heavy:['Heavy Brush',1.5],sand:['Loose Sand',2.1],treadmill:['Treadmill',1]};
function calculate(x){
 const bodyKg=Number(x.body)*(x.units==='metric'?1:.45359237),loadKg=Number(x.load)*(x.units==='metric'?1:.45359237),miles=Number(x.distance)/(x.units==='metric'?1.609344:1),minutes=Number(x.minutes),t=terrain[x.terrain];
 if(![bodyKg,loadKg,miles,minutes].every(Number.isFinite)||bodyKg<25||bodyKg>350||loadKg<0||loadKg>150||miles<=0||miles>100||minutes<=0||minutes>2880||!t)throw Error('Enter valid body weight, pack weight, distance, time, and terrain. Body weight must be 25–350 kg (55–772 lb).');
 const speed=miles*1609.344/(minutes*60);
 if(speed>2.5)throw Error('That pace is faster than this walking calculator supports. Check the distance and total time.');
 const watts=1.5*bodyKg+2*(bodyKg+loadKg)*(loadKg/bodyKg)**2+t[1]*(bodyKg+loadKg)*1.5*speed**2;
 return {bodyKg,loadKg,miles,minutes,terrain:t[0],calories:Math.round(watts*minutes*60/4184),paceSeconds:minutes*60/(Number(x.distance)),unit:x.units==='metric'?'km':'mi',load:Number(x.load),loadUnit:x.units==='metric'?'kg':'lb',distance:Number(x.distance),speed,warning:loadKg/bodyKg>.3?'This is a substantial load relative to body weight. The calculation is an estimate, not a recommendation to carry this weight.':''};
}
const api={calculate,terrain};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.P2SRuck=api;
})(typeof window!=='undefined'?window:globalThis);
