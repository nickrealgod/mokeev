'use strict';
window.Variations = (() => {
  const family = style => style === 'alt' ? 'play' : style;
  const pick = list => list[Math.floor(Math.random() * list.length)];
  // Five different gradients, then the unchanged source, in every six-choice cycle.
  function nextGradient(cycles, style) {
    if (!['color', 'irridicent'].includes(style)) return -1;
    const cycle = cycles[style] || (cycles[style] = { count: 0, remaining: [] });
    if (cycle.count++ % 6 === 5) return -1;
    if (!cycle.remaining.length) cycle.remaining = [0, 1, 2, 3, 4];
    return cycle.remaining.splice(Math.floor(Math.random() * cycle.remaining.length), 1)[0];
  }
  function options(item, group) {
    return Object.keys(item.variants).filter(style => family(style) === group);
  }
  function commonFamilies(items) {
    return ['white', 'black', 'silver', 'color', 'irridicent', 'play']
      .filter(group => items.every(item => options(item, group).length));
  }
  function gradientSet(count) {
    const pairs=[];
    for(let i=0;i<count;i++)for(let j=i+2;j<count;j++)pairs.push([i,j]);
    const bare=pairs.length?pick(pairs):(count?[0]:[]);
    const result=[];
    for(let i=0;i<count;i++) {
      result.push(bare.includes(i) ? -1 : pick([0,1,2,3,4].filter(g=>g!==result[i-1])));
    }
    return result;
  }
  return { family, pick, nextGradient, options, commonFamilies, gradientSet };
})();
