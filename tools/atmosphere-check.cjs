const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const nodes=[],classes=new Set();
let seed=71823;const seededMath=Object.create(Math);seededMath.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const context2d=()=>new Proxy({globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:()=>{}});
function node(){const n={width:0,height:0,style:{setProperty(k,v){this[k]=v;}},classList:{add:k=>classes.add(k),toggle(k,on){if(on)classes.add(k);else classes.delete(k);}},setAttribute(){},getAttribute:()=>'',append(){},addEventListener(){},querySelectorAll:()=>[],getContext:()=>context2d()};nodes.push(n);return n;}
const stage=node(),nav=node(),body=node(),html=node(),theme=node(),keyboard=node(),error=node();
const selectors={'#stage':stage,nav,'#keyboard':keyboard,'#error':error,'meta[name="theme-color"]':theme};
const sandbox={window:{},document:{body,documentElement:html,createElement:node,querySelector:s=>selectors[s],querySelectorAll:()=>[],addEventListener(){}},Image:class {constructor(){this.naturalWidth=2000;this.naturalHeight=1000;}decode(){return Promise.resolve();}},matchMedia:()=>({matches:false}),innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},performance:{now:()=>0},atob:s=>Buffer.from(s,'base64').toString('binary'),console,Math:seededMath};
vm.createContext(sandbox);for(const file of ['letters','gradients','variations','effects','app'])vm.runInContext(fs.readFileSync(path.join(root,file+'.js'),'utf8'),sandbox);
const run=s=>vm.runInContext(s,sandbox);
(async()=>{
  await new Promise(resolve=>setImmediate(resolve));
  run('draw(0);draw(9999)');assert.equal(run('backgroundIndex'),0);
  run('draw(10000)');assert.equal(run('backgroundIndex'),4);assert(run('backgroundTransition!==null'));
  run('draw(10125)');assert(run('backgroundTransition!==null'));
  run('draw(10250)');assert.equal(run('backgroundTransition'),null);
  run('draw(20000)');assert.equal(run('backgroundIndex'),5);
  run('changeBackground(1)');assert.equal(run('autoBackground'),false);assert.equal(run('backgroundIndex'),6);
  run('draw(45000)');assert.equal(run('backgroundIndex'),6);
  run('changeBackground(2);draw(45016)');assert.equal(run('backgroundIndex'),0);assert.equal(run('backgroundOrder[backgroundIndex]'),7);assert.match(html.style['--page-background'],/Background.jpg/);
  run('draw(60000);draw(60050);draw(60100)');assert(!classes.has('flash-active'));
  assert.equal(run('timeline.hold'),1500);assert.equal(run('cameraEnd'),4500);assert.equal(run('introEnd'),7500);
  assert.equal(run('items[0].variants.black.img===items[9].variants.black.img'),true);
  console.log('PASS: doubled intro, automatic changes at 10s, 250ms transition, manual cancellation, initial original photograph, no flash, shared images.');
  const dots=nodes.filter(n=>n.className?.startsWith('floating-dot'));assert.equal(dots.length,19);
  const e=sandbox.window.SiteEffects;e.showDot(true);
  let previous=[],respawns=0,sawOutside=false,largeColors=new Set();
  for(let now=61000;now<181000;now+=16){
    e.drawDot(now,390,844,false);
    dots.forEach((d,i)=>{
      const match=d.style.transform?.match(/translate3d\(([-.\d]+)px,([-.\d]+)px/);if(!match)return;
      const x=+match[1],y=+match[2],opacity=+d.style.opacity;
      assert(Number.isFinite(x+y+opacity));if(x<0||x>390||y<0||y>844)sawOutside=true;
      const prev=previous[i];
      if(prev&&Math.hypot(x-prev.x,y-prev.y)>40){assert.equal(opacity,0,'Respawn must start invisible');respawns++;}
      previous[i]={x,y};
    });
    largeColors.add(dots[18].style.background);
  }
  assert(sawOutside);assert(respawns>0);assert(largeColors.size>1);
  e.hideDot();for(let now=181000;now<182000;now+=16)e.drawDot(now,390,844,false);assert(dots.every(d=>+d.style.opacity===0));
  console.log('PASS: 19 particles cross real edges, respawn invisibly, large light changes color, all fade out.');
})().catch(error=>{console.error(error);process.exitCode=1;});
