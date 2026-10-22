const mobileLayout = matchMedia('(max-width:760px)');
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
const motionToggle = document.querySelector('.motion-toggle');
let motionPaused = reducedMotion.matches;
let lastFrame = 0, frameId = 0;
function syncMotionMode(){
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  motionToggle.setAttribute('aria-pressed', String(motionPaused));
  motionToggle.setAttribute('aria-label', motionPaused ? 'Activer les animations' : 'Réduire les animations');
  motionToggle.textContent = motionPaused ? 'ANIMATIONS · OFF' : 'ANIMATIONS · ON';
}
syncMotionMode();
const canvas = document.querySelector('#signal');
const ctx = canvas.getContext('2d');
const motionCanvas = document.querySelector('#motion-field');
const motionCtx = motionCanvas.getContext('2d');
const cursor = document.querySelector('.cursor');
const glitch = document.querySelector('.glitch');
const vaporLayer = document.querySelector('.vapor-layer');
const retroMac = document.querySelector('.retro-mac');
const retroMessage = document.querySelector('.mac-message');
let w, h, mouse = { x: innerWidth / 2, y: innerHeight / 2 }, t = 0;
let scrollVelocity = 0, lastScrollY = scrollY, gooseX = innerWidth * .06, gooseY = innerHeight * .74;
let previousGooseX = gooseX, previousGooseY = gooseY, lastTrailTick = 0;
let goosePose = {x:5,y:74,s:.58,r:-8};
const gooseTrail = [];
const motionMotes = Array.from({length:mobileLayout.matches ? 42 : 110},(_,i)=>({
  x:(Math.sin(i*73.17)*.5+.5), y:(Math.sin(i*41.63+1.7)*.5+.5),
  z:.12+(i%13)/13, s:.35+(i%5)*.33, drift:.15+(i%7)*.055
}));

function resize(){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  w = innerWidth; h = innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  motionCanvas.width = w * dpr; motionCanvas.height = h * dpr;
  motionCanvas.style.width = w + 'px'; motionCanvas.style.height = h + 'px';
  motionCtx.setTransform(dpr,0,0,dpr,0,0);
}

function drawMotionField(time){
  motionCtx.clearRect(0,0,w,h);
  const energy=Math.min(1,Math.abs(scrollVelocity)/55);
  motionMotes.forEach((p,i)=>{
    let x=(p.x*w+time*p.drift+scrollY*p.z*.028)%(w+80)-40;
    let y=(p.y*h+Math.sin(time*.006+i)*18*p.z-scrollY*p.z*.018)%(h+80);
    if(y<0)y+=h+80;
    const dx=x-mouse.x,dy=y-mouse.y,dist=Math.max(45,Math.hypot(dx,dy));
    if(dist<180){x+=dx/dist*(180-dist)*.12;y+=dy/dist*(180-dist)*.12;}
    const len=2+p.z*(8+energy*42), alpha=.08+p.z*.24+energy*.18;
    motionCtx.strokeStyle=i%6===0?`rgba(255,36,54,${alpha})`:`rgba(238,234,224,${alpha*.58})`;
    motionCtx.lineWidth=Math.max(.45,p.s*.55);
    motionCtx.beginPath();motionCtx.moveTo(x,y);motionCtx.lineTo(x-scrollVelocity*.07*p.z,y+len);motionCtx.stroke();
  });
  gooseTrail.forEach(p=>{
    p.life-=.018+energy*.012;
    p.x-=scrollVelocity*.025*p.depth;
    p.y+=Math.sin(time*.03+p.seed)*.18;
    if(p.life<=0)return;
    motionCtx.fillStyle=p.hot?`rgba(255,64,35,${p.life*.72})`:`rgba(255,220,151,${p.life*.58})`;
    motionCtx.save();motionCtx.translate(p.x,p.y);motionCtx.rotate(p.seed+p.life);motionCtx.fillRect(-p.size/2,-p.size/2,p.size,p.size);motionCtx.restore();
  });
  for(let i=gooseTrail.length-1;i>=0;i--)if(gooseTrail[i].life<=0)gooseTrail.splice(i,1);
  scrollVelocity*=.88;
}

function animateIdleScene(time){
  const breathe=Math.sin(time*.008), drift=Math.cos(time*.0045);
  const pointerX=mouse.x/innerWidth-.5,pointerY=mouse.y/innerHeight-.5;
  retroMac.style.transform=`translate3d(${pointerX*13+breathe*5}px,${pointerY*9+drift*7}px,0) rotate(${breathe*.65}deg)`;
  if (!mobileLayout.matches && !motionPaused) kineticText.forEach((el,i)=>{
    const r=el.getBoundingClientRect();if(r.bottom<0||r.top>h)return;
    const screen=(r.top+r.height*.5-h*.5)/h;
    const x=Math.sin(time*.006+i*1.71)*(2.5+i%3*1.7)+pointerX*(i%2?3:-3);
    const y=-screen*(5+i%4*2.2)+Math.cos(time*.0045+i)*3.5;
    el.style.translate=`${x.toFixed(2)}px ${y.toFixed(2)}px`;
  });
  if (!mobileLayout.matches && !motionPaused) kineticBlocks.forEach((el,i)=>{
    const r=el.getBoundingClientRect();if(r.bottom<0||r.top>h)return;
    const screen=(r.top+r.height*.5-h*.5)/h;
    el.style.translate=`${(Math.sin(time*.0038+i*2.1)*5+pointerX*4).toFixed(2)}px ${(-screen*(8+i%3*3)+Math.cos(time*.0032+i)*5).toFixed(2)}px`;
  });
  const idleX=Math.sin(time*.006)*.7,idleY=Math.cos(time*.005)*.55,idleR=Math.sin(time*.004)*1.8;
  gooseGuide.style.transform=`translate3d(${goosePose.x+idleX}vw,${goosePose.y+idleY}vh,0) rotate(${goosePose.r+idleR}deg) scale(${goosePose.s*(1+Math.sin(time*.007)*.025)})`;
  const slowP=Math.pow(zoomProgress,1.55),mx=(mouse.x/innerWidth-.5),my=(mouse.y/innerHeight-.5);
  cosmicLayers.base.style.transform=`translate3d(${mx*-1.3+drift*.18}%,${my*-1.1+breathe*.16}%,0) scale(${1+slowP*2.8+breathe*.004})`;
  cosmicLayers.particles.style.transform=`translate3d(${mx*7+slowP*1.2+breathe*.7}%,${my*4+slowP*2.6+drift*.55}%,110px) scale(${1+slowP*5.6+breathe*.012}) rotate(${mx*1.4+drift*.3}deg)`;
  cosmicLayers.figure.style.transform=`translate3d(${mx*10-slowP*.7+breathe*.24}%,${my*6+slowP*4.2+drift*.18}%,170px) scale(${1+slowP*3.25+breathe*.006})`;
}

function draw(now = 0){
  if (!motionPaused && mobileLayout.matches && now-lastFrame < 32) { frameId=requestAnimationFrame(draw); return; }
  lastFrame=now;
  ctx.clearRect(0,0,w,h);
  const page = scrollY / Math.max(1, document.body.scrollHeight - h);
  const yBase = h * (.46 + Math.sin(t * .005) * .04);
  ctx.lineWidth = 1;
  for(let band=0; band<5; band++){
    ctx.beginPath();
    for(let x=-20; x<w+20; x+=8){
      const dx = x - mouse.x;
      const influence = Math.exp(-(dx*dx)/70000);
      const wave = Math.sin(x*.018 + t*.018 + band) * (8 + band*3);
      const pointer = (mouse.y-yBase) * influence * .2;
      const y = yBase + wave + pointer + (band-2)*10 + page*90;
      x === -20 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.strokeStyle = band === 2 ? 'rgba(255,36,54,.9)' : 'rgba(255,36,54,.23)';
    ctx.stroke();
  }
  drawProjectScenes(t);
  drawCosmicParticles(t);
  drawMotionField(t);
  animateIdleScene(t);
  if (!motionPaused) { t++; frameId=requestAnimationFrame(draw); }
}

addEventListener('resize', resize);
addEventListener('pointermove', e => {
  mouse.x=e.clientX; mouse.y=e.clientY;
  cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px';
});
document.querySelectorAll('a,.project').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor.classList.add('hot'));
  el.addEventListener('mouseleave',()=>cursor.classList.remove('hot'));
});
setInterval(()=>{ if(motionPaused || mobileLayout.matches)return; glitch.classList.add('active'); setTimeout(()=>glitch.classList.remove('active'),110); }, 1700);

const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting && !motionPaused) entry.target.animate([
    {opacity:.15,transform:'translateY(55px)',filter:'blur(10px)'},
    {opacity:1,transform:'translateY(0)',filter:'blur(0)'}
  ],{duration:750,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
}),{threshold:.18});
document.querySelectorAll('.project,.statement,.manifesto-meta').forEach(el=>observer.observe(el));

let lastArrivalTarget=null,lastArrivalAt=0;
function fireSceneArrival(target){
  if(motionPaused || mobileLayout.matches)return;
  const now=performance.now();if(target===lastArrivalTarget||now-lastArrivalAt<520)return;
  lastArrivalTarget=target;lastArrivalAt=now;
  const messages=['A GOOSE HAS ENTERED YOUR SYSTEM.','REALITY FILE IS CORRUPTED.','FRAGMENT 01 COPIED TO MEMORY.','FRAGMENT 02 REFUSES TO QUIT.','FRAGMENT 03 IS DREAMING.','THE ORIGIN HAS NO DESKTOP.','IT IS NOW SAFE TO WAKE UP.'];
  const targets=[document.querySelector('.hero'),document.querySelector('.manifesto'),...document.querySelectorAll('.project'),document.querySelector('.deepzoom'),document.querySelector('.contact')];
  const index=Math.max(0,targets.indexOf(target));
  retroMessage.textContent=messages[index];
  const arrivalTarget=target.classList.contains('deepzoom')?target.querySelector('.deepzoom-sticky'):target;
  arrivalTarget.classList.remove('video-arrive');void arrivalTarget.offsetWidth;
  arrivalTarget.classList.add('video-arrive');
}
const arrivalObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)fireSceneArrival(entry.target)}),{threshold:.16});
document.querySelectorAll('.hero,.manifesto,.project,.deepzoom,.contact').forEach(el=>arrivalObserver.observe(el));

const gooseGuide = document.querySelector('.goose-guide');
const guideLabel = document.querySelector('.guide-data span');
const guidePercent = document.querySelector('.guide-data b');
const deepzoom = document.querySelector('.deepzoom');
const cosmicLayers = {
  base:document.querySelector('.layer-base'),
  particles:document.querySelector('.layer-particles'),
  figure:document.querySelector('.layer-figure')
};
const zoomHud = document.querySelector('.zoom-hud b');
const cosmicCanvas = document.querySelector('.cosmic-particles');
const cosmicCtx = cosmicCanvas.getContext('2d');
let zoomProgress = 0;
const kineticText=[...document.querySelectorAll('.glitch,.statement,.project h2,.project-no,.projects-head,.zoom-copy strong,.contact-link,.section-label')];
const kineticBlocks=[...document.querySelectorAll('.retro-mac,.manifesto-meta,.project-art,.contact-bottom')];
kineticText.forEach((el,i)=>{el.classList.add('kinetic-text');el.style.animationDelay=`${-i*.43}s`});
kineticBlocks.forEach(el=>el.classList.add('kinetic-block'));

function smoothstep(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)}
function gooseRoute(){
  const projects=[...document.querySelectorAll('.project')];
  const contact=document.querySelector('.contact');
  const max=Math.max(1,document.body.scrollHeight-innerHeight);
  const at=el=>Math.max(0,Math.min(1,(el.getBoundingClientRect().top+scrollY-innerHeight*.42)/max));
  const deepStart=at(deepzoom), deepSpan=Math.max(.01,(deepzoom.offsetHeight-innerHeight)/max);
  return [
    {p:0,x:5,y:74,s:.58,r:-8,o:.15,label:'SIGNAL DÉTECTÉ',mode:'scan'},
    {p:at(document.querySelector('.manifesto')),x:76,y:18,s:.78,r:7,o:1,label:'IL SUIT LA LIGNE ROUGE',mode:'scan'},
    {p:at(projects[0]),x:7,y:58,s:.84,r:-5,o:1,label:'FRAGMENT 01 · CAPTURÉ',mode:'collect'},
    {p:at(projects[1]),x:75,y:24,s:.72,r:6,o:1,label:'FRAGMENT 02 · CAPTURÉ',mode:'collect'},
    {p:at(projects[2]),x:14,y:68,s:.9,r:-8,o:1,label:'FRAGMENT 03 · CAPTURÉ',mode:'collect'},
    {p:deepStart,x:42,y:72,s:.88,r:0,o:1,label:'L’ORIGINE APPELLE',mode:'approach'},
    {p:deepStart+deepSpan*.34,x:57,y:43,s:.55,r:16,o:1,label:'ENTRÉE DANS L’IMAGE',mode:'approach'},
    {p:deepStart+deepSpan*.73,x:50,y:25,s:.12,r:144,o:.08,label:'SIGNAL ABSORBÉ',mode:'vanish'},
    {p:Math.min(.995,at(contact)),x:79,y:62,s:.7,r:-4,o:1,label:'TRANSMISSION TERMINÉE',mode:'return'},
    {p:1,x:88,y:78,s:.62,r:5,o:.35,label:'À SUIVRE',mode:'return'}
  ];
}

function animatePage(){
  const globalP = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
  const vaporFade=Math.max(.035,Math.min(.3,(deepzoom.offsetTop-scrollY+innerHeight*.3)/innerHeight*.18));
  vaporLayer.style.setProperty('--vapor-opacity',vaporFade.toFixed(3));
  scrollVelocity += scrollY-lastScrollY; lastScrollY=scrollY;

  const route=gooseRoute();let a=route[0],b=route[route.length-1];
  for(let i=0;i<route.length-1;i++)if(globalP>=route[i].p&&globalP<=route[i+1].p){a=route[i];b=route[i+1];break}
  const routeT=smoothstep((globalP-a.p)/Math.max(.0001,b.p-a.p));
  const guideX=a.x+(b.x-a.x)*routeT, guideY=a.y+(b.y-a.y)*routeT;
  const guideScale=a.s+(b.s-a.s)*routeT, guideRotate=a.r+(b.r-a.r)*routeT;
  goosePose={x:mobileLayout.matches ? Math.min(guideX, 100-720/innerWidth) : guideX,y:guideY,s:guideScale,r:guideRotate};
  gooseGuide.style.opacity = mobileLayout.matches && globalP < .05 ? .6 : a.o+(b.o-a.o)*routeT;
  gooseGuide.dataset.story=routeT>.55?b.mode:a.mode;
  gooseGuide.style.setProperty('--goose-flip',b.x<a.x?'-1':'1');
  gooseGuide.style.setProperty('--guide-progress',`${Math.round(globalP*100)}%`);
  guidePercent.textContent = `${Math.round(globalP*100)}%`;
  guideLabel.textContent=`SUBJECT 01 · ${routeT>.55?b.label:a.label}`;
  previousGooseX=gooseX;previousGooseY=gooseY;gooseX=guideX/100*innerWidth+46*guideScale;gooseY=guideY/100*innerHeight+46*guideScale;
  if(performance.now()-lastTrailTick>34&&Math.hypot(gooseX-previousGooseX,gooseY-previousGooseY)>.25){
    lastTrailTick=performance.now();
    for(let i=0;i<(a.mode==='collect'?4:2);i++)gooseTrail.push({x:gooseX+(Math.random()-.5)*20,y:gooseY+(Math.random()-.5)*18,life:1,size:1+Math.random()*3.5,depth:.5+Math.random(),seed:Math.random()*6,hot:i%3===0});
  }

  const zoomRect = deepzoom.getBoundingClientRect();
  const zoomP = Math.max(0, Math.min(1, -zoomRect.top / Math.max(1, zoomRect.height - innerHeight)));
  zoomProgress = zoomP;
  const slowP = Math.pow(zoomP, 1.55);
  const imageScale = 1 + slowP * 6.2;
  const mx=(mouse.x/innerWidth-.5), my=(mouse.y/innerHeight-.5);
  const darken=Math.max(.08,1-Math.max(0,zoomP-.72)*3.2);
  cosmicLayers.base.style.filter=`contrast(${1.06+zoomP*.35}) brightness(${darken}) saturate(${1-zoomP*.28})`;
  cosmicLayers.particles.style.filter=`contrast(${1.05+zoomP*.55}) brightness(${darken}) saturate(${.88-zoomP*.18})`;
  cosmicLayers.figure.style.filter=`contrast(${1.18+zoomP*.42}) brightness(${darken*.9})`;
  zoomHud.textContent = imageScale.toFixed(2);
  deepzoom.style.setProperty('--blast-scale', `${.1 + Math.pow(zoomP,3) * 26}`);
  deepzoom.style.setProperty('--blast-opacity', `${Math.max(0,Math.min(.9,(zoomP-.38)*2.2)) * (1-Math.max(0,(zoomP-.82)*5))}`);
  deepzoom.style.setProperty('--zoom-copy', `${Math.max(0,Math.min(1,(zoomP-.78)*5))}`);
  deepzoom.style.setProperty('--copy-scale', `${.82 + Math.max(0,(zoomP-.78)*.82)}`);
  deepzoom.style.setProperty('--portrait-note', `${zoomP < .22 ? .55 : Math.max(0,.55-zoomP)}`);
}
addEventListener('scroll', () => { animatePage(); if(motionPaused) draw(); }, {passive:true});

const sceneCanvases=[...document.querySelectorAll('.project-canvas')];
function projectPoint(x,y,z,rx,ry,cx,cy,scale){
  const cyR=Math.cos(ry),syR=Math.sin(ry),cxR=Math.cos(rx),sxR=Math.sin(rx);
  let x1=x*cyR-z*syR, z1=x*syR+z*cyR;
  let y1=y*cxR-z1*sxR; z1=y*sxR+z1*cxR;
  const depth=Math.max(.4,z1+6.5), f=scale/depth;
  return {x:cx+x1*f,y:cy+y1*f,a:Math.max(.08,1-depth/12),s:Math.max(.6,4.2/depth)};
}
function prepCanvas(c){
  const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
  if(c.width!==Math.round(r.width*d)||c.height!==Math.round(r.height*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d)}
  const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return {x,r};
}
function drawProjectScenes(time){
  sceneCanvases.forEach((c,index)=>{
    const {x:g,r}=prepCanvas(c); if(r.bottom<0||r.top>innerHeight)return;
    const cw=r.width,ch=r.height; g.clearRect(0,0,cw,ch);g.fillStyle='#070707';g.fillRect(0,0,cw,ch);
    const mx=Math.max(-1,Math.min(1,(mouse.x-r.left)/cw*2-1));
    const my=Math.max(-1,Math.min(1,(mouse.y-r.top)/ch*2-1));
    const local=(innerHeight*.5-(r.top+r.height*.5))/innerHeight;
    const rx=my*.34+local*.55,ry=mx*.48+local*.85,sc=Math.min(cw,ch)*1.35;
    g.lineWidth=1;
    if(index===0){
      let prev;
      for(let i=0;i<120;i++){
        const a=i*.39+time*.006,radius=1.25+(i%9)*.09;
        const p=projectPoint(Math.cos(a)*radius,(i%24-12)*.13,Math.sin(a)*radius,rx,ry,cw/2,ch/2,sc);
        if(prev){g.strokeStyle=`rgba(255,59,10,${p.a*.65})`;g.beginPath();g.moveTo(prev.x,prev.y);g.lineTo(p.x,p.y);g.stroke()}
        g.fillStyle=`rgba(238,234,224,${.25+p.a})`;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);prev=p;
      }
    } else if(index===1){
      for(let ring=0;ring<14;ring++){
        const z=((ring*.82+time*.012+local*8)%11)-5.5;g.beginPath();
        for(let j=0;j<=20;j++){
          const a=j/20*Math.PI*2+ry*.3;const p=projectPoint(Math.cos(a)*2.1,Math.sin(a)*1.3,z,rx*.35,ry*.2,cw/2,ch/2,sc);
          j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);
        }
        g.strokeStyle=`rgba(${ring%3?238:'255'},${ring%3?234:'59'},${ring%3?224:'10'},${.12+(ring/14)*.4})`;g.stroke();
      }
    } else {
      for(let iz=-6;iz<=6;iz++){
        g.beginPath();
        for(let ix=-7;ix<=7;ix++){
          const yy=Math.sin(ix*.72+time*.018)*.42+Math.cos(iz*.66-time*.013)*.32;
          const p=projectPoint(ix*.38,yy,iz*.38,rx,ry,cw/2,ch/2,sc);
          ix===-7?g.moveTo(p.x,p.y):g.lineTo(p.x,p.y);
        }
        g.strokeStyle=`rgba(255,59,10,${.22+(iz+6)/32})`;g.stroke();
      }
    }
  });
}

const cosmicDots=Array.from({length:mobileLayout.matches ? 70 : 180},(_,i)=>({x:(Math.sin(i*91.17)*.5+.5),y:(Math.sin(i*47.41+2)*.5+.5),z:(i%17)/17,s:1+(i%5)}));
function drawCosmicParticles(time){
  const r=cosmicCanvas.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
  const d=Math.min(devicePixelRatio||1,2);if(cosmicCanvas.width!==Math.round(r.width*d)||cosmicCanvas.height!==Math.round(r.height*d)){cosmicCanvas.width=Math.round(r.width*d);cosmicCanvas.height=Math.round(r.height*d)}
  cosmicCtx.setTransform(d,0,0,d,0,0);cosmicCtx.clearRect(0,0,r.width,r.height);
  const mx=(mouse.x/innerWidth-.5),my=(mouse.y/innerHeight-.5),spread=1+zoomProgress*5;
  cosmicDots.forEach((p,i)=>{
    const x=r.width*(.52+(p.x-.52)*spread)+mx*(30+p.z*80);
    const y=r.height*(.27+(p.y-.27)*spread)+my*(20+p.z*65);
    const alpha=Math.max(0,.75-zoomProgress*.45-p.z*.2);const size=p.s*(.45+zoomProgress*1.4);
    cosmicCtx.fillStyle=`rgba(255,205,111,${alpha})`;cosmicCtx.beginPath();cosmicCtx.arc(x,y,size,0,Math.PI*2);cosmicCtx.fill();
  });
}

motionToggle.addEventListener('click',()=>{
  motionPaused=!motionPaused;
  syncMotionMode();
  document.getAnimations().forEach(animation=>animation.cancel());
  cancelAnimationFrame(frameId);
  animatePage(); draw();
});
reducedMotion.addEventListener('change',e=>{
  motionPaused=e.matches; syncMotionMode(); cancelAnimationFrame(frameId); animatePage(); draw();
});
addEventListener('resize',()=>{ animatePage(); if(motionPaused)draw(); });
animatePage();
resize(); draw();
