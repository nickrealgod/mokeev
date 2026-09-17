// Independent floating lights.
'use strict';
window.SiteEffects=(()=>{
  let target=0,opacity=0,last=null,suppressed=false,birth=null;
  const dots=Array.from({length:9},(_,index)=>{
    const dot=document.createElement('div');dot.className='floating-dot';dot.setAttribute('aria-hidden','true');document.body.append(dot);
    return {dot,index,pulseAt:0,from:Math.random(),to:Math.random(),duration:1700+Math.random()*600,
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
      const coordinate=(i,span)=>12+Math.max(0,span-24)*(.5+.32*Math.sin(t*speeds[i]+phases[i])+.14*Math.sin(t*speeds[i+1]+phases[i+1]));
      if(now-d.pulseAt>=d.duration){d.from=d.to;d.to=Math.random();d.pulseAt=now;d.duration=1700+Math.random()*600;}
      const pulse=reduced?.4:d.from+(d.to-d.from)*smooth(Math.min(1,(now-d.pulseAt)/d.duration));
      dot.style.width=dot.style.height=(1+3*pulse)+'px';dot.style.filter='blur('+(2*pulse)+'px)';
      dot.style.transform='translate(-50%,-50%)';
      dot.style.left=(reduced?w*(.2+(d.index%3)*.3):coordinate(0,w))+'px';dot.style.top=(reduced?h*(.2+Math.floor(d.index/3)*.3):coordinate(3,h))+'px';
    }
  }
  return {showDot,hideDot,drawDot};
})();
