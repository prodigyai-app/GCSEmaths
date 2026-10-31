/* Size desktop home choices to the viewport; keep routing and lesson content intact. */
(() => {
  'use strict';
  const hub=document.getElementById('hub'),grid=document.getElementById('hub-cards');
  if(!hub||!grid)return;
  const desktop=matchMedia('(min-width:960px)');
  let queued=false;
  const visible=el=>!el.hidden&&getComputedStyle(el).display!=='none';
  function size(){
    queued=false;
    if(!desktop.matches||hub.hidden||!hub.getClientRects().length){grid.classList.remove('desktop-unit-grid');return;}
    const groups=[...grid.querySelectorAll(':scope > .combined-subject')];
    const available=Math.max(300,innerHeight-(grid.getBoundingClientRect().top+scrollY)-48);
    if(groups.length){
      const height=Math.max(available,...groups.map(g=>{
        const count=[...g.querySelectorAll('.unit')].filter(visible).length;
        return g.querySelector('h2').getBoundingClientRect().height+26+count*64+Math.max(0,count-1)*10;
      }));
      grid.style.setProperty('--unit-grid-height',Math.ceil(height)+'px');
      grid.classList.add('desktop-subject-grid');return;
    }
    const cards=[...grid.querySelectorAll(':scope > .unit')].filter(visible),n=cards.length;
    if(!n)return;
    const width=grid.getBoundingClientRect().width,gap=14,max=Math.min(n,6,Math.max(1,Math.floor((width+gap)/254)));
    let columns=1,score=Infinity;
    for(let c=1;c<=max;c++){
      const rows=Math.ceil(n/c),cellWidth=(width-gap*(c-1))/c,cellHeight=(available-gap*(rows-1))/rows;
      const value=Math.abs(Math.log(cellWidth/Math.max(104,cellHeight)/2.4))+(rows*c-n)/(rows*c)*0.2;
      if(value<score){columns=c;score=value;}
    }
    const rows=Math.ceil(n/columns),last=n%columns||columns,tracks=columns*last;
    grid.style.setProperty('--unit-grid-columns',tracks);
    grid.style.setProperty('--unit-grid-height',Math.ceil(Math.max(available,rows*104+(rows-1)*gap))+'px');
    for(let i=0;i<n;i++)cards[i].style.setProperty('--unit-span',i>=n-last?columns:last);
    grid.classList.add('desktop-unit-grid');
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(size);}}
  new MutationObserver(schedule).observe(hub,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  addEventListener('resize',schedule);addEventListener('hashchange',schedule);
  document.addEventListener('click',schedule);document.addEventListener('change',schedule);
  document.fonts?.ready.then(schedule);schedule();
})();
