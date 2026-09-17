// Icon glitch adapted from the user-supplied CodeFronts CSS Text Glitch Hover Effect (MIT).
'use strict';
window.SiteEffects=(()=>{
  const dot=document.createElement('div');dot.id='floating-dot';dot.setAttribute('aria-hidden','true');document.body.append(dot);
  let target=0,opacity=0,last=null,suppressed=false,birth=null,pulseAt=0,from=0,to=Math.random();
  const phases=Array.from({length:6},()=>Math.random()*Math.PI*2);
  const speeds=Array.from({length:6},()=>.035+Math.random()*.055);
  const smooth=t=>t*t*(3-2*t);
  function showDot(letter){if(letter||!suppressed){target=1;suppressed=false;}}
  function hideDot(){target=0;suppressed=true;}
  function drawDot(now,w,h,reduced){
    const dt=last===null?0:Math.min(100,now-last);last=now;
    if(birth===null&&target)birth=now;
    opacity+=Math.sign(target-opacity)*Math.min(Math.abs(target-opacity),dt/800);
    dot.style.opacity=opacity;
    if(!opacity||birth===null)return;
    const t=(now-birth)/1000;
    const coordinate=(i,span)=>12+Math.max(0,span-24)*(.5+.32*Math.sin(t*speeds[i]+phases[i])+.14*Math.sin(t*speeds[i+1]+phases[i+1]));
    if(now-pulseAt>=2000){from=to;to=Math.random();pulseAt=now;}
    const pulse=reduced?.4:from+(to-from)*smooth(Math.min(1,(now-pulseAt)/2000));
    const diameter=1+3*pulse;
    dot.style.width=dot.style.height=diameter+'px';dot.style.filter='blur('+(2*pulse)+'px)';
    dot.style.transform='translate(-50%,-50%)';
    dot.style.left=(reduced?w*.65:coordinate(0,w))+'px';dot.style.top=(reduced?h*.35:coordinate(3,h))+'px';
  }
  document.querySelectorAll('nav a').forEach(link=>{
    const icon=link.querySelector('.icon'),img=icon.querySelector('.state-hover');
    icon.style.setProperty('--glitch-mask','url("'+img.getAttribute('src')+'")');
    const choose=()=>{const g=window.GRADIENTS[Math.floor(Math.random()*window.GRADIENTS.length)];icon.style.setProperty('--glitch-a',g.stops[0].color);icon.style.setProperty('--glitch-b',g.stops[g.stops.length-1].color);};
    choose();link.addEventListener('pointerenter',choose);link.addEventListener('focus',choose);
  });
  return {showDot,hideDot,drawDot};
})();
