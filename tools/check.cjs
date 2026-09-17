const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'../dist');
const sandbox={window:{},Math};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(root+'/variations.js','utf8'),sandbox);
const V=sandbox.window.Variations;
for(const style of ['color','irridicent']){
 const cycles={};
 for(let round=0;round<10;round++){
  const six=Array.from({length:6},()=>V.nextGradient(cycles,style));
  assert.equal(new Set(six.slice(0,5)).size,5);assert.equal(six[5],-1);
 }
}
vm.runInContext(fs.readFileSync(root+'/letters.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync(root+'/gradients.js','utf8'),sandbox);
const items=Object.entries(sandbox.window.LETTERS.letters).map(([key,variants])=>({key,variants}));
assert.equal(V.commonFamilies(items).length,6);
for(const item of items){assert(V.options(item,'play').includes('play'));if(item.variants.alt)assert(V.options(item,'play').includes('alt'));}
assert.equal(sandbox.window.GRADIENTS.length,5);
for(const g of sandbox.window.GRADIENTS){assert.equal(g.angle,48);assert.equal(g.scale,.91);}
for(const item of items)for(const v of Object.values(item.variants))assert(fs.existsSync(root+'/'+v.src));
assert(fs.existsSync(root+'/assets/letters/black/euro-original.png'));
console.log('PASS: 20 six-step gradient cycles; five distinct gradients then unchanged; six shared scroll families; Alt/Play coverage; palette geometry; all assets.');

for(let i=0;i<1000;i++) {const set=V.gradientSet(10);assert.equal(set.filter(g=>g===-1).length,2);assert(set.every((g,j)=>j===0||g!==set[j-1]));}
console.log('PASS: 1,000 scroll palettes, exactly two bare letters, no adjacent matching gradients.');
// Exercise the real touch handlers without a browser or network.
const source=fs.readFileSync(root+'/app.js','utf8');
const handlers={};
const gestureBlock=source.slice(source.indexOf('function gestureDirection('),source.indexOf("addEventListener('wheel'"));
const touch={ready:true, canvas:{addEventListener:(type,fn)=>handlers[type]=fn,setPointerCapture:()=>{}}, hit:()=>null,changeAll:direction=>touch.directions.push(direction),changeBackground:()=>touch.backgrounds++,change:()=>touch.letters++,directions:[],backgrounds:0,letters:0,Math};
vm.createContext(touch);vm.runInContext(gestureBlock,touch);
const event=(x,y)=>({pointerId:1,pointerType:'touch',isPrimary:true,clientX:x,clientY:y});
handlers.pointerdown(event(10,10));handlers.pointerup(event(10,10));assert.equal(touch.backgrounds,1);assert.equal(touch.directions.length,0);
for(const [x,y] of [[100,10],[-100,10],[10,100],[10,-100]]){handlers.pointerdown(event(10,10));handlers.pointerup(event(x,y));}
assert.deepEqual(touch.directions,["ltr","rtl","ltr","rtl"]);
touch.hit=()=>({key:'M'});handlers.pointerdown(event(10,10));handlers.pointerup(event(10,10));assert.equal(touch.letters,1);
handlers.pointerdown(event(10,10));handlers.pointercancel();handlers.pointerup(event(100,100));assert.deepEqual(touch.directions,["ltr","rtl","ltr","rtl"]);
console.log('PASS: background tap, four swipe directions, single-letter tap, gesture cancellation.');

const wave={window:{SiteEffects:{showDot:()=>{}}},performance:{now:()=>wave.now},now:1000,waveUntil:0,queuedWave:null,lastScrollFamily:'white',scrollCycleIndex:1,reduce:{matches:false},items:Array.from({length:10},()=>({style:'white',variants:{white:{},black:{}}})),commonFamilies:()=>['white','black'],pick:a=>a[0],options:()=>['black'],gradientSet:()=>[],apply:(item,style)=>item.style=style};
vm.createContext(wave);vm.runInContext(source.slice(source.indexOf('function changeAll('),source.indexOf('function paintLetter(')),wave);
wave.changeAll('rtl');assert.equal(wave.items[9].pending.at,1000);assert.equal(wave.items[0].pending.at,1225);assert.equal(wave.waveUntil,1425);
wave.advanceWave(1000);assert.equal(wave.items[9].style,'black');assert.equal(wave.items[8].style,'white');
wave.advanceWave(1100);assert.equal(wave.items[9].previous,null);
wave.now=1600;wave.advanceWave(1600);wave.changeAll('ltr');assert.equal(wave.items[0].pending.at,1600);assert.equal(wave.items[9].pending.at,1825);
console.log('PASS: directional 25ms stagger, 100ms transitions, background taps leave letters unchanged.');

wave.now=1650;const before=wave.items[9].pending.at;wave.changeAll("rtl");assert.equal(wave.items[9].pending.at,before);assert.equal(wave.queuedWave,null);console.log("PASS: repeated gestures during transition are ignored.");

assert.equal(touch.gestureDirection(100,5),'ltr');assert.equal(touch.gestureDirection(-100,5),'rtl');
assert.equal(touch.wheelDirection(100,5),'ltr');assert.equal(touch.wheelDirection(-100,5),'rtl');
assert.equal(touch.wheelDirection(2,100),'rtl');assert.equal(touch.wheelDirection(2,-100),'ltr');
console.log('PASS: horizontal trackpad gestures dominate vertical jitter, opposite swipes have opposite directions.');
