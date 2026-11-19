(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const canvas=$('#swarm'), fallback=$('#compatible'), status=$('#render-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), mobile=()=>innerWidth<=700;
  let lastPaint=0;let preference=null;try{preference=localStorage.getItem('eg-formation-motion')}catch{}
  let paused=reduced.matches||preference==='off',reading=false,skill=0,gl=null,renderer=null,frame=0,lastTime=0,time=0,scrollPosition=0,targetPosition=0,active=-1,from=-1,to=-1,burstAt=-Infinity,skillStart=0,skillFrom=0,resizePending=true,dirty=true,w=innerWidth,h=innerHeight,ratio=1;
  const count=mobile()?3000:6200;
  const forms=window.createFormations(count);
  const stops=$$('.scroll-stop'),stories=$$('.story'),dots=$$('.timeline>a');
  const names=['L’INTUITION','LE JEU DEVIENT RENCONTRE','L’INFORMATION PREND FORME','DU PLAN AUX CONNEXIONS','COMPRENDRE SON RYTHME','LES GESTES SE RÉPONDENT','LA CURIOSITÉ, TOUJOURS'];
  const subtitles=['LE POSSIBLE, AVANT LA FORME.','KIKALMO / LES MOTS NOUS RELIENT.','MARKET PLUS / CLARIFIER POUR AGIR.','MAISON / DESSINER, MESURER, CONFIGURER.','BODYOS / UNE VUE SUR LE QUOTIDIEN.','INTERFACE, LOGIQUE, EXPÉRIMENTATION.','LE PROCHAIN POINT RESTE À INVENTER.'];
  const palettes=[[1,.43,.26],[.31,.88,.78],[1,.68,.32],[.65,.52,1],[.32,.67,1],[.58,.78,1],[1,.43,.26]];
  const rotations=[[.12,-.18],[.05,-.15],[.12,-.22],[.48,-.4],[.08,-.15],[.13,-.35],[0,-.12]];
  const pointer={x:0,y:0,tx:0,ty:0};
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));const ease=n=>n*n*(3-2*n);
  const mix=(a,b,t)=>a+(b-a)*t;
  function announceError(message){status.textContent=message;status.hidden=false;setTimeout(()=>{status.hidden=true},6500)}
  function makeGL(){
    gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',premultipliedAlpha:false});if(!gl)throw Error('WebGL unavailable');
    const vertex=`attribute vec3 aFrom;attribute vec3 aTo;attribute float aSeed;
      uniform float uMix,uTime,uAspect,uRatio,uBurst,uEnergy,uScale;uniform vec2 uCenter,uRotation;
      varying float vAlpha,vHeat;
      void main(){float e=uMix*uMix*(3.0-2.0*uMix);vec3 p=mix(aFrom,aTo,e);float bridge=sin(e*3.14159265);
      float phase=aSeed*6.28318;
      p+=bridge*vec3(sin(phase+uTime*.32)*.7,cos(phase*1.7+uTime*.25)*.6,sin(phase*2.3)*1.1);
      p+=uBurst*vec3(sin(phase*3.1),cos(phase*2.7),sin(phase*1.7))*2.1;
      p+=uEnergy*.022*vec3(sin(uTime*.45+phase),cos(uTime*.4+phase),sin(uTime*.35+phase));
      float ry=uRotation.y,rx=uRotation.x; p=vec3(p.x*cos(ry)+p.z*sin(ry),p.y,-p.x*sin(ry)+p.z*cos(ry));
      p=vec3(p.x,p.y*cos(rx)-p.z*sin(rx),p.y*sin(rx)+p.z*cos(rx));p*=uScale;
      float depth=7.0-p.z;gl_Position=vec4(p.x*2.4/uAspect+uCenter.x*depth,p.y*2.4+uCenter.y*depth,0.,depth);
      gl_PointSize=clamp((1.85+aSeed*.8)*uRatio*(6.8/depth),1.,8.);vAlpha=clamp(.55+p.z*.11,.22,.95);vHeat=.5+.5*sin(phase*3.+uTime*.7);}`;
    const fragment=`precision mediump float;uniform vec3 uColor;varying float vAlpha,vHeat;void main(){float r=length(gl_PointCoord-vec2(.5));if(r>.5)discard;float a=(1.-smoothstep(.1,.5,r))*vAlpha;vec3 c=mix(uColor,vec3(1.,.98,.93),pow(vHeat,7.)*.68);gl_FragColor=vec4(c,a);}`;
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'Shader compilation failed');return s}
    const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link failed');gl.useProgram(program);
    const uniforms={};for(const n of ['Mix','Time','Aspect','Ratio','Burst','Energy','Scale','Center','Rotation','Color'])uniforms[n]=gl.getUniformLocation(program,'u'+n);
    function attribute(name,size,data){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);const at=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,size,gl.FLOAT,false,0,0);return buffer}
    const a=attribute('aFrom',3,forms.scenes[0]),b=attribute('aTo',3,forms.scenes[0]);attribute('aSeed',1,Float32Array.from({length:count},(_,i)=>((i*16807)%2147483647)/2147483647+(i%71)/71));
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);
    return {type:'webgl',resize(){gl.viewport(0,0,canvas.width,canvas.height)},set(A,B){gl.bindBuffer(gl.ARRAY_BUFFER,a);gl.bufferData(gl.ARRAY_BUFFER,A,gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,B,gl.DYNAMIC_DRAW)},draw(m,t,burst,rx,ry,color,scale,center){gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(uniforms.Mix,m);gl.uniform1f(uniforms.Time,t);gl.uniform1f(uniforms.Aspect,w/h);gl.uniform1f(uniforms.Ratio,ratio);gl.uniform1f(uniforms.Burst,burst);gl.uniform1f(uniforms.Energy,paused?0:1);gl.uniform1f(uniforms.Scale,scale);gl.uniform2f(uniforms.Center,...center);gl.uniform2f(uniforms.Rotation,rx,ry);gl.uniform3f(uniforms.Color,...color);gl.drawArrays(gl.POINTS,0,count)}};
  }
  function makeCompatible(){
    canvas.hidden=true;fallback.hidden=false;const ctx=fallback.getContext('2d');let A=forms.scenes[0],B=A;
    return {type:'canvas',resize(){ctx.setTransform(ratio,0,0,ratio,0,0);ctx.globalCompositeOperation='lighter'},set(a,b){A=a;B=b},draw(m,t,burst,rx,ry,color,scale,center){ctx.clearRect(0,0,w,h);const e=ease(m),s=Math.sin(e*Math.PI);const col=color.map(c=>Math.round(c*255));for(let i=0;i<count;i++){const n=i*3,phase=i*.618;let x=mix(A[n],B[n],e)+s*Math.sin(phase)*.7+burst*Math.sin(phase)*2,y=mix(A[n+1],B[n+1],e)+s*Math.cos(phase)*.6+burst*Math.cos(phase)*2,z=mix(A[n+2],B[n+2],e);let xx=x*Math.cos(ry)+z*Math.sin(ry);z=-x*Math.sin(ry)+z*Math.cos(ry);const yy=y*Math.cos(rx)-z*Math.sin(rx);z=y*Math.sin(rx)+z*Math.cos(rx);x=xx*scale;y=yy*scale;z*=scale;const depth=7-z,px=(x*2.4/(w/h)/depth+center[0]+1)*w*.5,py=(1-(y*2.4/depth+center[1]))*h*.5;const bright=i%7===0;ctx.fillStyle=`rgba(${bright?'245,247,242':col.join(',')},${clamp(.8+z*.1,.35,1)})`;const size=bright?1.9:1.6;ctx.fillRect(px,py,size,size)}}};
  }
  try{renderer=makeGL()}catch(error){console.warn('Renderer:',error.message);renderer=makeCompatible();announceError('Affichage compatible activé. Le parcours et les formations restent disponibles.')}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;announceError('Le rendu 3D a été interrompu. Reprise en mode compatible.');renderer=makeCompatible();resizePending=true;from=-1;wake()});
  canvas.dataset.renderer=renderer.type;$('#point-count').textContent=`${new Intl.NumberFormat('fr-FR').format(count)} POINTS / 1 IDÉE`;
  function resize(){w=innerWidth;h=innerHeight;ratio=Math.min(devicePixelRatio||1,mobile()?1.6:2);for(const c of [canvas,fallback]){c.width=Math.round(w*ratio);c.height=Math.round(h*ratio)}renderer.resize();resizePending=false;dirty=true}
  function readPosition(){if(reading)return active<0?0:active;const step=stops[1].offsetTop-stops[0].offsetTop;return clamp(scrollY/Math.max(1,step),0,6)}
  function selectStory(i){
    if(i===active)return;active=i;
    stories.forEach((s,n)=>{s.classList.toggle('is-active',n===i);s.inert=!reading&&n!==i});
    dots.forEach((a,n)=>{if(n===i)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});
    $('#formation-label').textContent=`FORMATION ${String(i+1).padStart(2,'0')} / 07`;
    $('#chapter-count').innerHTML=`${String(i+1).padStart(2,'0')} <i>/</i> 07`;
    $('#scene-title').textContent=names[i];$('#scene-subtitle').textContent=subtitles[i];
    $('#previous').disabled=i===0;$('#next').disabled=i===6;
    const c=palettes[i].map(v=>Math.round(v*255));document.documentElement.style.setProperty('--accent',`rgb(${c.join(',')})`);
  }
  function animate(now){
    frame=0;if(document.hidden)return;if(!paused&&renderer.type==='canvas'&&now-lastPaint<32){frame=requestAnimationFrame(animate);return}lastPaint=now;const dt=Math.min(.05,(now-(lastTime||now))/1000);lastTime=now;
    if(resizePending)resize();if(dirty){targetPosition=readPosition();dirty=false}
    const follow=1-Math.exp(-dt*9);scrollPosition=paused?targetPosition:mix(scrollPosition,targetPosition,follow);
    if(Math.abs(scrollPosition-targetPosition)<.0001)scrollPosition=targetPosition;
    const idx=Math.min(6,Math.floor(scrollPosition)),f=scrollPosition-idx,next=Math.min(6,idx+1);let blend=clamp((f-.57)/.43);
    if(paused)blend=blend>.5?1:0;
    const story=blend>.5?next:idx;selectStory(story);
    let A=forms.scenes[idx],B=forms.scenes[next],inter=blend;
    if(idx===5&&blend===0&&now-skillStart<1000&&!paused){A=forms.skills[skillFrom];B=forms.skills[skill];inter=clamp((now-skillStart)/950)}
    const key=`${idx}/${next}/${skill}/${A===forms.skills[skillFrom]&&inter!==blend}`;
    if(from!==key){renderer.set(A,B);from=key;to=next}
    if(!paused)time+=dt;
    pointer.x=mix(pointer.x,pointer.tx,follow);pointer.y=mix(pointer.y,pointer.ty,follow);
    const c=palettes[idx].map((v,i)=>mix(v,palettes[next][i],ease(blend)));
    const ambient=paused?0:Math.sin(time*.16)*.11;
    let rx=mix(rotations[idx][0],rotations[next][0],ease(blend)),ry=mix(rotations[idx][1],rotations[next][1],ease(blend));
    if(!paused){rx+=pointer.y*.12;ry+=pointer.x*.19+ambient}
    const elapsed=(now-burstAt)/1000,burst=paused?0:elapsed>=0&&elapsed<1.9?Math.pow(Math.sin(Math.PI*elapsed/1.9),2):0;
    const scales=[1,.95,.93,.88,.98,1,1];let scale=(mobile()?Math.min(.48,w/h*.93):.82)*mix(scales[idx],scales[next],ease(blend));const center=mobile()?[.03,.48]:[.45,.02];
    renderer.draw(inter,time,burst,rx,ry,c,scale,center);
    $('#timeline-progress').style.transform=`scaleX(${scrollPosition/6})`;
    $('#coord-x').textContent=ry.toFixed(3);$('#coord-y').textContent=rx.toFixed(3);
    if(!paused||Math.abs(scrollPosition-targetPosition)>.0001)frame=requestAnimationFrame(animate);
  }
  function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(animate)}
  function mode(){document.documentElement.classList.toggle('motion-paused',paused);$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').setAttribute('aria-label',paused?'Activer les animations':'Réduire les animations');$('#motion').innerHTML=paused?'<span aria-hidden="true">▷</span> MOUVEMENT OFF':'<span aria-hidden="true">Ⅱ</span> MOUVEMENT';lastTime=0;dirty=true;wake()}
  function go(i){i=clamp(i,0,6);if(reading){stories[i].scrollIntoView({behavior:paused?'instant':'smooth'});return}stops[i].scrollIntoView({behavior:paused?'instant':'smooth'});history.replaceState(null,'','#'+stops[i].id)}
  $('#next').addEventListener('click',()=>go(active+1));$('#previous').addEventListener('click',()=>go(active-1));
  $('#scatter').addEventListener('click',()=>{burstAt=performance.now();wake()});
  $('#motion').addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('eg-formation-motion',paused?'off':'on')}catch{}mode()});
  reduced.addEventListener('change',e=>{paused=e.matches;mode()});
  $('#reading').addEventListener('click',()=>{reading=!reading;document.body.classList.toggle('reading-mode',reading);$('#reading').setAttribute('aria-pressed',String(reading));$('#reading').textContent=reading?'VUE IMMERSIVE':'VUE SIMPLE';stories.forEach((s,i)=>s.inert=!reading&&i!==active);resizePending=true;if(!reading)go(active);else stories[active].scrollIntoView({behavior:'instant'});wake()});
  const skillData=[['Rendre l’interaction évidente.','React, JavaScript, TypeScript. Concevoir une interface, organiser ses états et affiner ses interactions.'],['Relier les données et la logique.','Node.js, SQL, NoSQL, VBA. Structurer l’information et construire les outils qui simplifient un usage.'],['Essayer ce qui n’existe pas encore.','3D, interaction, assistants IA. Prototyper, observer le résultat et faire évoluer l’idée par petites itérations.']];
  $$('[data-skill]').forEach(b=>b.addEventListener('click',()=>{skillFrom=skill;skill=Number(b.dataset.skill);skillStart=performance.now();forms.scenes[5]=forms.skills[skill];$$('[data-skill]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#skill-title').textContent=skillData[skill][0];$('#skill-copy').textContent=skillData[skill][1];from=-1;wake()}));
  addEventListener('scroll',()=>{dirty=true;wake()},{passive:true});addEventListener('resize',()=>{resizePending=true;wake()});
  addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer.tx=(e.clientX/innerWidth-.5)*2;pointer.ty=(e.clientY/innerHeight-.5)*2},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else{lastTime=0;wake()}});
  document.addEventListener('keydown',e=>{if(reading||e.target.closest('a,button,input,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();go(active+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(active-1)}});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const i=stops.findIndex(s=>'#'+s.id===a.getAttribute('href'));if(i>=0){e.preventDefault();go(i)}});
  targetPosition=readPosition();scrollPosition=targetPosition;mode();
})();
