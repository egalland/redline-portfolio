const canvas = document.querySelector('#signal');
const ctx = canvas.getContext('2d');
const cursor = document.querySelector('.cursor');
const glitch = document.querySelector('.glitch');
let w, h, mouse = { x: innerWidth / 2, y: innerHeight / 2 }, t = 0;

function resize(){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  w = innerWidth; h = innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function draw(){
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
  t++;
  requestAnimationFrame(draw);
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
setInterval(()=>{ glitch.classList.add('active'); setTimeout(()=>glitch.classList.remove('active'),110); }, 1700);

const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting) entry.target.animate([
    {opacity:.15,transform:'translateY(55px)',filter:'blur(10px)'},
    {opacity:1,transform:'translateY(0)',filter:'blur(0)'}
  ],{duration:750,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
}),{threshold:.18});
document.querySelectorAll('.project,.statement,.manifesto-meta').forEach(el=>observer.observe(el));

const scrollRibbon = document.querySelector('.scroll-ribbon');
const ribbonPaths = document.querySelectorAll('.scroll-ribbon path');
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

function animatePage(){
  const globalP = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
  scrollRibbon.style.transform = `translate3d(${Math.sin(globalP * 7) * 9}vw,${-globalP * 24}vh,0) rotate(${globalP * 9 - 5}deg)`;
  ribbonPaths.forEach((path,i)=>{
    path.style.strokeDashoffset = `${-globalP * (900 + i * 180)}`;
  });

  const guideX = 3 + globalP * 78 + Math.sin(globalP * 24) * 8;
  const guideY = 7 + globalP * 72 + Math.cos(globalP * 19) * 4;
  const guideScale = .72 + Math.sin(globalP * Math.PI) * .42;
  gooseGuide.style.transform = `translate3d(${guideX}vw,${guideY}vh,0) rotate(${Math.sin(globalP * 31) * 8}deg) scale(${guideScale})`;
  gooseGuide.style.opacity = globalP > .965 ? 0 : 1;
  gooseGuide.style.setProperty('--guide-progress',`${Math.round(globalP*100)}%`);
  guidePercent.textContent = `${Math.round(globalP*100)}%`;
  const centerSection = [...document.querySelectorAll('main>section')].find(section=>{
    const r=section.getBoundingClientRect(); return r.top<=innerHeight*.5 && r.bottom>=innerHeight*.5;
  });
  const guideNames={hero:'SIGNAL D’ENTRÉE',manifesto:'MANIFESTE',projects:'THREE WORLDS',deepzoom:'THE ORIGIN',contact:'END TRANSMISSION'};
  if(centerSection){
    const key=[...centerSection.classList].find(c=>guideNames[c]);
    if(key) guideLabel.textContent=`SUBJECT 01 · ${guideNames[key]}`;
  }

  const zoomRect = deepzoom.getBoundingClientRect();
  const zoomP = Math.max(0, Math.min(1, -zoomRect.top / Math.max(1, zoomRect.height - innerHeight)));
  zoomProgress = zoomP;
  const slowP = Math.pow(zoomP, 1.55);
  const imageScale = 1 + slowP * 6.2;
  const mx=(mouse.x/innerWidth-.5), my=(mouse.y/innerHeight-.5);
  const darken=Math.max(.08,1-Math.max(0,zoomP-.72)*3.2);
  cosmicLayers.base.style.transform=`translate3d(${mx*-1.3}%,${my*-1.1}%,0) scale(${1+slowP*2.8})`;
  cosmicLayers.particles.style.transform=`translate3d(${mx*7+slowP*1.2}%,${my*4+slowP*2.6}%,110px) scale(${1+slowP*5.6}) rotate(${mx*1.4}deg)`;
  cosmicLayers.figure.style.transform=`translate3d(${mx*10-slowP*.7}%,${my*6+slowP*4.2}%,170px) scale(${1+slowP*3.25})`;
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
addEventListener('scroll', animatePage, {passive:true});

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

const cosmicDots=Array.from({length:180},(_,i)=>({x:(Math.sin(i*91.17)*.5+.5),y:(Math.sin(i*47.41+2)*.5+.5),z:(i%17)/17,s:1+(i%5)}));
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

animatePage();
resize(); draw();
