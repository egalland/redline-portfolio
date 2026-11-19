/* Parametric point formations. Every object shares the same number of drones. */
window.createFormations = function(count){
  let points=[];
  const TAU=Math.PI*2;
  const add=(x,y,z=0)=>points.push([x,y,z]);
  function line(a,b,n=45){for(let i=0;i<n;i++){const t=i/(n-1);add(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t)}}
  function box(x,y,z,w,h,d,n=28){const p=[];for(let a=0;a<8;a++)p.push([x+(a&1?w/2:-w/2),y+(a&2?h/2:-h/2),z+(a&4?d/2:-d/2)]);for(let a=0;a<8;a++)for(const bit of [1,2,4])if(!(a&bit))line(p[a],p[a|bit],n)}
  function ring(x,y,z,rx,ry,n=190,tilt=0){for(let i=0;i<n;i++){const a=i/n*TAU;add(x+Math.cos(a)*rx,y+Math.sin(a)*ry*Math.cos(tilt),z+Math.sin(a)*ry*Math.sin(tilt))}}
  function text(value,x,y,z,width){const c=document.createElement('canvas');c.width=650;c.height=170;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.font='700 115px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,325,88);const data=ctx.getImageData(0,0,650,170).data;const measured=ctx.measureText(value).width;for(let yy=8;yy<165;yy+=3)for(let xx=0;xx<650;xx+=3)if(data[(yy*650+xx)*4+3]>130)add(x+(xx-325)/measured*width,y-(yy-88)/measured*width,z+Math.sin(xx*yy)*.018)}
  function normalize(){const raw=points;const out=new Float32Array(count*3);for(let i=0;i<count;i++){const index=(i*2654435761>>>0)%count;const t=index/count*(raw.length-1);const p=raw[Math.floor(t)];out[i*3]=p[0];out[i*3+1]=p[1];out[i*3+2]=p[2]}points=[];return out}
  const result=[];
  // 00 / potential: a Fibonacci globe inside a delicate orbital structure.
  for(let i=0;i<count;i++){const v=i/count,y=1-2*v,r=Math.sqrt(1-y*y),a=i*2.399963229728653;let radius=1.68;if(i%6===0)radius*=.83;add(Math.cos(a)*r*radius,y*radius,Math.sin(a)*r*radius)}
  for(let k=0;k<3;k++)ring(0,0,0,2.13,2.13,300,.6+k*.8);
  result.push(normalize());
  // 01 / words become a social space.
  text('M_T',0,.28,.4,3.25);box(0,.28,.25,4.05,1.65,.18,65);
  line([-1.1,-.55,.35],[-1.1,-1,.35],40);line([-1.1,-1,.35],[-.5,-.55,.35],45);
  box(1.3,1.55,-.7,1.25,.7,.2,30);text('?!',1.3,1.55,-.55,.65);
  ring(-1.75,-1.4,-.45,.45,.45,200);ring(-.55,-1.5,-.45,.23,.23,100);ring(.3,-1.5,-.45,.23,.23,100);ring(1.15,-1.5,-.45,.23,.23,100);
  result.push(normalize());
  // 02 / Market Plus: independent modules composing one decision surface.
  box(0,0,0,3.9,2.8,.14,55);
  line([-1.95,1.03,.12],[1.95,1.03,.12],90);
  for(let k=0;k<3;k++)ring(-1.67+k*.19,1.22,.14,.045,.045,24);
  for(let k=0;k<3;k++){
    const x=-1.2+k*1.2;box(x,.65,.18,1.02,.42,.16,30);
    for(let l=0;l<3;l++)line([x-.35,.78-l*.1,.3],[x+.15+(l%2)*.2,.78-l*.1,.3],22);
  }
  box(-.68,-.37,.18,2.05,1.3,.2,40);box(1.13,-.37,.28,1.12,1.3,.2,35);
  const chart=[[-1.53,-.62,.35],[-1.2,-.24,.35],[-.87,-.46,.35],[-.54,.1,.35],[-.2,-.03,.35],[.15,.2,.35]];
  for(let k=0;k<chart.length-1;k++)line(chart[k],chart[k+1],55);
  for(let k=0;k<4;k++)line([-1.53,-.76+k*.25,.31],[.15,-.76+k*.25,.31],50);
  for(let k=0;k<4;k++){const x=.78+k*.23,height=.25+k*.17;box(x,-.83+height/2,.43,.12,height,.1,24)}
  for(let k=0;k<3;k++)line([-1.7,-1.15+k*.1,.1],[1.7,-1.15+k*.1,.1],100);
  result.push(normalize());
  // 03 / one house project: a dimensioned floor plan connected to a switchboard.
  const floorY=-.72;
  // Open floor slab and walls make the plan legible in perspective.
  box(-.6,floorY,0,2.7,.1,2.5,48);
  const wall=(a,b)=>{line([a[0],floorY,a[1]],[b[0],floorY,b[1]],55);line([a[0],.26,a[1]],[b[0],.26,b[1]],55);line([a[0],floorY,a[1]],[a[0],.26,a[1]],32);line([b[0],floorY,b[1]],[b[0],.26,b[1]],32)};
  wall([-1.95,-1.25],[.75,-1.25]);wall([-1.95,-1.25],[-1.95,1.25]);wall([.75,-1.25],[.75,.25]);
  wall([-.7,-1.25],[-.7,-.25]);wall([-.7,.38],[-.7,1.25]);
  box(-1.36,-.52,-.64,.7,.35,.72,26);box(-.06,-.53,.75,1.02,.32,.5,26);
  // Cote lines around the floor; these are pictorial, not actual measurements.
  line([-2.2,-.86,-1.45],[.9,-.86,-1.45],90);line([-2.2,-.86,-1.45],[-2.2,-.86,1.4],75);
  for(const x of [-2.2,.9])line([x,-.86,-1.58],[x,-.86,-1.32],18);
  for(const z of [-1.45,1.4])line([-2.33,-.86,z],[-2.07,-.86,z],18);
  // Raised four-row cabinet alongside the floor plan.
  box(1.48,.35,-.06,1.2,2.45,.3,48);
  for(let row=0;row<4;row++){
    const y=1.23-row*.59;line([.97,y-.22,.17],[2.0,y-.22,.17],45);
    for(let col=0;col<5;col++){const x=1.06+col*.205;box(x,y,.25,.15,.36,.18,18);line([x-.035,y+.07,.36],[x+.035,y+.07,.36],12)}
  }
  for(let lane=0;lane<3;lane++){
    const z=.23+lane*.1;line([1.48,-.87,z],[1.48,-1.03,z],22);line([1.48,-1.03,z],[.4,-1.03,z],35);line([.4,-1.03,z],[.4,-.68,z],28);line([.4,-.68,z],[-.52,-.68,z],35);
  }
  result.push(normalize());
  // 04 / BodyOS: a rhythm, a central view and three related tracking modules.
  ring(0,.16,0,1.72,1.72,480,.14);ring(0,.16,-.12,1.52,1.52,380,.14);
  const pulse=[[-1.3,.15,.35],[-.9,.15,.35],[-.67,.38,.35],[-.43,-.38,.35],[-.1,.83,.35],[.2,-.65,.35],[.46,.15,.35],[1.3,.15,.35]];
  for(let i=0;i<pulse.length-1;i++)line(pulse[i],pulse[i+1],95);
  for(const [x,y] of [[-1.65,-1.1],[0,-1.78],[1.65,-1.1]]){
    box(x,y,.16,.82,.56,.12,30);for(let k=0;k<3;k++)line([x-.26,y+.14-k*.13,.26],[x+.25-(k%2)*.18,y+.14-k*.13,.26],27);
  }
  for(let i=0;i<18;i++){const a=i/18*TAU;line([Math.cos(a)*1.86,.16+Math.sin(a)*1.86,-.05],[Math.cos(a)*1.97,.16+Math.sin(a)*1.97,-.05],14)}
  result.push(normalize());
  // 05 / interface, systems and creative exploration.
  function skills(which){
    if(which===0){for(let layer=0;layer<3;layer++){const x=(layer-1)*.42,y=(1-layer)*.35,z=(layer-1)*.65;box(x,y,z,3.45,2.1,.06,65);line([x-1.72,y+.65,z+.1],[x+1.72,y+.65,z+.1],85);for(let i=0;i<3;i++)ring(x-1.42+i*.19,y+.86,z+.1,.045,.045,25);for(let l=0;l<5;l++){line([x-1.38+(l%2)*.22,y+.37-l*.24,z+.1],[x+.7-(l%3)*.3,y+.37-l*.24,z+.1],45)}}}
    if(which===1){for(let layer=0;layer<3;layer++){const n=1+layer*3;for(let i=0;i<n;i++){const a=i/n*TAU,rx=layer*.8;const x=Math.cos(a)*rx,y=1.5-layer*1.35,z=Math.sin(a)*rx;ring(x,y,z,.18,.18,85);if(layer>0)line([0,1.5,0],[x,y,z],100)}}}
    if(which===2){for(let i=0;i<count;i++){const a=i/count*TAU*3,b=i*2.39996;const r=1.15+.42*Math.cos(a*2/3);const x=r*Math.cos(a),y=r*Math.sin(a),z=.62*Math.sin(a*2/3);add(x+.16*Math.cos(b)*Math.cos(a),y+.16*Math.cos(b)*Math.sin(a),z+.16*Math.sin(b))}}
    return normalize();
  }
  const skillForms=[skills(0),skills(1),skills(2)];result.push(skillForms[0]);
  text('EG',0,0,.35,3.0);ring(0,0,-.3,2.15,2.15,500,.3);ring(0,0,-.3,2.3,2.3,450,1.1);result.push(normalize());
  return {scenes:result,skills:skillForms,count};
};
