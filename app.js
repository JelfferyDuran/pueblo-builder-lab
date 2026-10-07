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
  { q:'What are the little wooden pieces sticking from the wall meant to represent?', a:['Vigas / roof beams','Fence posts','Cooking sticks'], correct:0, explain:'Correct: they represent wooden roof beams, often called vigas.' }
];

let selectedPiece = 'main';
let currentStep = 0;
let quizIndex = 0;
let sceneApi = null;
let autoRotate = false;

/* ---------- Read-aloud (free browser speech) ---------- */
function speak(text){
  if(!('speechSynthesis' in window)){ try{new (window.AudioContext||window.webkitAudioContext)}catch(e){return;} }
  try{ window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.rate=.92; u.pitch=1.02; window.speechSynthesis.speak(u); }catch(e){}
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
  setTimeout(()=>{ if(el.parentNode) el.parentNode.removeChild(el); }, 1600);
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
  $$('.rail-step').forEach((b,j)=>b.classList.toggle('active',j===currentStep));
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
  try{
    if(localStorage.getItem('pb_explode'))$('#explode').value=localStorage.getItem('pb_explode');
    if(localStorage.getItem('pb_progress'))$('#progress').value=localStorage.getItem('pb_progress');
    $('#showLabels').checked=localStorage.getItem('pb_labels')!=='0';
    $('#showClay').checked=localStorage.getItem('pb_clay')!=='0';
    $('#showCore').checked=localStorage.getItem('pb_core')==='1';
  }catch(e){}
}

function initQuiz(){
  $('#newQuestion').addEventListener('click',()=>{quizIndex=(quizIndex+1)%quizzes.length;renderQuiz();});
  renderQuiz();
}
function renderQuiz(){
  const q=quizzes[quizIndex]; $('#quizQuestion').textContent=q.q; $('#quizFeedback').textContent='Choose an answer.';
  const wrap=$('#quizAnswers'); wrap.innerHTML='';
  q.a.forEach((answer,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='answer-btn'; b.textContent=answer;
    b.addEventListener('click',()=>{
      $$('.answer-btn',wrap).forEach(x=>x.disabled=true);
      if(i===q.correct){b.classList.add('correct');$('#quizFeedback').textContent=q.explain;speak(q.explain);}
      else{b.classList.add('wrong');wrap.children[q.correct].classList.add('correct');$('#quizFeedback').textContent='Not quite. The highlighted answer is the building idea to remember.';speak('Not quite. The highlighted answer is the one to remember.');}
    }); wrap.appendChild(b);
  });
  const readBtn=document.createElement('button'); readBtn.type='button'; readBtn.className='read-quiz'; readBtn.textContent='🔊 Read question';
  readBtn.addEventListener('click',()=>speak(`${q.q} ${q.a.join(' ')}`)); wrap.appendChild(readBtn);
}

async function init3D(){
  const wrap=$('#viewerWrap'), canvas=$('#scene'), loading=$('#loading'), fallback=$('#fallback');
  const THREE=window.THREE, OrbitControls=window.THREE?.OrbitControls;
  if(!THREE || !OrbitControls){ console.error('THREE/OrbitControls not loaded'); loading.remove(); canvas.hidden=true; fallback.hidden=false; return; }
  try{
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const scene=new THREE.Scene(); scene.fog=new THREE.Fog(0xded8c8,29,47);
    const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(17,11,19);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(.5,2.1,0);controls.minDistance=10;controls.maxDistance=34;controls.maxPolarAngle=Math.PI*.49;
    scene.add(new THREE.HemisphereLight(0xfffbef,0x635342,2.15));
    const sun=new THREE.DirectionalLight(0xffffff,2.55);sun.position.set(-8,18,11);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
    const rim=new THREE.DirectionalLight(0xffd9b3,.6);rim.position.set(12,7,-12);scene.add(rim);

    const sandMat=new THREE.MeshStandardMaterial({color:0xc8ab78,roughness:1});
    const clayMat=new THREE.MeshStandardMaterial({color:0xb36b43,roughness:.98});
    const claySelected=new THREE.MeshStandardMaterial({color:0xd08a60,roughness:.92,emissive:0x2f180d,emissiveIntensity:.2});
    const coreMat=new THREE.MeshStandardMaterial({color:0xb18457,roughness:.95,transparent:true,opacity:.8});
    const woodMat=new THREE.MeshStandardMaterial({color:0x5c3c27,roughness:1});
    const darkMat=new THREE.MeshStandardMaterial({color:0x1d1713,roughness:1});
    const stoneMats=[0x766f65,0x9a8268,0xc0a37f].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
    const greenMat=new THREE.MeshStandardMaterial({color:0x536146,roughness:1});

    const ground=new THREE.Mesh(new THREE.BoxGeometry(13.5,.38,16.5),sandMat);ground.position.set(0,-.23,.8);ground.receiveShadow=true;scene.add(ground);
    const model=new THREE.Group();model.rotation.y=-.10;scene.add(model);
    const clayMeshes=new Map(), coreMeshes=new Map(), labels=new Map();

    function roundedBoxGeometry(w,h,d){
      const g=new THREE.BoxGeometry(w,h,d,2,2,2);
      const pos=g.attributes.position;
      for(let i=0;i<pos.count;i++){
        const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        pos.setXYZ(i,x*(1-.012*Math.abs(y)),y,z*(1-.012*Math.abs(y)));
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
    function updateLabels(){if(!showLabels)return;pieces.forEach(p=>{const m=clayMeshes.get(p.id),v=m.position.clone();v.y+=p.scale[1]*.65;model.localToWorld(v);v.project(camera);const x=(v.x*.5+.5)*wrap.clientWidth,y=(-v.y*.5+.5)*wrap.clientHeight;const l=labels.get(p.id);l.style.left=`${x}px`;l.style.top=`${y}px`;l.style.opacity=(v.z>-1&&v.z<1&&m.visible)?'1':'0';});}
    let raf;function loop(){controls.update();if(autoRotate)model.rotation.y+=.004;updateLabels();renderer.render(scene,camera);raf=requestAnimationFrame(loop)}loop();
    sceneApi={setExplode,setProgress,setClay,setCore,setLabels,highlight,view,resize};
    loading.remove();updateExplode();updateProgress();highlight(selectedPiece);setLabels(true);
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
    const placed=new Set();
    let selected=null;
    let sceneApi=null;

    function renderHud(){
      $('#matCardboard').textContent=materials.cardboard;
      $('#matClay').textContent=materials.clay;
      $('#matTwigs').textContent=materials.twigs;
      $('#matSand').textContent=materials.sand;
      $('#buildProgress').textContent=`Placed ${placed.size} / ${BUILD_ORDER.length}`;
      $$('.build-slot').forEach(s=>{
        const p=s.dataset.piece;
        s.classList.toggle('placed',placed.has(p));
        s.classList.toggle('selected',selected===p);
        const next=BUILD_ORDER[placed.size];
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
      placed.add(selected);
      sceneApi?.setPlaced(selected,true);
      renderHud();
      showMsg(selected==='base'?'Base down!':`${selected} placed!`);
      if(placed.size===BUILD_ORDER.length){ setTimeout(()=>{celebrate();showMsg('🏆 Pueblo complete!');},400); }
      selected=null; renderHud();
    }

    try{
      const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      const scene=new THREE.Scene(); scene.background=new THREE.Color(0x1c130b); scene.fog=new THREE.Fog(0x1c130b,30,50);
      const camera=new THREE.PerspectiveCamera(38,1,.1,100); camera.position.set(17,11,19);
      const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.target.set(.5,2.1,0); controls.minDistance=10; controls.maxDistance=34; controls.maxPolarAngle=Math.PI*.49;
      scene.add(new THREE.HemisphereLight(0xfffbef,0x635342,2.0));
      const sun=new THREE.DirectionalLight(0xffffff,2.4); sun.position.set(-8,18,11); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
      const rim=new THREE.DirectionalLight(0xffd9b3,.6); rim.position.set(12,7,-12); scene.add(rim);

      const clayMat=new THREE.MeshStandardMaterial({color:0xb36b43,roughness:.98});
      const ghostMat=new THREE.MeshStandardMaterial({color:0xffd27a,roughness:.6,transparent:true,opacity:.35,emissive:0xffd27a,emissiveIntensity:.15});
      const sandMat=new THREE.MeshStandardMaterial({color:0xc8ab78,roughness:1});
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
      loading.remove();

      $$('.build-slot').forEach(s=>{
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

  initTabs();initPieceTray();initSteps();initBuilderControls();initQuiz();initLearnSpeak();init3D();initBuildMode();
