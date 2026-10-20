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
resize(); draw();
