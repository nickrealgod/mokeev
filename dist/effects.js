// Independent floating lights.
'use strict';
window.SiteEffects=(()=>{
  let target=0,opacity=0,last=null,suppressed=false,birth=null;
  const colors=['#FFF8F2','#FEFBDA','#FFF7F6','#F1FEED','#F9F9FE','#F7FAFE',...Array(6).fill('#FFFFFF'),'#F5B234','#7600FF','#0082FF','#FFEC00','#64FF00','#FF0040'];
  const dots=colors.map((color,index)=>{
    const dot=document.createElement('div');dot.className='floating-dot';dot.setAttribute('aria-hidden','true');dot.style.background=color;document.body.append(dot);
    return {dot,index,x:Math.random(),y:Math.random(),pulseAt:0,from:Math.random(),to:Math.random(),duration:1700+Math.random()*600,
      phases:Array.from({length:6},()=>Math.random()*Math.PI*2),speeds:Array.from({length:6},()=>.035+Math.random()*.055)};
  });
  const smooth=t=>t*t*(3-2*t);
  function showDot(letter){if(letter||!suppressed){target=1;suppressed=false;}}
  function hideDot(){target=0;suppressed=true;}
  function drawDot(now,w,h,reduced){
    const dt=last===null?0:Math.min(100,now-last);last=now;
    if(birth===null&&target)birth=now;
    opacity+=Math.sign(target-opacity)*Math.min(Math.abs(target-opacity),dt/800);
    for(const d of dots){
      const {dot,phases,speeds}=d;dot.style.opacity=opacity;
      if(!opacity||birth===null)continue;
      const t=(now-birth)/1000;
      // Smooth wandering velocity, with stronger upward/rightward components.
      const vx=10*Math.sin(t*speeds[0]+phases[0])+5*Math.sin(t*speeds[1]+phases[1]);
      const vy=10*Math.sin(t*speeds[3]+phases[3])+5*Math.sin(t*speeds[4]+phases[4]);
      if(!reduced){
        d.x+=(vx>0?vx*(1+1.62):vx)*dt/1000/w;
        d.y+=(vy<0?vy*(1+2.62):vy)*dt/1000/h;
        // Re-enter inside the opposite edge in the same frame, preserving color/count.
        if(d.x<0)d.x=.99;else if(d.x>1)d.x=.01;
        if(d.y<0)d.y=.99;else if(d.y>1)d.y=.01;
      }
      if(now-d.pulseAt>=d.duration){d.from=d.to;d.to=Math.random();d.pulseAt=now;d.duration=1700+Math.random()*600;}
      const pulse=reduced?.4:d.from+(d.to-d.from)*smooth(Math.min(1,(now-d.pulseAt)/d.duration));
      dot.style.width=dot.style.height=(1+3*pulse)+'px';dot.style.filter='blur('+(2*pulse)+'px)';
      dot.style.transform='translate(-50%,-50%)';
      dot.style.left=(12+Math.max(0,w-24)*d.x)+'px';dot.style.top=(12+Math.max(0,h-24)*d.y)+'px';
    }
  }
  let offset=0,velocity=0,kick=0,kickAt=-Infinity,scrollAt=null;
  function scrollImpulse(delta){kick=-Math.sign(delta)*Math.min(20,5+Math.abs(delta)*.075);kickAt=performance.now();}
  function scrollOffset(now,reduced){
    const dt=scrollAt===null?0:Math.min(.032,(now-scrollAt)/1000);scrollAt=now;
    if(reduced){offset=velocity=0;return 0;}
    const goal=now-kickAt<140?kick:0;
    velocity+=(400*(goal-offset)-40*velocity)*dt;offset+=velocity*dt;
    return offset;
  }
  return {showDot,hideDot,drawDot,scrollImpulse,scrollOffset};
})();
