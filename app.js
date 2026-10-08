const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];

const pieces = [
  { id:'main', name:'Main Front Room', short:'Main', size:'8 × 3 × 2 in', scale:[8,2,3], pos:[0,1,0], explode:[0,-.2,0], stage:1, desc:'The widest lower room. It creates a strong base for the rooms above it.', theory:'A wide base spreads the load. Larger pieces below and smaller pieces above make a stacked structure easier to balance.' },
  { id:'left', name:'Left Front Room', short:'Left', size:'3 × 3 × 2 in', scale:[3,2,3], pos:[-5.5,1,.15], explode:[-4,0,1.2], stage:3, desc:'A smaller connected room that extends the first level.', theory:'Several simple modules can join together to create one larger building. This is modular construction.' },
  { id:'right', name:'Right Front Room', short:'Right', size:'4 × 3 × 2 in', scale:[4,2,3], pos:[6,1,.08], explode:[4,0,1.2], stage:3, desc:'This lower room widens the footprint and supports the stepped composition.', theory:'Keeping more mass on the lower level lowers the model’s center of mass and makes it harder to tip.' },
  { id:'upper', name:'Middle Upper Room', short:'Upper', size:'6 × 3 × 2 in', scale:[6,2,3], pos:[1,3.05,.15], explode:[0,3.2,.3], stage:4, desc:'The second-story room creates a terrace on the lower level.', theory:'Upper pieces should overlap the supports below instead of hanging far past their edges.' },
  { id:'top', name:'Top Room', short:'Top', size:'4 × 3 × 2 in', scale:[4,2,3], pos:[1.4,5.1,.2], explode:[0,6,.5], stage:5, desc:'The smallest room forms the highest level and makes the stepped profile easy to see.', theory:'A smaller top level keeps weight near the center, which improves balance.' }
];

const steps = [
  { title:'Make the project base', text:'Cut a 12 × 16 inch rectangle from corrugated cardboard. Draw a faint center line to make positioning easier.', why:'A flat, stiff base keeps the project from twisting while wet clay dries.', progress:0, focus:null },
  { title:'Place the main room', text:'Make an 8 × 3 × 2 inch cardboard box and glue it near the center-front of the base.', why:'This wide block becomes the main load-bearing part of the model.', progress:1, focus:'main' },
  { title:'Add both side rooms', text:'Add the 3 × 3 × 2 inch room on the left and the 4 × 3 × 2 inch room on the right.', why:'Side modules make the first floor wider and give the upper rooms more support.', progress:3, focus:'left' },
  { title:'Add the second story', text:'Center the 6 × 3 × 2 inch room over the lower structure. Keep most of it directly above the boxes underneath.', why:'A supported overlap transfers weight downward instead of creating a large unsupported overhang.', progress:4, focus:'upper' },
  { title:'Add the top room', text:'Place the 4 × 3 × 2 inch room above the second story to create the final stepped shape.', why:'Making each level smaller as it rises gives the model a stable pyramid-like massing.', progress:5, focus:'top' },
  { title:'Cover the cores with air-dry clay', text:'Press a thin layer of clay over the cardboard. Smooth the walls with slightly damp fingertips and soften the sharp corners.', why:'The cardboard carries the shape while a thin clay skin gives the model the look of earthen adobe without unnecessary weight.', progress:6, focus:null },
  { title:'Add openings, vigas, and ladder', text:'Make a doorway and small windows. Add short twig roof beams and build a small ladder from thin twigs or craft sticks.', why:'These details explain how the building is entered, how roof levels connect, and how wooden members participate in the roof structure.', progress:7, focus:null },
  { title:'Finish the desert ground', text:'Brush school glue around the base and sprinkle sand. Add a few rocks and small plants, leaving the building as the main focus.', why:'A simple site context helps the viewer understand the environment without distracting from the architecture.', progress:8, focus:null }
];

const quizzes = [
  { q:'Why are the biggest model pieces on the bottom?', a:['To make them harder to see','To create a wider, more stable base','Because clay only works near the ground'], correct:1, explain:'Correct: a wider lower level supports the upper pieces and helps the model stay balanced.' },
  { q:'Why do we use cardboard inside the air-dry clay?', a:['It makes a lightweight structural core','It makes the clay dry forever','It is historically the same as adobe'], correct:0, explain:'Correct: cardboard gives the school model its shape without making it a heavy solid block of clay.' },
  { q:'What does the ladder help explain?', a:['How roof levels could be reached','How adobe was painted','How sand was collected'], correct:0, explain:'Correct: ladders are an important visual clue showing movement between different levels.' },
  { q:'What are the little wooden pieces sticking from the wall meant to represent?', a:['Vigas / roof beams','Fence posts','Cooking sticks'], correct:0, explain:'Correct: they represent wooden roof beams, often called vigas.' },
  { q:'What is adobe mostly made from?', a:['Earth mixed with water and plant material','Melted plastic','Crushed stone and metal'], correct:0, explain:'Correct: adobe is earth (clay and sand) mixed with water and often straw or plant fiber, then dried.' },
  { q:'Why do many Pueblo buildings have flat roofs?', a:['They create usable terraces and let you build rooms above','Rain slides off faster that way','Flat roofs are the only shape clay can make'], correct:0, explain:'Correct: flat roofs become terraces and allow additional rooms to be stacked on top.' },
  { q:'Where do Pueblo peoples live today?', a:['The American Southwest, like New Mexico and Arizona','The middle of the ocean','The frozen north'], correct:0, explain:'Correct: Pueblo communities continue today across the American Southwest, especially New Mexico and Arizona.' },
  { q:'Why does each level get smaller as the building gets taller?', a:['It makes a stable pyramid-like shape','Small rooms are easier to paint','The clay runs out at the top'], correct:0, explain:'Correct: smaller upper levels keep weight near the center and lower the model’s center of mass.' }
];

let selectedPiece = 'main';
let currentStep = 0;
let quizIndex = 0;
let quizScore = 0;
let quizDone = false;
let sceneApi = null;
let autoRotate = false;

/* ============ Builder Quest rewards ============ */
const QUEST_STORAGE='pbq_rewards_v1';
const RANKS=[
  {name:'Adobe Apprentice',min:0},
  {name:'Foundation Builder',min:100},
  {name:'Pueblo Planner',min:220},
  {name:'Terrace Architect',min:380},
  {name:'Master Pueblo Builder',min:560}
];
const BADGES=[
  {id:'foundation',icon:'🧱',name:'Foundation Finder'},
  {id:'stacker',icon:'🏗️',name:'Stacking Architect'},
  {id:'clay',icon:'👐',name:'Clay Crafter'},
  {id:'scholar',icon:'🏜️',name:'Pueblo Scholar'},
  {id:'master',icon:'🏆',name:'Pueblo Builder'}
];
let rewardState={xp:0,stars:0,streak:0,badges:[],claimed:{},completedSteps:[],sound:true};

function loadRewardState(){
  try{
    const saved=JSON.parse(localStorage.getItem(QUEST_STORAGE)||'null');
    if(saved&&typeof saved==='object') rewardState={...rewardState,...saved,claimed:{...(saved.claimed||{})},badges:[...(saved.badges||[])],completedSteps:[...(saved.completedSteps||[])]};
  }catch(e){}
}
function saveRewardState(){try{localStorage.setItem(QUEST_STORAGE,JSON.stringify(rewardState))}catch(e){}}
function rankForXp(xp){let rank=RANKS[0];for(const r of RANKS)if(xp>=r.min)rank=r;return rank}
function nextRank(xp){return RANKS.find(r=>r.min>xp)||null}
function playRewardTone(kind='star'){
  if(!rewardState.sound) return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    const ac=new AC(),gain=ac.createGain(),osc=ac.createOscillator();gain.connect(ac.destination);osc.connect(gain);
    const now=ac.currentTime;osc.type=kind==='badge'?'triangle':'sine';osc.frequency.setValueAtTime(kind==='badge'?440:620,now);osc.frequency.exponentialRampToValueAtTime(kind==='badge'?880:940,now+.18);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.11,now+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+.32);
    osc.start(now);osc.stop(now+.34);setTimeout(()=>ac.close().catch(()=>{}),500);
  }catch(e){}
}
function confettiBurst(count=28){
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const layer=$('#confettiLayer');if(!layer)return;
  const glyphs=['#f2b84b','#c46f43','#6f815d','#e9d7b2','#8eb0be'];
  for(let i=0;i<count;i++){
    const bit=document.createElement('i');bit.className='confetti-bit';bit.style.left=(12+Math.random()*76)+'%';bit.style.background=glyphs[i%glyphs.length];bit.style.animationDelay=(Math.random()*.16)+'s';bit.style.transform='rotate('+(Math.random()*180)+'deg)';layer.appendChild(bit);setTimeout(()=>bit.remove(),1700);
  }
}
function showRewardToast(title,detail,badge){
  const t=$('#rewardToast');if(!t)return;
  t.hidden=false;t.classList.remove('show');void t.offsetWidth;
  t.innerHTML='<span class="reward-big">'+title+'</span><small>'+detail+'</small>'+(badge?'<span class="badge-pop">'+badge.icon+' '+badge.name+' unlocked</span>':'');
  t.classList.add('show');setTimeout(()=>{t.classList.remove('show');t.hidden=true},1900);
}
function unlockBadge(id){
  if(rewardState.badges.includes(id)) return null;
  const badge=BADGES.find(b=>b.id===id);if(!badge)return null;
  rewardState.badges.push(id);playRewardTone('badge');return badge;
}
function evaluateBadges(){
  let newest=null;
  if(rewardState.claimed['build-base']) newest=unlockBadge('foundation')||newest;
  const builtCount=Object.keys(rewardState.claimed).filter(k=>k.startsWith('build-')).length;
  if(builtCount>=4)newest=unlockBadge('stacker')||newest;
  if(rewardState.completedSteps.includes(5))newest=unlockBadge('clay')||newest;
  const quizCount=Object.keys(rewardState.claimed).filter(k=>k.startsWith('quiz-')).length;
  if(quizCount>=4)newest=unlockBadge('scholar')||newest;
  if(rewardState.completedSteps.length>=8 && builtCount>=6)newest=unlockBadge('master')||newest;
  return newest;
}
function updateRewardUI(){
  const rank=rankForXp(rewardState.xp),next=nextRank(rewardState.xp);
  $('#builderRank') && ($('#builderRank').textContent=rank.name);
  $('#starCount') && ($('#starCount').textContent=String(rewardState.stars));
  $('#streakCount') && ($('#streakCount').textContent=String(rewardState.streak));
  $('#badgeCount') && ($('#badgeCount').textContent=String(rewardState.badges.length));
  const rankStart=rank.min,rankEnd=next?next.min:Math.max(rankStart+100,rewardState.xp);
  const pct=next?Math.max(0,Math.min(100,((rewardState.xp-rankStart)/(rankEnd-rankStart))*100)):100;
  if($('#xpFill'))$('#xpFill').style.width=pct+'%';
  if($('#xpText'))$('#xpText').textContent=next?rewardState.xp+' XP • '+(next.min-rewardState.xp)+' XP to '+next.name:rewardState.xp+' XP • Top rank reached!';
  if($('#soundToggle')){$('#soundToggle').textContent=rewardState.sound?'🔊 Rewards on':'🔇 Rewards off';$('#soundToggle').setAttribute('aria-pressed',String(rewardState.sound));}
  $('.quest-dot').forEach((dot,i)=>{dot.classList.toggle('done',rewardState.completedSteps.includes(i));dot.classList.toggle('current',i===currentStep)});
  const s=steps[currentStep];if($('#questTitle'))$('#questTitle').textContent=s?.title||'Build your Pueblo';
  if($('#nextReward'))$('#nextReward').textContent=rewardState.completedSteps.includes(currentStep)?'Step reward earned ✓':'+15 XP ⭐';
  if($('#completeStep')){$('#completeStep').classList.toggle('completed',rewardState.completedSteps.includes(currentStep));$('#completeStep').textContent=rewardState.completedSteps.includes(currentStep)?'✓ STEP COMPLETE':'⭐ I BUILT THIS!';}
}
function grantReward(key,{xp=10,stars=1,streak=true,label='Great build!',detail='Keep going.'}={}){
  if(rewardState.claimed[key]){showRewardToast('Already earned ✓','That reward is safely saved.');return false;}
  rewardState.claimed[key]=Date.now();rewardState.xp+=xp;rewardState.stars+=stars;if(streak)rewardState.streak+=1;
  const badge=evaluateBadges();saveRewardState();updateRewardUI();playRewardTone(badge?'badge':'star');confettiBurst(badge?42:24);
  showRewardToast(label,'+'+xp+' XP'+(stars?' • +'+stars+' ⭐':'')+' • '+detail,badge);return true;
}
function initRewards(){
  loadRewardState();
  const dots=$('#questDots');if(dots&&!dots.children.length){steps.forEach((_,i)=>{const d=document.createElement('span');d.className='quest-dot';d.title='Build step '+(i+1);dots.appendChild(d)})}
  $('#soundToggle')?.addEventListener('click',()=>{rewardState.sound=!rewardState.sound;saveRewardState();updateRewardUI();if(rewardState.sound)playRewardTone('star')});
  $('#rewardReset')?.addEventListener('click',()=>{if(!confirm('Reset stars, XP, badges, and completed build steps?'))return;rewardState={xp:0,stars:0,streak:0,badges:[],claimed:{},completedSteps:[],sound:true};saveRewardState();updateRewardUI();showRewardToast('Quest reset','Fresh start — build it again!')});
  $('#completeStep')?.addEventListener('click',()=>{
    if(rewardState.completedSteps.includes(currentStep)){showRewardToast('Step already complete ✓','Choose the next step when you are ready.');return;}
    rewardState.completedSteps.push(currentStep);rewardState.completedSteps.sort((a,b)=>a-b);saveRewardState();
    grantReward('step-'+currentStep,{xp:15,stars:1,label:'Step '+(currentStep+1)+' complete!',detail:'Real-world building progress saved.'});
    evaluateBadges();saveRewardState();updateRewardUI();
  });
  updateRewardUI();
}

/* ---------- Read-aloud (free browser speech) ---------- */
function speak(text){
  if(!('speechSynthesis' in window)){ try{new (window.AudioContext||window.webkitAudioContext)}catch(e){return;} }
  try{ window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.rate=.92; u.pitch=1.02; u.onerror=function(){}; window.speechSynthesis.speak(u); }catch(e){}
}
function readCurrentStep(){
  const s=steps[currentStep];
  speak(`Step ${currentStep+1}. ${s.title}. ${s.text} ${s.why}`);
}
/* ---------- Celebration ---------- */
function celebrate(){
  const el=document.createElement('div'); el.className='celebrate'; el.setAttribute('aria-hidden','true');
  el.innerHTML='🎉';
  document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('boom'));
  confettiBurst(34); playRewardTone('star');
  setTimeout(()=>{ if(el.parentNode) el.parentNode.removeChild(el); }, 1600);
}

/* ============ Procedural textures (no external assets) ============ */
function hexToRgb(hex){
  const n=parseInt(hex,16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}
function shade(hex, amt){ // amt in [-1,1]
  const [r,g,b]=hexToRgb(hex);
  const adj=(c)=> Math.round(amt>=0 ? c+(255-c)*amt : c*(1+amt));
  return `rgb(${adj(r)},${adj(g)},${adj(b)})`;
}
function makeTexture(size, baseHex, opts={}){
  const c=document.createElement('canvas'); c.width=c.height=size;
  const g=c.getContext('2d');
  g.fillStyle='#'+baseHex; g.fillRect(0,0,size,size);
  const speckles=opts.speckles||1200, variance=opts.variance||0.16, strata=!!opts.strata, grain=!!opts.grain, r=opts.r||4;
  for(let i=0;i<speckles;i++){
    const x=Math.random()*size, y=Math.random()*size, rr=.5+Math.random()*r;
    g.globalAlpha=.06+Math.random()*.14;
    g.fillStyle=shade(baseHex,(Math.random()-.5)*variance*2);
    g.beginPath(); g.arc(x,y,rr,0,Math.PI*2); g.fill();
  }
  g.globalAlpha=1;
  if(strata){
    g.strokeStyle='rgba(55,32,18,.10)';
    for(let i=0;i<9;i++){ const y=Math.random()*size; g.lineWidth=1+Math.random()*2; g.beginPath(); g.moveTo(0,y); g.lineTo(size,y+(Math.random()-.5)*6); g.stroke(); }
  }
  if(grain){
    g.strokeStyle='rgba(38,22,10,.12)';
    for(let i=0;i<40;i++){ const y=Math.random()*size; g.lineWidth=.6+Math.random(); g.beginPath(); g.moveTo(0,y); g.lineTo(size,y+(Math.random()-.5)*2); g.stroke(); }
  }
  const tex=new THREE.CanvasTexture(c);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  return tex;
}

function initTabs(){
  $$('.tab').forEach(btn => btn.addEventListener('click', () => {
    $$('.tab').forEach(b => b.classList.toggle('active', b === btn));
    $$('.panel').forEach(p => p.classList.toggle('active', p.id === `panel-${btn.dataset.panel}`));
    if(btn.dataset.panel === 'builder' && sceneApi) requestAnimationFrame(sceneApi.resize);
  }));
}
function initLearnSpeak(){
  $$('#panel-learn .learn-grid article').forEach(card=>{
    const btn=document.createElement('button');btn.type='button';btn.className='read-quiz';btn.textContent='🔊 Read this fact';
    btn.addEventListener('click',()=>{const t=card.querySelector('h3')?.textContent+'... '+card.querySelector('p')?.textContent;speak(t)});
    card.appendChild(btn);
  });
}

function selectPiece(id){
  const p = pieces.find(x => x.id === id) || pieces[0];
  selectedPiece = p.id;
  $('#partName').textContent = p.name;
  $('#partSize').textContent = p.size;
  $('#partDescription').textContent = p.desc;
  $('#partTheory').textContent = p.theory;
  $$('.piece-btn').forEach(b => b.classList.toggle('selected', b.dataset.id === p.id));
  if(sceneApi) sceneApi.highlight(p.id);
}

function initPieceTray(){
  const tray = $('#pieceTray');
  pieces.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'piece-btn';
    b.dataset.id = p.id;
    b.innerHTML = `${p.short}<small>${p.size}</small>`;
    b.addEventListener('click', () => selectPiece(p.id));
    tray.appendChild(b);
  });
  selectPiece('main');
}

function initSteps(){
  const rail = $('#stepRail');
  steps.forEach((s,i) => {
    const b = document.createElement('button');
    b.type='button'; b.className='rail-step'; b.dataset.index=String(i);
    b.innerHTML = `<span class="bubble">${i+1}</span><span><strong>${s.title}</strong></span>`;
    b.addEventListener('click',()=>setStep(i));
    rail.appendChild(b);
  });
  $('#prevStep').addEventListener('click',()=>setStep(currentStep-1));
  $('#nextStep').addEventListener('click',()=>setStep(currentStep+1));
  $('#readStep').addEventListener('click',readCurrentStep);
  $('#showStep3D').addEventListener('click',()=>{
    $('[data-panel="builder"]').click();
    const s=steps[currentStep];
    $('#progress').value=String(s.progress);
    updateProgress();
    $('#explode').value='0'; updateExplode(); sceneApi?.setExplode(0);
    sceneApi?.view('front');
    if(s.focus) selectPiece(s.focus);
  });
  setStep(0);
}

function setStep(i){
  currentStep = Math.max(0,Math.min(steps.length-1,i));
  const s=steps[currentStep];
  $('#stepNumber').textContent=String(currentStep+1);
  $('#stepTitle').textContent=s.title;
  $('#stepText').textContent=s.text;
  $('#stepWhy').textContent=s.why;
  $('#prevStep').disabled=currentStep===0;
  $('#nextStep').disabled=currentStep===steps.length-1;
  $('.rail-step').forEach((b,j)=>b.classList.toggle('active',j===currentStep));
  updateRewardUI();
}

function updateExplode(){
  const value = Number($('#explode').value);
  $('#explodeOut').textContent=`${value}%`;
  sceneApi?.setExplode(value/100);
}
function updateProgress(){
  const value=Number($('#progress').value);
  $('#progressOut').textContent=value===8?'Complete':`Stage ${value}/8`;
  sceneApi?.setProgress(value);
  const stepIdx=steps.findIndex(s=>s.progress===value);
  if(stepIdx>=0)$$('.rail-step').forEach((b,j)=>b.classList.toggle('active',j===stepIdx));
  if(value===8 && Number(localStorage.getItem('pb_celebrated')||0)!==1){celebrate();try{localStorage.setItem('pb_celebrated','1')}catch(e){}}
}

function initBuilderControls(){
  $('#explode').addEventListener('input',()=>{updateExplode();try{localStorage.setItem('pb_explode',$('#explode').value)}catch(e){}});
  $('#progress').addEventListener('input',()=>{updateProgress();try{localStorage.setItem('pb_progress',$('#progress').value)}catch(e){}});
  $('#showLabels').addEventListener('change',e=>{sceneApi?.setLabels(e.target.checked);try{localStorage.setItem('pb_labels',e.target.checked?'1':'0')}catch(x){}});
  $('#showClay').addEventListener('change',e=>{sceneApi?.setClay(e.target.checked);try{localStorage.setItem('pb_clay',e.target.checked?'1':'0')}catch(x){}});
  $('#showCore').addEventListener('change',e=>{sceneApi?.setCore(e.target.checked);try{localStorage.setItem('pb_core',e.target.checked?'1':'0')}catch(x){}});
  $('#frontView').addEventListener('click',()=>sceneApi?.view('front'));
  $('#sideView').addEventListener('click',()=>sceneApi?.view('side'));
  $('#topView').addEventListener('click',()=>sceneApi?.view('top'));
  $('#autoRotate').addEventListener('click',()=>{autoRotate=!autoRotate;$('#autoRotate').classList.toggle('active',autoRotate);$('#autoRotate').textContent=autoRotate?'⏸ Auto':'🔁 Auto';});
  $('#resetModel').addEventListener('click',()=>{
    $('#explode').value='0'; $('#progress').value='8'; $('#showLabels').checked=true; $('#showClay').checked=true; $('#showCore').checked=false;
    updateExplode();updateProgress();sceneApi?.setLabels(true);sceneApi?.setClay(true);sceneApi?.setCore(false);sceneApi?.view('front');selectPiece('main');
  });
  $$('.time-btn').forEach(b=>b.addEventListener('click',()=>{
    sceneApi?.setTimeOfDay(b.dataset.time);
    try{localStorage.setItem('pb_time',b.dataset.time)}catch(e){}
  }));
  $('#tourBtn').addEventListener('click',()=>sceneApi?.toggleTour());
  try{
    if(localStorage.getItem('pb_explode'))$('#explode').value=localStorage.getItem('pb_explode');
    if(localStorage.getItem('pb_progress'))$('#progress').value=localStorage.getItem('pb_progress');
    $('#showLabels').checked=localStorage.getItem('pb_labels')!=='0';
    $('#showClay').checked=localStorage.getItem('pb_clay')!=='0';
    $('#showCore').checked=localStorage.getItem('pb_core')==='1';
  }catch(e){}
}

/* ---------- Scored Pueblo Challenge quiz ---------- */
function initQuiz(){
  $('#newQuestion').addEventListener('click',()=>{
    if(quizDone){ quizIndex=0; quizScore=0; quizDone=false; $('#newQuestion').textContent='Next question'; renderQuiz(); return; }
    const wrap=$('#quizAnswers');
    if(!wrap.dataset.answered){ $('#quizFeedback').textContent='Pick an answer first!'; return; }
    quizIndex++;
    if(quizIndex>=quizzes.length){ showQuizResult(); return; }
    renderQuiz();
  });
  renderQuiz();
}
function renderQuiz(){
  const q=quizzes[quizIndex];
  $('#quizQuestion').textContent=q.q;
  $('#quizFeedback').textContent='Choose an answer.';
  $('#quizScore').textContent=String(quizScore);
  $('#quizProgress').textContent=`Question ${quizIndex+1} of ${quizzes.length}`;
  $('#newQuestion').textContent='Next question';
  const wrap=$('#quizAnswers'); wrap.innerHTML=''; wrap.dataset.answered='';
  q.a.forEach((answer,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='answer-btn'; b.textContent=answer;
    b.addEventListener('click',()=>{
      if(wrap.dataset.answered) return;
      wrap.dataset.answered='1';
      $$('.answer-btn',wrap).forEach(x=>x.disabled=true);
      if(i===q.correct){ b.classList.add('correct'); quizScore++; $('#quizScore').textContent=String(quizScore); $('#quizFeedback').textContent=q.explain; speak(q.explain); grantReward('quiz-'+quizIndex,{xp:10,stars:1,streak:false,label:'Knowledge star!',detail:'You understood the Pueblo fact.'}); }
      else { b.classList.add('wrong'); wrap.children[q.correct].classList.add('correct'); $('#quizFeedback').textContent='Not quite. The highlighted answer is the idea to remember.'; speak('Not quite. The highlighted answer is the one to remember.'); }
    }); wrap.appendChild(b);
  });
  const readBtn=document.createElement('button'); readBtn.type='button'; readBtn.className='read-quiz'; readBtn.textContent='🔊 Read question';
  readBtn.addEventListener('click',()=>speak(`${q.q} ${q.a.join(' ')}`)); wrap.appendChild(readBtn);
}
function showQuizResult(){
  quizDone=true;
  const stars = quizScore>=8 ? '🌟🌟🌟' : quizScore>=6 ? '🌟🌟' : quizScore>=3 ? '🌟' : '🌱';
  $('#quizQuestion').textContent = `You scored ${quizScore} out of ${quizzes.length}!`;
  $('#quizFeedback').textContent = `${stars} ${quizScore>=6?'Great job!':'Nice try — play again to beat it.'}`;
  $('#quizProgress').textContent='Complete';
  $('#quizScore').textContent=String(quizScore);
  $('#quizAnswers').innerHTML='';
  $('#newQuestion').textContent='↺ Try again';
  if(quizScore>=6) celebrate();
  speak(`You scored ${quizScore} out of ${quizzes.length}. ${quizScore>=6?'Great job!':'Nice try, play again to beat it.'}`);
}

/* ============ 3D scene ============ */
async function init3D(){
  const wrap=$('#viewerWrap'), canvas=$('#scene'), loading=$('#loading'), fallback=$('#fallback');
  const THREE=window.THREE, OrbitControls=window.THREE?.OrbitControls;
  if(!THREE || !OrbitControls){ console.error('THREE/OrbitControls not loaded'); loading.remove(); canvas.hidden=true; fallback.hidden=false; return; }
  try{
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    if('outputColorSpace' in renderer && THREE.SRGBColorSpace)renderer.outputColorSpace=THREE.SRGBColorSpace;
    if(THREE.ACESFilmicToneMapping){renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;}
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(17,11,19);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(.5,2.1,0);controls.minDistance=10;controls.maxDistance=34;controls.maxPolarAngle=Math.PI*.49;

    /* --- Day / night sky state --- */
    const TIMES={
      dawn:  { sky:0xdcb585, fog:0xcfaa83, sun:[14,7,16],   sunColor:0xffc98a, sunInt:1.9,  hemi:1.25, stars:0.0,  moon:0.0 },
      day:   { sky:0x9cc7e0, fog:0xd6c6ab, sun:[-8,18,11],  sunColor:0xffffff, sunInt:2.55, hemi:2.15, stars:0.0,  moon:0.0 },
      sunset:{ sky:0xd9825a, fog:0xc69472, sun:[-22,4,-5],  sunColor:0xff8a50, sunInt:2.0,  hemi:1.2,  stars:0.15, moon:0.0 },
      night: { sky:0x0a0f1e, fog:0x0b1324, sun:[6,24,9],    sunColor:0x9db0d8, sunInt:0.45, hemi:0.45, stars:1.0,  moon:0.8 }
    };
    const curSky=new THREE.Color(TIMES.day.sky), curFog=new THREE.Color(TIMES.day.fog);
    const curSunPos=new THREE.Vector3(...TIMES.day.sun);
    let curSunInt=TIMES.day.sunInt, curHemi=TIMES.day.hemi, curStars=0, curMoon=0, targetTime=null;
    scene.background=curSky; scene.fog=new THREE.Fog(curFog,29,47);

    const hemi=new THREE.HemisphereLight(0xfffbef,0x635342,curHemi); scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xffffff,curSunInt);sun.position.copy(curSunPos);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
    const rim=new THREE.DirectionalLight(0xffd9b3,.6);rim.position.set(12,7,-12);scene.add(rim);

    /* stars */
    const starGeo=new THREE.BufferGeometry(); const starPos=[];
    for(let i=0;i<700;i++){ const r=40+Math.random()*6, th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
      starPos.push(r*Math.sin(ph)*Math.cos(th), r*Math.cos(ph), r*Math.sin(ph)*Math.sin(th)); }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos,3));
    const starMat=new THREE.PointsMaterial({color:0xffffff,size:1.8,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false});
    const stars=new THREE.Points(starGeo,starMat); scene.add(stars);
    /* moon */
    const moon=new THREE.Mesh(new THREE.SphereGeometry(1.4,20,20), new THREE.MeshBasicMaterial({color:0xe8ecf4,transparent:true,opacity:0}));
    moon.position.set(-11,20,-14); moon.visible=false; scene.add(moon);

    /* --- Procedural materials --- */
    const clayTex=makeTexture(256,'b36b43',{speckles:1500,variance:.18,strata:true,r:5});
    const sandTex=makeTexture(256,'c8ab78',{speckles:1800,variance:.12,r:3}); sandTex.repeat.set(7,8);
    const woodTex=makeTexture(128,'5c3c27',{grain:true,speckles:300,variance:.1,r:2});

    const sandMat=new THREE.MeshStandardMaterial({map:sandTex,roughness:1});
    const clayMat=new THREE.MeshStandardMaterial({map:clayTex,bumpMap:clayTex,bumpScale:.075,roughness:1,metalness:0});
    const claySelected=new THREE.MeshStandardMaterial({map:clayTex,bumpMap:clayTex,bumpScale:.09,roughness:.96,metalness:0,emissive:0x2f180d,emissiveIntensity:.18});
    const coreMat=new THREE.MeshStandardMaterial({color:0xb18457,roughness:.95,transparent:true,opacity:.8});
    const woodMat=new THREE.MeshStandardMaterial({map:woodTex,roughness:1});
    const darkMat=new THREE.MeshStandardMaterial({color:0x1d1713,roughness:1});
    const stoneMats=[0x766f65,0x9a8268,0xc0a37f].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
    const greenMat=new THREE.MeshStandardMaterial({color:0x536146,roughness:1});

    const ground=new THREE.Mesh(new THREE.BoxGeometry(13.5,.38,16.5),sandMat);ground.position.set(0,-.23,.8);ground.receiveShadow=true;scene.add(ground);
    const model=new THREE.Group();model.rotation.y=-.10;scene.add(model);
    const clayMeshes=new Map(), coreMeshes=new Map(), labels=new Map();

    function roundedBoxGeometry(w,h,d){
      const g=new THREE.BoxGeometry(w,h,d,8,4,8);
      const pos=g.attributes.position;
      for(let i=0;i<pos.count;i++){
        let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        const nx=Math.abs(x)/(w/2), nz=Math.abs(z)/(d/2);
        const corner=Math.max(0,Math.min(nx,nz)-.72)/.28;
        const taper=1-.018*((y+h/2)/h);
        const wave=Math.sin((x*2.37)+(y*3.11)+(z*1.73))*0.018;
        x*=taper*(1-corner*.045); z*=taper*(1-corner*.045);
        if(nx>.98)x+=Math.sign(x)*wave;
        if(nz>.98)z+=Math.sign(z)*wave;
        if(Math.abs(y)>.98*(h/2))y+=wave*.35;
        pos.setXYZ(i,x,y,z);
      }
      g.computeVertexNormals();return g;
    }

    pieces.forEach(p=>{
      const clay=new THREE.Mesh(roundedBoxGeometry(...p.scale),clayMat);clay.position.set(...p.pos);clay.userData={id:p.id,base:new THREE.Vector3(...p.pos),kind:'clay'};clay.castShadow=true;clay.receiveShadow=true;model.add(clay);clayMeshes.set(p.id,clay);
      const coreScale=p.scale.map(v=>Math.max(.2,v-.25));
      const core=new THREE.Mesh(new THREE.BoxGeometry(...coreScale),coreMat);core.position.set(...p.pos);core.userData={id:p.id,base:new THREE.Vector3(...p.pos),kind:'core'};core.visible=false;model.add(core);coreMeshes.set(p.id,core);
      const label=document.createElement('div');label.className='label-tag';label.textContent=p.short;wrap.appendChild(label);labels.set(p.id,label);
    });

    const detailObjects=[];
    function beam(x,y,z,len=.78){const m=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,len,10),woodMat);m.rotation.z=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;model.add(m);detailObjects.push(m);return m;}
    [-2.8,-1.3,.2,1.7,3.2].forEach(x=>beam(x,2.03,-1.66));
    [-.4,.9,2.2,3.5].forEach(x=>beam(x,4.06,-1.53));
    [.2,1.4,2.6].forEach(x=>beam(x,6.1,-1.43));
    const doorsWindows=[];
    function opening(x,y,z,w,h){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.09),darkMat);m.position.set(x,y,z);model.add(m);doorsWindows.push(m);return m;}
    opening(.1,.72,-1.545,1.25,1.45);opening(-2.5,1.15,-1.545,.68,.68);opening(2.55,1.15,-1.545,.68,.68);opening(.15,3.22,-1.43,.68,.68);opening(2.15,5.22,-1.34,.68,.68);
    const doorLintel=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,1.65,10),woodMat);doorLintel.rotation.z=Math.PI/2;doorLintel.position.set(.1,1.5,-1.66);doorLintel.castShadow=true;model.add(doorLintel);detailObjects.push(doorLintel);
    [[-2.5,1.52,-1.64],[2.55,1.52,-1.64],[.15,3.59,-1.53],[2.15,5.59,-1.44]].forEach(([x,y,z])=>{const sill=new THREE.Mesh(new THREE.BoxGeometry(.82,.08,.18),clayMat);sill.position.set(x,y,z);sill.castShadow=true;model.add(sill);detailObjects.push(sill);});

    /* roof parapets (low adobe walls around each flat roof) */
    function addParapets(){
      pieces.forEach(p=>{
        const [w,h,d]=p.scale, [px,py,pz]=p.pos, top=py+h/2, ph=0.16, t=0.09;
        const wall=(len,x,z,rotY)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(len,ph,t),clayMat); m.position.set(x,top+ph/2,z); m.rotation.y=rotY; m.castShadow=true; model.add(m); detailObjects.push(m); };
        wall(w, px, pz+d/2-t/2, 0);
        wall(w, px, pz-d/2+t/2, 0);
        wall(d, px+w/2-t/2, pz, Math.PI/2);
        wall(d, px-w/2+t/2, pz, Math.PI/2);
      });
    }
    addParapets();

    /* horno — beehive bread oven */
    function addHorno(){
      const g=new THREE.Group();
      const dome=new THREE.Mesh(new THREE.SphereGeometry(.85,20,14,0,Math.PI*2,0,Math.PI/2),clayMat); dome.scale.set(1,.82,1); dome.castShadow=true; g.add(dome);
      const chim=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.5,10),clayMat); chim.position.set(.15,.55,0); chim.castShadow=true; g.add(chim);
      const door=new THREE.Mesh(new THREE.BoxGeometry(.34,.4,.12),darkMat); door.position.set(0,.22,.72); g.add(door);
      g.position.set(7.4,.18,4.7); model.add(g); detailObjects.push(g);
    }
    addHorno();

    /* kiva — round ceremonial room with entry ladder */
    function addKiva(){
      const g=new THREE.Group();
      const cyl=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.45,.55,24),clayMat); cyl.castShadow=true; cyl.receiveShadow=true; g.add(cyl);
      const l=new THREE.Group();
      [-.42,.42].forEach(x=>{ const rail=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,1.3,8),woodMat); rail.position.set(x,.8,0); l.add(rail); });
      for(let i=0;i<3;i++){ const rg=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.9,6),woodMat); rg.rotation.z=Math.PI/2; rg.position.set(0,.35+i*.35,0); l.add(rg); }
      l.position.set(0,.3,0); l.rotation.z=-.12; g.add(l);
      g.position.set(-6.9,.27,4.9); model.add(g); detailObjects.push(g);
    }
    addKiva();

    const ladder=new THREE.Group();
    [-.48,.48].forEach(x=>{const rail=new THREE.Mesh(new THREE.CylinderGeometry(.085,.1,4.05,10),woodMat);rail.position.set(x,2.15,0);ladder.add(rail);});
    for(let i=0;i<5;i++){const rung=new THREE.Mesh(new THREE.CylinderGeometry(.065,.075,1.08,10),woodMat);rung.rotation.z=Math.PI/2;rung.position.set(0,.58+i*.78,0);ladder.add(rung);}ladder.position.set(4.25,0,-2.05);ladder.rotation.x=-.11;ladder.rotation.z=-.06;model.add(ladder);detailObjects.push(ladder);

    for(let i=0;i<22;i++){
      const r=.12+(i%4)*.045;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),stoneMats[i%stoneMats.length]);const angle=i*.91;const radius=5.3+(i%3)*.55;rock.position.set(Math.cos(angle)*radius,.05,1+Math.sin(angle)*6.1);rock.scale.y=.65;rock.castShadow=true;scene.add(rock);
    }
    for(let i=0;i<8;i++){
      const plant=new THREE.Group();const x=(i%2?1:-1)*(4.6+(i%3)*.65),z=-4.6+(i%4)*3;
      for(let j=0;j<6;j++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.11,.65,6),greenMat);leaf.position.set((j-2.5)*.10,.34,Math.sin(j)*.09);leaf.rotation.z=(j-2.5)*.18;plant.add(leaf);}plant.position.set(x,0,z);scene.add(plant);
    }

    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
    renderer.domElement.addEventListener('pointerup',e=>{
      if(Math.abs(e.movementX||0)+Math.abs(e.movementY||0)>5)return;
      const r=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);
      const hits=raycaster.intersectObjects([...clayMeshes.values(),...coreMeshes.values()],false);if(hits[0])selectPiece(hits[0].object.userData.id);
    });

    let explodeAmount=0,progressStage=8,showLabels=true,showClay=true,showCore=false;
    function setExplode(v){explodeAmount=Math.max(0,Math.min(1,v));pieces.forEach(p=>{for(const map of [clayMeshes,coreMeshes]){const m=map.get(p.id),b=m.userData.base;m.position.set(b.x+p.explode[0]*explodeAmount,b.y+p.explode[1]*explodeAmount,b.z+p.explode[2]*explodeAmount);}});}
    function setProgress(stage){progressStage=Math.max(0,Math.min(8,stage));pieces.forEach(p=>{clayMeshes.get(p.id).visible=showClay&&progressStage>=p.stage;coreMeshes.get(p.id).visible=showCore&&progressStage>=p.stage;});const details=progressStage>=7;detailObjects.forEach(o=>o.visible=details);doorsWindows.forEach(o=>o.visible=details);}
    function setClay(v){showClay=v;setProgress(progressStage)}function setCore(v){showCore=v;setProgress(progressStage)}function setLabels(v){showLabels=v;labels.forEach(l=>l.style.display=v?'block':'none')}
    function highlight(id){clayMeshes.forEach((m,k)=>m.material=k===id?claySelected:clayMat)}
    function view(kind){if(kind==='front')camera.position.set(17,11,19);if(kind==='side')camera.position.set(-21,9,8);if(kind==='top')camera.position.set(7,25,8);controls.target.set(.5,2.1,0);controls.update()}
    function resize(){const w=Math.max(280,wrap.clientWidth),h=Math.max(330,wrap.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
    const ro=new ResizeObserver(resize);ro.observe(wrap);resize();

    function setTimeOfDay(name){
      if(!TIMES[name]) return;
      targetTime=TIMES[name];
      $$('.time-btn').forEach(b=>b.classList.toggle('active',b.dataset.time===name));
    }

    /* --- Guided tour --- */
    const TOUR=[
      {cam:[17,11,19],tgt:[.5,2.1,0],cap:'Welcome to Pueblo Builder Lab! Drag to rotate, and scroll or pinch to zoom.'},
      {cam:[20,6,17],tgt:[.5,1.4,0],cap:'Here is the wide main room — a strong base for everything stacked above it.'},
      {cam:[-21,9,8],tgt:[.5,2.1,0],cap:'From the side you can see the stepped, pyramid-like shape of the pueblo.'},
      {cam:[7,24,9],tgt:[.5,2.1,0],cap:'From above, the flat roof terraces are easy to spot.'},
      {cam:[16,10,-18],tgt:[.5,2.2,0],cap:'The vigas and ladder show how people reached each roof level.'}
    ];
    let tourIndex=-1, tourTimer=null, tourTargetCam=null, tourTargetTgt=null;
    function showCaption(txt){ const c=$('#tourCaption'); if(c){ c.textContent=txt; c.hidden=false; } }
    function hideCaption(){ const c=$('#tourCaption'); if(c) c.hidden=true; }
    function setTourTarget(i){ tourTargetCam=new THREE.Vector3(...TOUR[i].cam); tourTargetTgt=new THREE.Vector3(...TOUR[i].tgt); }
    function startTour(){
      if(tourIndex>=0) return;
      autoRotate=false; $('#autoRotate').classList.remove('active'); $('#autoRotate').textContent='🔁 Auto';
      tourIndex=0; setTourTarget(0); showCaption(TOUR[0].cap); speak(TOUR[0].cap);
      $('#tourBtn').textContent='⏹ Stop tour';
      tourTimer=setInterval(()=>{
        tourIndex++;
        if(tourIndex>=TOUR.length){ stopTour(); return; }
        setTourTarget(tourIndex); showCaption(TOUR[tourIndex].cap); speak(TOUR[tourIndex].cap);
      },5200);
    }
    function stopTour(){ clearInterval(tourTimer); tourTimer=null; tourIndex=-1; tourTargetCam=null; tourTargetTgt=null; hideCaption(); $('#tourBtn').textContent='🎬 Take a tour'; }
    function toggleTour(){ if(tourIndex>=0) stopTour(); else startTour(); }

    function updateLabels(){if(!showLabels)return;pieces.forEach(p=>{const m=clayMeshes.get(p.id),v=m.position.clone();v.y+=p.scale[1]*.65;model.localToWorld(v);v.project(camera);const x=(v.x*.5+.5)*wrap.clientWidth,y=(-v.y*.5+.5)*wrap.clientHeight;const l=labels.get(p.id);l.style.left=`${x}px`;l.style.top=`${y}px`;l.style.opacity=(v.z>-1&&v.z<1&&m.visible)?'1':'0';});}
    function updateSky(){
      if(!targetTime) return;
      const k=.06;
      curSky.lerp(new THREE.Color(targetTime.sky),k); curFog.lerp(new THREE.Color(targetTime.fog),k); scene.fog.color.copy(curFog);
      curSunPos.lerp(new THREE.Vector3(...targetTime.sun),k);
      curSunInt+=(targetTime.sunInt-curSunInt)*k; curHemi+=(targetTime.hemi-curHemi)*k;
      curStars+=(targetTime.stars-curStars)*k; curMoon+=(targetTime.moon-curMoon)*k;
      sun.position.copy(curSunPos); sun.intensity=curSunInt; sun.color.set(targetTime.sunColor);
      hemi.intensity=curHemi; starMat.opacity=curStars; moon.material.opacity=curMoon; moon.visible=curMoon>.05;
    }
    let raf;function loop(){
      controls.update();
      if(tourTargetCam){ camera.position.lerp(tourTargetCam,.045); controls.target.lerp(tourTargetTgt,.045); }
      else if(autoRotate) model.rotation.y+=.004;
      updateSky(); updateLabels();
      renderer.render(scene,camera);
      raf=requestAnimationFrame(loop);
    }loop();
    sceneApi={setExplode,setProgress,setClay,setCore,setLabels,highlight,view,resize,setTimeOfDay,toggleTour,startTour,stopTour};
    loading.remove();updateExplode();updateProgress();highlight(selectedPiece);setLabels(true);

    /* restore saved time-of-day */
    let savedTime='day'; try{ savedTime=localStorage.getItem('pb_time')||'day'; }catch(e){}
    if(savedTime!=='day') setTimeOfDay(savedTime);
  }catch(err){console.error(err);loading.remove();canvas.hidden=true;fallback.hidden=false;}
}

/* ===== Build Mode (Fortnite-style) ===== */
const BUILD_ORDER=['base','main','left','right','upper','top'];
const BUILD_COST={base:{cardboard:1},main:{cardboard:1,clay:1},left:{cardboard:1,clay:1},right:{cardboard:1,clay:1},upper:{cardboard:1,clay:1},top:{cardboard:1,clay:1}};
const BUILD_START={cardboard:6,clay:5,twigs:3,sand:2};
const BUILD_POS={base:[0,-.23,.8],main:[0,1,0],left:[-5.5,1,.15],right:[6,1,.08],upper:[1,3.05,.15],top:[1.4,5.1,.2]};
const BUILD_SCALE={base:[13.5,.38,16.5],main:[8,2,3],left:[3,2,3],right:[4,2,3],upper:[6,2,3],top:[4,2,3]};

function initBuildMode(){
  const wrap=$('#buildViewerWrap'), canvas=$('#buildScene'), loading=$('#buildLoading');
  const THREE=window.THREE, OrbitControls=window.THREE?.OrbitControls;
  if(!THREE || !OrbitControls){ loading.textContent='3D not available'; return; }
  const materials={...BUILD_START};
  let savedPlaced=[];try{savedPlaced=JSON.parse(localStorage.getItem('pbq_buildPlaced')||'[]')}catch(e){}
  const validPrefix=[];for(const p of BUILD_ORDER){if(savedPlaced.includes(p))validPrefix.push(p);else break;}
  const placed=new Set(validPrefix);
  validPrefix.forEach(p=>{const cost=BUILD_COST[p];for(const k in cost)materials[k]=Math.max(0,materials[k]-cost[k]);});
  let selected=null;
  let sceneApi=null;

  function renderHud(){
    $('#matCardboard').textContent=materials.cardboard;
    $('#matClay').textContent=materials.clay;
    $('#matTwigs').textContent=materials.twigs;
    $('#matSand').textContent=materials.sand;
    $('#buildProgress').textContent=`Placed ${placed.size} / ${BUILD_ORDER.length}`;
    const next=BUILD_ORDER[placed.size];
    const missionCopy={
      base:['Place the foundation board','Start low and wide. A strong base keeps every level above it stable.'],
      main:['Build the main room','The widest lower room becomes the structural anchor.'],
      left:['Add the left room','Connected rooms widen the first level and create support.'],
      right:['Add the right room','Balance both sides before building upward.'],
      upper:['Stack the second story','Keep most of the upper room directly over its supports.'],
      top:['Crown the Pueblo','The smallest room goes highest to keep the form balanced.']
    };
    if($('#buildMissionTitle'))$('#buildMissionTitle').textContent=next?missionCopy[next][0]:'Pueblo complete!';
    if($('#buildMissionHint'))$('#buildMissionHint').textContent=next?missionCopy[next][1]:'Excellent work — inspect your finished structure from every angle.';
    $('.build-slot').forEach(s=>{
      const p=s.dataset.piece;
      s.classList.toggle('placed',placed.has(p));
      s.classList.toggle('selected',selected===p);
      s.disabled = placed.has(p) || (p!==next);
    });
    $('#buildPlace').disabled = !selected || placed.has(selected) || selected!==BUILD_ORDER[placed.size];
  }

  function showMsg(txt){
    const old=$('.build-msg'); if(old) old.remove();
    const el=document.createElement('div'); el.className='build-msg'; el.textContent=txt;
    wrap.appendChild(el); setTimeout(()=>el.remove(),1400);
  }

  function placeSelected(){
    if(!selected || placed.has(selected) || selected!==BUILD_ORDER[placed.size]) return;
    const cost=BUILD_COST[selected];
    for(const k in cost){ if(materials[k]<cost[k]){ showMsg('Not enough materials!'); return; } }
    for(const k in cost) materials[k]-=cost[k];
    const justPlaced=selected;
    placed.add(justPlaced);
    try{localStorage.setItem('pbq_buildPlaced',JSON.stringify([...placed]))}catch(e){}
    sceneApi?.setPlaced(justPlaced,true);
    renderHud();
    showMsg(justPlaced==='base'?'Foundation locked in!':`${justPlaced} snapped into place!`);
    grantReward('build-'+justPlaced,{xp:25,stars:1,label:justPlaced==='base'?'Foundation star!':'Perfect placement!',detail:'Your Pueblo is getting stronger.'});
    if(placed.size===BUILD_ORDER.length){ setTimeout(()=>{celebrate();showMsg('🏆 Pueblo complete!');const badge=unlockBadge('master');saveRewardState();updateRewardUI();if(badge)showRewardToast('Master build complete!','Every structural piece is in place.',badge);},450); }
    selected=null; renderHud();
  }

  try{
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    if('outputColorSpace' in renderer && THREE.SRGBColorSpace)renderer.outputColorSpace=THREE.SRGBColorSpace;
    if(THREE.ACESFilmicToneMapping){renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;}
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0x1c130b); scene.fog=new THREE.Fog(0x1c130b,30,50);
    const camera=new THREE.PerspectiveCamera(38,1,.1,100); camera.position.set(17,11,19);
    const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.target.set(.5,2.1,0); controls.minDistance=10; controls.maxDistance=34; controls.maxPolarAngle=Math.PI*.49;
    scene.add(new THREE.HemisphereLight(0xfffbef,0x635342,2.0));
    const sun=new THREE.DirectionalLight(0xffffff,2.4); sun.position.set(-8,18,11); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
    const rim=new THREE.DirectionalLight(0xffd9b3,.6); rim.position.set(12,7,-12); scene.add(rim);

    const clayTex=makeTexture(256,'b36b43',{speckles:1500,variance:.18,strata:true,r:5});
    const sandTex=makeTexture(256,'c8ab78',{speckles:1800,variance:.12,r:3}); sandTex.repeat.set(7,8);
    const clayMat=new THREE.MeshStandardMaterial({map:clayTex,bumpMap:clayTex,bumpScale:.07,roughness:1});
    const ghostMat=new THREE.MeshStandardMaterial({color:0xffd27a,roughness:.6,transparent:true,opacity:.35,emissive:0xffd27a,emissiveIntensity:.15});
    const sandMat=new THREE.MeshStandardMaterial({map:sandTex,roughness:1});
    const meshes={};

    function makeMesh(p){
      const isBase=p==='base';
      const mat=isBase?sandMat:clayMat;
      const m=new THREE.Mesh(new THREE.BoxGeometry(...BUILD_SCALE[p]),mat);
      m.position.set(...BUILD_POS[p]); m.castShadow=true; m.receiveShadow=true;
      m.visible=false; scene.add(m); meshes[p]=m;
      return m;
    }
    BUILD_ORDER.forEach(makeMesh);

    function setPlaced(p,on){
      const m=meshes[p]; if(!m) return;
      m.visible=on;
      if(on){ m.material= p==='base'?sandMat:clayMat; }
    }
    function setGhost(p){
      BUILD_ORDER.forEach(k=>{ const m=meshes[k]; if(m && !placed.has(k)){ m.visible=(k===p); if(k===p) m.material=ghostMat; } });
    }
    function clearGhost(){ BUILD_ORDER.forEach(k=>{ const m=meshes[k]; if(m && !placed.has(k)) m.visible=false; }); }

    function resize(){ const w=Math.max(280,wrap.clientWidth),h=Math.max(330,wrap.clientHeight); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
    const ro=new ResizeObserver(resize); ro.observe(wrap); resize();
    let raf; function loop(){ controls.update(); renderer.render(scene,camera); raf=requestAnimationFrame(loop); } loop();
    sceneApi={setPlaced,setGhost,clearGhost,resize};
    validPrefix.forEach(p=>setPlaced(p,true));
    loading.remove();

    $('.build-slot').forEach(s=>{
      s.addEventListener('click',()=>{
        const p=s.dataset.piece;
        if(placed.has(p) || p!==BUILD_ORDER[placed.size]) return;
        selected = (selected===p)?null:p;
        if(selected) sceneApi.setGhost(selected); else sceneApi.clearGhost();
        renderHud();
      });
    });
    $('#buildPlace').addEventListener('click',placeSelected);
    renderHud();
  }catch(err){ console.error(err); loading.textContent='3D could not start'; }
}

initRewards();initTabs();initPieceTray();initSteps();initBuilderControls();initQuiz();initLearnSpeak();init3D();initBuildMode();
