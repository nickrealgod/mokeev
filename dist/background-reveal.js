'use strict';
// One small cached radial patch; no fullscreen masks, blur filters or extra animation loop.
window.BackgroundReveal=(()=>{
  const radius=128,size=256,patch=document.createElement('canvas'),mask=document.createElement('canvas');
  patch.width=patch.height=mask.width=mask.height=size;
  const paint=patch.getContext('2d'),maskPaint=mask.getContext('2d');
  const gradient=maskPaint.createRadialGradient(radius,radius,0,radius,radius,radius);
  gradient.addColorStop(0,'rgba(0,0,0,1)');gradient.addColorStop(.18,'rgba(0,0,0,1)');gradient.addColorStop(1,'rgba(0,0,0,0)');
  maskPaint.fillStyle=gradient;maskPaint.fillRect(0,0,size,size);
  let x=0,y=0,inside=false,dirty=true,enabled=true,alpha=0,from=0,target=0,at=0,lastFrame=null,baseline=16.7,slowFrames=0,lastPlacement='';
  let draws=0,totalMs=0,maxMs=0;
  function move(event){if(event.pointerType==='mouse'){x=event.clientX;y=event.clientY;inside=true;dirty=true;}}
  addEventListener('pointermove',move,{passive:true});
  addEventListener('pointerout',event=>{if(!event.relatedTarget)inside=false;});
  addEventListener('blur',()=>{inside=false;lastFrame=null;});
  document.addEventListener('visibilitychange',()=>{inside=false;lastFrame=null;});
  function update(now,allowed){
    const desired=enabled&&allowed&&inside?1:0;
    if(desired!==target){from=alpha;target=desired;at=now;}
    const t=Math.min(1,Math.max(0,(now-at)/(target?180:350)));
    alpha=from+(target-from)*(1-(1-t)**3);
    if(lastFrame!==null){
      const dt=now-lastFrame;
      if(dt>0&&dt<100){
        if(alpha===0)baseline=baseline*.95+dt*.05;
        else if(dt>Math.max(28,baseline*1.4))slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
        if(slowFrames>=45){enabled=false;inside=false;}
      }
    }
    lastFrame=now;
  }
  function draw(ctx,image,placement){
    if(alpha<=0)return;
    const begin=performance.now();
    const key=[placement.x,placement.y,placement.width,placement.height].join(',');
    if(dirty||key!==lastPlacement){
      const scale=placement.width/image.naturalWidth;
      paint.clearRect(0,0,size,size);paint.globalCompositeOperation='source-over';
      paint.drawImage(image,(x-radius-placement.x)/scale,(y-radius-placement.y)/scale,size/scale,size/scale,0,0,size,size);
      paint.globalCompositeOperation='destination-in';paint.drawImage(mask,0,0);paint.globalCompositeOperation='source-over';
      dirty=false;lastPlacement=key;
    }
    const originalAlpha=ctx.globalAlpha;ctx.globalAlpha*=alpha;ctx.drawImage(patch,x-radius,y-radius,size,size);ctx.globalAlpha=originalAlpha;
    const duration=performance.now()-begin;draws++;totalMs+=duration;maxMs=Math.max(maxMs,duration);
    if(draws===120&&window.location?.hostname==='127.0.0.1')console.info('Cursor reveal local sample: '+JSON.stringify({averageMs:totalMs/draws,maxMs,slowFrames,enabled}));
    if(draws>=30&&totalMs/draws>2){enabled=false;inside=false;}
  }
  function warm(image){paint.drawImage(image,0,0,size,size);paint.clearRect(0,0,size,size);dirty=true;}
  return {warm,update,draw,stats:()=>({enabled,draws,averageMs:draws?totalMs/draws:0,maxMs,slowFrames,alpha})};
})();
