/* GCSE study tiers: keep the main choice visible and preserve existing course controls. */
(() => {
 'use strict';
 const native=document.querySelector('.tier-switch[aria-label="Tier"]');
 if(native){native.classList.add('gcse-tier-buttons');return;}
 const $$=(s,r=document)=>[...r.querySelectorAll(s)], root=document.documentElement;
 let select=document.getElementById('study-tier');
 const existing=!!select, key='learn-'+window.ALP_SITE+'-study-tier';
 let controls=select?.closest('.simple-study-tier')||select?.closest('.bio-controls');
 if(!controls){controls=document.createElement('div');controls.className='lcard simple-study-tier';document.querySelector('header.top').after(controls);}
 let group=controls.querySelector('[data-study-tier]')?.parentElement;
 if(!group){
  group=document.createElement('div');group.className='gcse-tier-buttons';group.setAttribute('role','group');group.setAttribute('aria-label','Study tier');
  group.innerHTML='<button type="button" class="btn" data-study-tier="foundation">Foundation</button><button type="button" class="btn" data-study-tier="higher">Higher</button><button type="button" class="btn" data-study-tier="all">All content</button>';
  if(select){const label=select.closest('label');label?.replaceWith(group);if(!label)controls.append(group);}
  else{controls.append(group);select=document.createElement('select');select.id='study-tier';select.innerHTML='<option value="all">All content</option><option value="foundation">Foundation</option><option value="higher">Higher</option>';}
  select.hidden=true;select.setAttribute('aria-hidden','true');select.tabIndex=-1;controls.append(select);
  group.addEventListener('click',e=>{const b=e.target.closest('[data-study-tier]');if(b){select.value=b.dataset.studyTier;select.dispatchEvent(new Event('change',{bubbles:true}));}});
 }
 group.classList.add('gcse-tier-buttons');
 if(!existing){try{select.value=localStorage.getItem(key)||'all';}catch{}}
 if(!['all','foundation','higher'].includes(select.value))select.value='all';
 const pages=LAB.list;
 const higher=p=>/higher/i.test(p?.tag||'')||(/^papers:/.test(p?.group||'')&&/higher/i.test(p.group+' '+p.name));
 const foundation=p=>/^papers:/.test(p?.group||'')&&/foundation/i.test(p.group+' '+p.name);
 const previousHide=window.LAB_HIDE;
 window.LAB_HIDE=p=>(previousHide?.(p)||false)||(select.value==='foundation'&&higher(p))||(select.value==='higher'&&foundation(p));
 window.TIER_HID=el=>select.value==='foundation'&&!!el?.closest('.gcse-higher-only');
 // Mark bounded content blocks, never a whole mixed lesson or a whole mixed question.
 function mark(){
  $$('.htbox,.hi-only').forEach(n=>n.classList.add('gcse-higher-only'));
  $$('.qi').forEach(n=>{if(n.querySelector('.ht')||/\(Higher\)|^\s*Higher\b/i.test(n.querySelector('.qq')?.textContent||''))n.classList.add('gcse-higher-only');});
  $$('.xp').forEach(n=>{if(n.querySelector('.xpq .ht'))n.classList.add('gcse-higher-only');});
  $$('.lcard.hw,.tech').forEach(n=>{if(n.querySelector('h3 .ht,h4 .ht'))n.classList.add('gcse-higher-only');});
  $$('.xq').forEach(n=>{const parts=$$('.xp',n);if(parts.length&&parts.every(p=>p.classList.contains('gcse-higher-only')))n.classList.add('gcse-higher-only');});
  $$('.lsec li').forEach(li=>{if(li.querySelector('.ht')&&!li.querySelector('.gcse-higher-only')){
   const badge=li.querySelector('.ht');if(badge.parentElement===li){const span=document.createElement('span');span.className='gcse-higher-only';li.insertBefore(span,badge);while(span.nextSibling)span.append(span.nextSibling);}
  }});
 }
 function apply(){
  root.dataset.studyTier=select.value;
  window.TIER=select.value==='foundation'?'f':select.value==='higher'?'h':'a';
  $$('[data-study-tier]',group).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.studyTier===select.value)));
  mark();
  $$('.prac[data-id]').forEach(b=>{const p=pages.find(p=>p.id===b.dataset.id);b.classList.toggle('gcse-tier-excluded',!!p&&window.LAB_HIDE(p));});
  $$('.navgroup').forEach(g=>g.classList.toggle('gcse-tier-empty',!!g.querySelector('.prac')&&$$('.prac',g).every(b=>b.classList.contains('gcse-tier-excluded'))));
  const page=pages.find(p=>p.id===location.hash.slice(1));
  if(page&&window.LAB_HIDE(page)){
   const unit=(window.HUB_UNITS||[]).find(u=>u.groups.some(([g])=>g===page.group));
   history.replaceState(null,'','#'+(unit?'u-'+unit.key:''));LAB.reroute?.();
  }
  if(document.body.classList.contains('in-prac'))LAB.refreshNav?.();
  if(!existing)try{localStorage.setItem(key,select.value);}catch{}
  window.dispatchEvent(new Event('prodigy-tier-change'));
 }
 function refreshScores(){
  if(existing)return;
  Object.keys(EXAM.CARDS).forEach(id=>{if(document.getElementById(id))EXAM.refresh(id);});
  Object.keys(LEARN.QZ).forEach(id=>{
   const qs=LEARN.QZ[id],visible=(_,i)=>!window.TIER_HID(document.querySelector(`[data-q="${id}-${i}"]`));
   const out=document.getElementById(id+'-score');
   if(out)out.textContent=qs.filter((q,i)=>visible(q,i)&&LEARN.STATE[`${id}-${i}`]==='ok').length+' / '+qs.filter(visible).length+' correct';
  });
 }
 select.addEventListener('change',()=>{apply();refreshScores();});
 window.addEventListener('hashchange',apply);window.addEventListener('popstate',apply);
 document.addEventListener('click',e=>{if(e.target.closest('[data-go],.prac'))queueMicrotask(apply);});
 // Written-answer cards redraw after marking. Only watch new nodes, not our class changes.
 new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes.length))mark();}).observe(document.querySelector('.wrap'),{childList:true,subtree:true});
 apply();refreshScores();
})();
