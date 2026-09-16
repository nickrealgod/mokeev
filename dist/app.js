'use strict';
const data = window.LETTERS;
const { family, pick, nextGradient, options, commonFamilies, gradientSet } = window.Variations;
const canvas = document.querySelector('#stage'), ctx = canvas.getContext('2d');
const nav = document.querySelector('nav'), reduce = matchMedia('(prefers-reduced-motion: reduce)');
const order = ['M','O','K','E','€','V','*','C','Oo','M2'];
const items = order.map(key => ({ key, style:'black', gradient:-1, surface:null, cycles:{}, variants:{}, x:0, y:0, from:[0,0], to:[0,0], driftAt:0 }));
const easeOut = t => 1 - Math.pow(1-t,3);
const progress = (elapsed, start, duration) => reduce.matches ? 1 : Math.max(0, Math.min(1,(elapsed-start)/duration));
const timeline = { hold:750, camera:1500, icons:1500, arrows:0 };
const cameraEnd = timeline.hold + timeline.camera;
const iconsEnd = cameraEnd + timeline.icons;
const introEnd = iconsEnd + timeline.arrows;
const reflection=document.createElement('canvas'), reflectionCtx=reflection.getContext('2d');
let w=innerWidth, h=innerHeight, fit=1, linksTop=0, start=null, ready=false;
let hover=null, focused=null, lastWheel=0, wheelDelta=0, lastScrollFamily='black';
let raf=0, backgroundIndex=0, waveUntil=0, lastWheelEvent=0, wheelConsumed=false, letteringY=0;
const backgrounds=[
  [[0,[247,250,254]],[1,[255,248,237]]],
  [[0,[255,255,255]],[1,[255,255,255]]],
  [[0,[251,248,255]],[1,[251,248,255]]],
  [[0,[208,219,230]],[.5,[231,234,241]],[1,[228,232,239]]]
];
function syncPageBackground(){
  const stops=backgrounds[backgroundIndex];
  document.documentElement.style.setProperty('--page-background','linear-gradient(to bottom,'+stops.map(([at,rgb])=>'rgb('+rgb.join(',')+') '+at*100+'%').join(',')+')');
  document.querySelector('meta[name="theme-color"]').content='rgb('+stops[0][1].join(',')+')';
}
function changeBackground(){backgroundIndex=(backgroundIndex+1)%backgrounds.length;syncPageBackground();}
syncPageBackground();
const all = Object.values(data.letters).flatMap(v => Object.values(v));
const bounds = { x:Math.min(...all.map(v=>v.x)), y:Math.min(...all.map(v=>v.y)), right:Math.max(...all.map(v=>v.x+v.w)), bottom:Math.max(...all.map(v=>v.y+v.h)) };
const center=[(bounds.x+bounds.right)/2,(bounds.y+bounds.bottom)/2];
const baseline=Math.max(...order.slice(0,6).map(key=>data.letters[key].black.y+data.letters[key].black.h));
const euro=data.letters['€'].black, focus=[euro.x+euro.w/2,euro.y+euro.h/2];
nav.inert = true;
function resize() {
  w=innerWidth; h=innerHeight;
  // Preserve Retina detail while keeping the canvas within mobile memory limits.
  const dpr=Math.min(devicePixelRatio||1, Math.sqrt(16777216/(w*h)), 8192/w, 8192/h);
  canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
  fit=w>h ? w*.86/(bounds.right-bounds.x) : Math.min(w*.96/(bounds.right-bounds.x),h*.48/(bounds.bottom-bounds.y));
  letteringY=h*.5-(baseline-center[1])*fit;
  const top=letteringY+(bounds.y-center[1])*fit;
  linksTop=Math.max(60,top/2);
  document.body.style.setProperty('--links-top',`${linksTop}px`);
}
addEventListener('resize', resize); resize();
async function load(item, style) {
  const info=data.letters[item.key][style], img=new Image();
  img.decoding='async';
  img.src=item.key==='€' && style==='black' ? 'assets/letters/black/euro-original.png' : info.src;
  await img.decode();
  item.variants[style]={...info,img,alpha:Uint8Array.from(atob(info.mask),c=>c.charCodeAt(0))};
}
function apply(item, style, gradient) {
  item.style=style; item.gradient=gradient; item.surface=null;
  if (gradient < 0) return;
  const v=item.variants[style], g=window.GRADIENTS[gradient];
  const surface=document.createElement('canvas'); surface.width=v.w; surface.height=v.h;
  const paint=surface.getContext('2d');
  paint.drawImage(v.img,0,0,v.w,v.h);
  // Photoshop angles run counterclockwise from the positive x axis.
  const angle=g.angle*Math.PI/180, dx=Math.cos(angle), dy=-Math.sin(angle);
  const length=(Math.abs(v.w*dx)+Math.abs(v.h*dy))*g.scale;
  const gradientFill=paint.createLinearGradient(v.w/2-dx*length/2,v.h/2-dy*length/2,v.w/2+dx*length/2,v.h/2+dy*length/2);
  g.stops.forEach(stop=>gradientFill.addColorStop(stop.offset,stop.color));
  paint.globalCompositeOperation=style==='color' ? 'color' : 'overlay';
  paint.fillStyle=gradientFill; paint.fillRect(0,0,v.w,v.h);
  // Restore the original silhouette: neither the background nor neighbours are tinted.
  paint.globalCompositeOperation='destination-in'; paint.drawImage(v.img,0,0,v.w,v.h);
  item.surface=surface;
}
function change(item) {
  if(performance.now()<waveUntil)return;
  const choices=Object.keys(item.variants).filter(s=>s!==item.style);
  if (!choices.length) return;
  const style=pick(choices); apply(item,style,nextGradient(item.cycles,style));item.pulseAt=performance.now();
}
function changeAll(direction='ltr') {
  const now=performance.now();
  if(now<waveUntil)return;
  const groups=commonFamilies(items);
  if(groups.length<2)return;
  const group=groups[(groups.indexOf(lastScrollFamily)+1)%groups.length];
  const gradients=['color','irridicent'].includes(group)?gradientSet(items.length):items.map(()=>-1);
  items.forEach((item,index)=>{
    const style=pick(options(item,group));
    if(reduce.matches){apply(item,style,gradients[index]);return;}
    item.pending={style,gradient:gradients[index],at:now+(direction==='rtl'?items.length-1-index:index)*25};
  });
  lastScrollFamily=group;
  waveUntil=reduce.matches?now:now+(items.length-1)*25+200;
}
function advanceWave(now){
  for(const item of items){
    if(item.pending&&now>=item.pending.at){
      const pending=item.pending;item.pending=null;
      item.previous={...item.variants[item.style],surface:item.surface};
      apply(item,pending.style,pending.gradient);item.transitionAt=pending.at;item.pulseAt=pending.at;
    }
    if(item.previous&&now-item.transitionAt>=100)item.previous=null;
  }
}
function paintLetter(target,item,now){
  const v=item.variants[item.style],old=item.previous;
  const t=old?easeOut(Math.max(0,Math.min(1,(now-item.transitionAt)/100))):1;
  const age=now-(item.pulseAt??-Infinity);
  const pulse=reduce.matches||age<0||age>=200?1:1+.03*(age<100?easeOut(age/100):1-easeOut((age-100)/100));
  target.save();
  const cx=v.x+v.w/2+item.x/fit,cy=v.y+v.h/2+item.y/fit;
  target.translate(cx,cy);target.scale(pulse,pulse);target.translate(-cx,-cy);
  const alpha=target.globalAlpha;
  if(old){target.globalAlpha=alpha*(1-t);target.drawImage(old.surface||old.img,old.x+item.x/fit,old.y+item.y/fit,old.w,old.h);}
  target.globalAlpha=alpha*t;target.drawImage(item.surface||v.img,v.x+item.x/fit,v.y+item.y/fit,v.w,v.h);
  target.globalAlpha=alpha;target.restore();
}

function maskHit(v,x,y) {
  const n=Math.floor(y/v.h*v.maskH)*128+Math.floor(x/v.w*128);
  return (v.alpha[n>>3]&(1<<(n%8)))!==0;
}
function hit(x,y) {
  if (!ready) return null;
  const px=(x-w/2)/fit+center[0],py=(y-letteringY)/fit+center[1];
  for (const item of [...items].reverse()) {
    const v=item.variants[item.style],ix=Math.floor(px-v.x-item.x/fit),iy=Math.floor(py-v.y-item.y/fit);
    if (ix>=0&&iy>=0&&ix<v.w&&iy<v.h&&maskHit(v,ix,iy)) return item;
  }
  return null;
}
canvas.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch') return;
  const item=hit(e.clientX,e.clientY);
  if(item!==hover){hover=item;if(item)change(item);}
  canvas.style.cursor=item?'pointer':'default';
});
canvas.addEventListener('pointerleave',()=>{hover=null;canvas.style.cursor='default';});
function gestureDirection(dx,dy){return (Math.abs(dx)>=Math.abs(dy)?dx:dy)>0?'ltr':'rtl';}
function wheelDirection(dx,dy){return Math.abs(dx)>Math.abs(dy)?(dx>0?'ltr':'rtl'):(dy>0?'rtl':'ltr');}
let gesture=null;
canvas.addEventListener('pointerdown',e=>{
  if(!ready||!e.isPrimary||e.button>0)return;
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY,item:hit(e.clientX,e.clientY),type:e.pointerType};
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerup',e=>{
  if(!gesture||gesture.id!==e.pointerId)return;
  const g=gesture;gesture=null;
  if(!ready)return;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(Math.hypot(dx,dy)>=24){if(g.type!=='mouse')changeAll(gestureDirection(dx,dy));}
  else if(g.item){if(g.type!=='mouse')change(g.item);}
  else changeBackground();
});
canvas.addEventListener('pointercancel',()=>gesture=null);
canvas.addEventListener('lostpointercapture',()=>gesture=null);
addEventListener('wheel',e=>{
  if(e.ctrlKey||!ready) return;
  e.preventDefault();
  const now=performance.now(),quiet=now-lastWheelEvent>180;lastWheelEvent=now;
  if(quiet){wheelConsumed=false;wheelDelta=0;}
  if(now<waveUntil){wheelConsumed=true;wheelDelta=0;return;}
  if(wheelConsumed)return;
  wheelDelta+=Math.max(Math.abs(e.deltaX),Math.abs(e.deltaY));
  if(wheelDelta>=24&&now-lastWheel>=70){changeAll(wheelDirection(e.deltaX,e.deltaY));lastWheel=now;wheelDelta=0;wheelConsumed=true;}
},{passive:false});
items.forEach(item=>{
  const button=document.createElement('button');
  button.textContent=`Change ${item.key==='M2'?'last M':item.key} style`;button.disabled=true;
  button.addEventListener('click',()=>change(item));
  button.addEventListener('focus',()=>focused=item);button.addEventListener('blur',()=>focused=null);
  document.querySelector('#keyboard').append(button);
});
function draw(now) {
  if(start===null) start=now;
  advanceWave(now);
  const elapsed=now-start, ease=easeOut(progress(elapsed,timeline.hold,timeline.camera));
  const iconEase=easeOut(progress(elapsed,cameraEnd,timeline.icons));
  const arrowEase=easeOut(progress(elapsed,iconsEnd,timeline.arrows));
  if((reduce.matches||elapsed>=introEnd)&&!ready){
    ready=true;nav.inert=false;document.body.classList.add('ready');
    document.querySelectorAll('#keyboard button').forEach(b=>b.disabled=false);
  }
  // Start at half the previous magnification. Snap to native or 2x source
  // density only when that stays within 20% of the requested framing.
  const desiredZoom=h/euro.w;
  const sourceWidth=items.find(item=>item.key==='€').variants.black.img.naturalWidth;
  const renderRatio=desiredZoom*euro.w*(canvas.width/w)/sourceWidth;
  const density=[.5,1].reduce((a,b)=>Math.abs(b-renderRatio)<Math.abs(a-renderRatio)?b:a);
  const initialZoom=Math.abs(density/renderRatio-1)<=.2?desiredZoom*density/renderRatio:desiredZoom;
  const zoom=2*initialZoom*(1-ease)+fit*ease, angle=(1-ease)*Math.PI/2;
  const cx=focus[0]*(1-ease)+center[0]*ease,cy=focus[1]*(1-ease)+center[1]*ease;
  ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
  const background=ctx.createLinearGradient(0,0,0,h);
  const blend=rgb=>'rgb('+rgb.join(',')+')';
  backgrounds[backgroundIndex].forEach(([position,color])=>background.addColorStop(position,blend(color)));
  ctx.fillStyle=background;ctx.fillRect(0,0,w,h);
  nav.style.opacity=String(iconEase);nav.style.visibility=iconEase>0?'visible':'hidden';
  nav.style.setProperty('--icon-travel',`${(1-iconEase)*120}px`);
  document.body.style.setProperty('--arrow-opacity',String(arrowEase));
  ctx.translate(w/2,h*.5*(1-ease)+letteringY*ease);ctx.rotate(angle);ctx.scale(zoom,zoom);ctx.translate(-cx,-cy);
  for(const item of items){
    if(ready&&!reduce.matches){
      if(now-item.driftAt>=2000){item.from=[item.x,item.y];item.to=[Math.random()*4-2,Math.random()*4-2];item.driftAt=now;}
      const k=easeOut((now-item.driftAt)/2000);
      item.x=item.from[0]+(item.to[0]-item.from[0])*k;item.y=item.from[1]+(item.to[1]-item.from[1])*k;
    }
    const v=item.variants[item.style];
    paintLetter(ctx,item,now);
    if(focused===item){ctx.strokeStyle='#999';ctx.lineWidth=1/fit;ctx.strokeRect(v.x,v.y,v.w,v.h);}
  }
  {
    // Mirror the live artwork, including the current gradient surfaces and drift.
    const height=(bounds.bottom-bounds.y)*fit;
    const reflectionTop=h-height;
    const dpr=canvas.width/w;
    const rw=canvas.width,rh=Math.ceil((height+6)*dpr);
    if(reflection.width!==rw||reflection.height!==rh){reflection.width=rw;reflection.height=rh;}
    const rc=reflectionCtx;
    rc.setTransform(dpr,0,0,dpr,0,0);rc.clearRect(0,0,w,height+6);
    rc.save();rc.translate(w/2,3);rc.scale(fit,-fit);rc.translate(-center[0],-bounds.bottom);
    for(const item of items)paintLetter(rc,item,now);
    rc.restore();
    const fade=rc.createLinearGradient(0,3,0,height+3);
    fade.addColorStop(0,'rgba(0,0,0,0.09)');fade.addColorStop(1,'rgba(0,0,0,0)');
    rc.globalCompositeOperation='destination-in';rc.fillStyle=fade;rc.fillRect(0,0,w,height+6);rc.globalCompositeOperation='source-over';
    // Reflection is part of the same world: camera rotation and zoom apply to both.
    ctx.drawImage(reflection,center[0]-w/(2*fit),center[1]+(reflectionTop-3-letteringY)/fit,w/fit,(height+6)/fit);
  }
  raf=requestAnimationFrame(draw);
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)cancelAnimationFrame(raf);
  else if(start!==null)raf=requestAnimationFrame(draw);
});
(async()=>{
  try{
    await Promise.all(items.map(i=>load(i,'black')));raf=requestAnimationFrame(draw);
    const jobs=data.styles.filter(s=>s!=='black').flatMap(s=>items.filter(i=>data.letters[i.key][s]).map(i=>()=>load(i,s)));
    await Promise.all(Array.from({length:3},async()=>{while(jobs.length){try{await jobs.shift()();}catch(e){console.warn('Style unavailable',e);}}}));
  }catch(e){document.querySelector('#error').hidden=false;console.error(e);}
})();
