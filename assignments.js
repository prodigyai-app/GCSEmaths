(()=>{
"use strict";
const {SITES,clone,esc,londonDate,statusOf,pageURL,contextForPage,requiredQuestions,answered,answerText,summaryOf}=window.ProdigyAssessment;

const lab=window.LAB,exam=window.EXAM,accounts=window.ALP_ACCOUNTS,site=window.ALP_SITE;
if(lab&&exam&&SITES[site]) initialise();
function initialise(){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],storage=lab.store;
 const user=()=>accounts?.user,teacher=()=>accounts?.profile?.role==='teacher';
 let service=null,catalog=null,active=null,activeSubmission=null,activeQuestions=[],restoredId=null,saveTimer=null,saveChain=Promise.resolve(),lastAccount=null,requesting=false;
 const query=new URLSearchParams(location.search),assignmentId=query.get('assignment');
 const head=$('header.top .top-actions')||$('header.top');
 const openButton=document.createElement('button');openButton.className='btn';openButton.textContent='Assignments';head?.append(openButton);
 const dialog=document.createElement('dialog');dialog.className='platform-dialog';dialog.setAttribute('aria-label','Assignments');document.body.append(dialog);
 const sourceName=s=>({ai:'AI-suggested · provisional',automatic:'Automatically marked',self:'Self-marked',teacher:'Teacher reviewed','numeric-check':'Final value check'})[s]||'Not marked';
 const dateLabel=s=>new Date(s+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
 function modal(title,html){dialog.innerHTML=`<header><h2>${esc(title)}</h2><button class="btn" data-close aria-label="Close assignments">Close</button></header><div class="platform-error" role="alert"></div>${html}`;if(!dialog.open)dialog.showModal();}
 const message=e=>{const out=dialog.querySelector('.platform-error');if(out)out.textContent=e.message||String(e);};
 function requireUser(){if(user())return true;accounts?.openSignIn?.();return false;}
 async function api(action,data={},timeout=20000){
  if(!user())throw Error('Sign in to use assignments and AI marking.');
  const {data:{session}}=await accounts.sb.auth.getSession();if(!session)throw Error('Sign in again to continue.');
  const cfg=window.ALP_CONFIG,r=await fetch(cfg.url+'/functions/v1/learning-platform',{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.key,Authorization:'Bearer '+session.access_token},body:JSON.stringify({action,...data}),signal:AbortSignal.timeout(timeout)});
  let body;try{body=await r.json();}catch{throw Error('The shared learning service is not available yet. Your local answers and self-marking are unchanged.');}
  if(!r.ok||body.error)throw Error(body.error||'The shared learning service is not available yet. Your local answers and self-marking are unchanged.');return body;
 }
 async function getCatalog(target=site){if(target===site&&catalog)return catalog;const r=await fetch(target===site?'assessment-catalog.json':'https://prodigyai-app.github.io/'+SITES[target][1]+'/assessment-catalog.json');if(!r.ok)throw Error('The lesson catalogue is not available yet.');const c=await r.json();if(target===site)catalog=c;return c;}
 function context(){const c={};if(window.TIER)c.tier=window.TIER;if(window.PSY_SELECTION)for(const n of [1,2,3])c['option'+n]=window.PSY_SELECTION[n];if($('#essay-plan-topic'))c.essay=$('#essay-plan-topic').value;return c;}
 function currentPage(){return location.hash.slice(1);}
 function button(parent,text,handler){const b=document.createElement('button');b.className='btn';b.type='button';b.textContent=text;b.addEventListener('click',handler);parent.append(b);return b;}
 function repaint(){
  $$('.lab > .assignment-actions').forEach(e=>e.remove());
  $$('.ai-feedback').forEach(e=>e.remove());
  for(const sec of $$('.lab[id^="lab-"]')){
   const id=sec.id.slice(4);if(!lab.list.some(p=>p.id===id))continue;
   if(teacher()){const bar=document.createElement('div');bar.className='assignment-actions';button(bar,'Assign this lesson or paper',()=>openCreate(id));sec.querySelector('.lab-head')?.after(bar);}
  }
  decorate();paintActive();
 }
 async function accountChanged(){const id=user()?.id||'',signature=id+':'+(accounts?.profile?.role||'');if(signature===lastAccount)return;lastAccount=signature;service=null;restoredId=null;
  if(id){try{service=await api('status');}catch{}if(assignmentId)await loadActive();}repaint();
 }
 openButton.onclick=()=>{if(requireUser())openList();};
 document.addEventListener('click',e=>{if(e.target.closest('[data-platform-assignments]')&&requireUser())openList();});
 dialog.addEventListener('click',e=>{if(e.target.closest('[data-close]'))dialog.close();});
 async function openList(){
  modal(teacher()?'Class assignments':'My assignments','<p>Loading…</p>');
  try{const data=await api('list');modal(teacher()?'Class assignments':'My assignments',`<div class="assignment-actions">${teacher()?'<button class="btn primary" data-new>New assignment</button>':''}<label>Subject <select data-filter><option value="">All subjects</option>${Object.entries(SITES).map(([id,[name]])=>`<option value="${id}">${esc(name)}</option>`).join('')}</select></label><button class="btn" data-refresh>Refresh</button></div><div class="platform-list" data-list></div>`);
   const draw=()=>{const filter=dialog.querySelector('[data-filter]').value,items=data.assignments.filter(a=>!filter||a.site===filter);dialog.querySelector('[data-list]').innerHTML=items.length?items.map(a=>`<article class="platform-item"><h3>${esc(a.title)}</h3><p>${esc(SITES[a.site][0])} · Due ${dateLabel(a.due_date)}${teacher()?` · ${a.completed}/${a.total} completed`:` · <b>${statusOf(a,a.submission)}</b>`}</p>${a.instructions?`<p>${esc(a.instructions)}</p>`:''}<button class="btn primary" data-detail="${a.id}">${teacher()?'View students and marks':'View assignment'}</button></article>`).join(''):'<p>No assignments to show.</p>';};draw();
   dialog.querySelector('[data-filter]').onchange=draw;dialog.querySelector('[data-refresh]').onclick=openList;dialog.querySelector('[data-new]')?.addEventListener('click',()=>openCreate());dialog.querySelector('[data-list]').onclick=e=>{const id=e.target.closest('[data-detail]')?.dataset.detail;if(id)openDetail(id);};
  }catch(e){modal('Assignments','<p>Your existing lessons, papers and self-marking remain available.</p><button class="btn" data-retry>Try again</button>');message(e);dialog.querySelector('[data-retry]').onclick=openList;}
 }
 async function openCreate(pageId){
  if(!requireUser()||!teacher())return;
  modal('Set an assignment','<p>Loading your classes and lessons…</p>');
  try{const [{classes},cat]=await Promise.all([api('classes'),getCatalog()]);
   if(!classes.length){modal('Set an assignment','<p>Create a class in the existing Teacher dashboard first. You can then assign work to the class or individual members.</p>');return;}
   let currentCat=cat;
   modal('Set an assignment',`<form data-create><div class="platform-row"><label>Subject<select name="site">${Object.entries(SITES).map(([id,[name]])=>`<option value="${id}" ${id===site?'selected':''}>${esc(name)}</option>`).join('')}</select></label><label>Class<select name="class_id">${classes.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(SITES[c.site]?.[0]||'')}</option>`).join('')}</select></label></div><label>Find a lesson or paper<input name="search" type="search" placeholder="Type a topic or paper title"></label><label>Lesson or paper<select name="page_id" required></select></label><div data-context></div><div class="platform-row"><label>Assign to<select name="audience"><option value="class">Whole class</option><option value="students">Selected students</option></select></label><label>Due date<input name="due_date" type="date" required min="${londonDate()}"></label></div><label data-students hidden>Students<select name="students" multiple></select><span class="assignment-status">Select one or more students.</span></label><label>Instructions (optional)<textarea name="instructions" maxlength="2000" rows="3"></textarea></label><label>Marking<select name="marking_mode"><option value="review">Automatic marking with teacher review</option><option value="automatic">Automatic marking and provisional AI feedback</option></select></label><p class="assignment-status">Due by the end of the selected date (UK time). Longer answers use self-marking whenever AI marking is unavailable.</p><button class="btn primary" type="submit">Set assignment</button></form>`);
   const f=dialog.querySelector('form'),fields=f.elements;let recipients=[];
   const drawContext=()=>{const page=currentCat.pages[fields.page_id.value],slot=f.querySelector('[data-context]');slot.replaceChildren();if(!page)return;
    if(page.essays){slot.innerHTML=`<label>Essay topic<select name="essay">${page.essays.map(id=>`<option value="${id}">${esc(id.replaceAll('-',' '))}</option>`).join('')}</select></label>`;if(fields.essay&&page.essays.includes(context().essay))fields.essay.value=context().essay;}
    if(fields.site.value==='gcse-maths')slot.insertAdjacentHTML('beforeend','<label>Tier<select name="tier"><option value="f">Foundation</option><option value="h">Higher</option></select></label>');if(fields.tier){fields.tier.value=page.tier||context().tier||'h';fields.tier.disabled=!!page.tier;}
   };
   const drawPages=()=>{const term=fields.search.value.toLowerCase(),previous=fields.page_id.value;fields.page_id.innerHTML=Object.values(currentCat.pages).filter(p=>(p.title+' '+Object.values(p.selection||{}).join(' ')).toLowerCase().includes(term)).map(p=>`<option value="${p.id}">${p.type==='paper'?'Paper':'Lesson'} · ${esc(p.title)}${p.selection?' · '+Object.values(p.selection).join(' / '):''}</option>`).join('');if(currentCat.pages[previous]&&[...fields.page_id.options].some(o=>o.value===previous))fields.page_id.value=previous;drawContext();};
   drawPages();if(pageId&&currentCat.pages[pageId]){fields.page_id.value=pageId;drawContext();}
   const loadRoster=async()=>{const data=await api('roster',{class_id:fields.class_id.value});recipients=data.students;fields.students.innerHTML=recipients.map(s=>`<option value="${s.id}">${esc(s.display_name||s.username)} (${esc(s.username)})</option>`).join('');};await loadRoster();
   fields.class_id.onchange=()=>loadRoster().catch(message);fields.audience.onchange=()=>f.querySelector('[data-students]').hidden=fields.audience.value!=='students';fields.search.oninput=drawPages;fields.page_id.onchange=drawContext;
   fields.site.onchange=async()=>{try{currentCat=await getCatalog(fields.site.value);drawPages();}catch(e){message(e);}};
   f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('[type=submit]');b.disabled=true;try{
    const page=currentCat.pages[fields.page_id.value];if(!page)throw Error('Choose a lesson or paper');const c=contextForPage(page,{...context(),essay:fields.essay?.value,tier:fields.tier?.value});
    const ids=fields.audience.value==='class'?null:[...fields.students.selectedOptions].map(x=>x.value);if(ids&& !ids.length)throw Error('Choose at least one student');
    const data=await api('create',{site:fields.site.value,page_id:page.id,class_id:fields.class_id.value,recipient_ids:ids,due_date:fields.due_date.value,instructions:fields.instructions.value,context:c,marking_mode:fields.marking_mode.value});await openDetail(data.assignment.id);
   }catch(e){message(e);}finally{b.disabled=false;}};
  }catch(e){message(e);}
 }
 async function openDetail(id){
  modal('Assignment','<p>Loading…</p>');try{const data=await api('detail',{id}),a=data.assignment;
   modal(a.title,`<p>${esc(SITES[a.site][0])} · Due ${dateLabel(a.due_date)} · End of day, UK time</p>${a.instructions?`<p>${esc(a.instructions)}</p>`:''}<div class="assignment-actions"><button class="btn" data-back>All assignments</button><a class="btn primary" href="${esc(pageURL(a))}">Open ${data.questions.length?'work':'lesson'}</a></div>${data.students?`<details><summary>Edit assignment</summary><form data-edit><label>Due date<input name="due_date" type="date" required value="${a.due_date}"></label><label>Instructions<textarea name="instructions" maxlength="2000">${esc(a.instructions)}</textarea></label><button class="btn" type="submit">Save changes</button><button class="btn" type="button" data-archive>Archive assignment</button></form></details><div class="platform-list" data-students></div>`:`<p><b>${statusOf(a,data.submission)}</b></p><div data-results></div>`}`);
   dialog.querySelector('[data-back]').onclick=openList;
   if(data.students){
    dialog.querySelector('[data-students]').innerHTML=data.students.map(s=>{const summary=s.submission?summaryOf(data.questions,s.submission.answers,s.submission.marks,s.submission.teacher_reviews):null;return `<article class="platform-item platform-student"><div><b>${esc(s.display_name||s.username)}</b><p>${statusOf(a,s.submission)}${summary?` · ${summary.score}/${summary.max} marks recorded · ${summary.marked}/${data.questions.length} parts marked`:''}</p>${summary?`<p class="source-tag">${summary.automatic} automatic · ${summary.ai} AI-suggested · ${summary.self} self-marked · ${summary.reviewed} teacher reviewed</p>`:''}</div><button class="btn" data-student="${s.id}" ${s.submission?'':'disabled'}>View answers</button></article>`;}).join('');
    dialog.querySelector('[data-students]').onclick=e=>{const s=data.students.find(s=>s.id===e.target.closest('[data-student]')?.dataset.student);if(s)showStudent(data,s);};
    dialog.querySelector('[data-edit]').onsubmit=async e=>{e.preventDefault();try{await api('update',{id,due_date:e.target.elements.due_date.value,instructions:e.target.elements.instructions.value});openDetail(id);}catch(e){message(e);}};
    dialog.querySelector('[data-archive]').onclick=async()=>{try{await api('archive',{id});openList();}catch(e){message(e);}};
   }else if(data.submission?.submitted_at){const results=dialog.querySelector('[data-results]');const state=document.createElement('p');state.textContent=markingLabel(data.submission,a);results.before(state);button(state,'Refresh marks',()=>openDetail(id));renderResponses(results,data.questions,data.submission,false,a.id,user().id);}
  }catch(e){message(e);}
 }
 function showStudent(data,s){const a=data.assignment,submission=s.submission;
  modal((s.display_name||s.username)+' · '+a.title,`<p>${statusOf(a,submission)} · First submitted ${submission.first_submitted_at?new Date(submission.first_submitted_at).toLocaleString('en-GB'):'not yet'}</p><p>${esc(markingLabel(submission,a))}</p><div class="assignment-actions"><button class="btn" data-back>Back to class / refresh</button>${submission.submitted_at?'<button class="btn" data-reopen>Reopen work</button>':''}${submission.first_answers?'<label class="platform-check"><input type="checkbox" data-first> Show first submission</label>':''}</div><div data-responses></div>`);
  dialog.querySelector('[data-back]').onclick=()=>openDetail(a.id);dialog.querySelector('[data-reopen]')?.addEventListener('click',async()=>{try{await api('reopen',{id:a.id,student_id:s.id});openDetail(a.id);}catch(e){message(e);}});
  const draw=()=>{const first=dialog.querySelector('[data-first]')?.checked;renderResponses(dialog.querySelector('[data-responses]'),data.questions,first?{...submission,answers:submission.first_answers,marks:submission.first_marks,teacher_reviews:{}}:submission,!first&&!!submission.submitted_at,a.id,s.id);};draw();dialog.querySelector('[data-first]')?.addEventListener('change',draw);
 }
 function markingLabel(s,a){if(!s?.submitted_at)return 'Answers are still in progress.';if(s.marking_status==='pending'&&Date.now()-Date.parse(s.submitted_at)<180000)return 'Submitted. Automatic marking is processing; refresh to see updated feedback.';return (s.marking_status==='partial'||s.marking_status==='pending'?'Some longer answers need self-marking or teacher review. ':'')+(a.marking_mode==='review'?'Teacher review requested. ':'')+'AI-suggested and self-awarded marks are labelled separately from teacher-reviewed marks.';}
 function renderResponses(host,questions,submission,review,id,studentId){
  host.innerHTML=questions.map(q=>{const a=submission.answers?.[q.id]||{},mark=submission.teacher_reviews?.[q.id]||submission.marks?.[q.id],answer=q.kind==='choice'?(q.options[a.c]||'No answer'):answerText(a);return `<article class="platform-item"><h3>${esc(q.prompt)}</h3><div class="platform-answer">${esc(answer||'No answer')}</div><p>${mark?.score!=null?`${mark.score}/${q.m} · ${sourceName(mark.source)}`:a.self_score!=null?`${a.self_score}/${q.m} · Self-marked`:'No mark recorded'}</p>${mark?.feedback?`<p>${esc(mark.feedback)}</p>`:''}${mark?.next_step?`<p>Next step: ${esc(mark.next_step)}</p>`:''}${review?`<details><summary>Review mark</summary><p>Scheme: ${esc(q.levels?.length?q.levels.map(x=>x.join(': ')).join(' · '):q.scheme.join(' · '))}</p><form data-review="${esc(q.id)}"><label>Mark / ${q.m}<input name="score" type="number" min="0" max="${q.m}" step="1" required value="${mark?.score??a.self_score??''}"></label><label>Teacher feedback<textarea name="feedback" maxlength="2000">${esc(submission.teacher_reviews?.[q.id]?.feedback||'')}</textarea></label><button class="btn" type="submit">Save reviewed mark</button><p role="status"></p></form></details>`:''}</article>`;}).join('')||'<p>The student confirmed they worked through this lesson. There are no automatically assessed questions on this page.</p>';
  host.querySelectorAll('[data-review]').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;try{await api('review',{id,student_id:studentId,question_id:f.dataset.review,score:Number(f.elements.score.value),feedback:f.elements.feedback.value});f.querySelector('[role=status]').textContent='Teacher-reviewed mark saved.';}catch(e){f.querySelector('[role=status]').textContent=e.message;}finally{b.disabled=false;}});
 }
 function draftKey(){return active&&user()?`platform-draft:${user().id}:${active.id}`:null;}
 function backupKey(){return active&&user()?`platform-backup:${user().id}:${site}:${active.page_id}`:null;}
 function gather(questions=activeQuestions){const answers={};for(const q of questions){
  if(q.id.startsWith('check:')){const id=q.id.slice(6),el=document.querySelector(`[data-q="${CSS.escape(id)}"]`),choice=el?.querySelector('input[type=radio]:checked'),field=el?.querySelector('input[type=text]');answers[q.id]={c:choice?Number(choice.value):null,f:field?.value||'',w:'',self_score:null};}
  else {const s=exam.saved[q.id]||{},p=exam.PARTS[q.id],chosen=document.querySelector(`input[name="${CSS.escape(q.id)}"]:checked`);answers[q.id]={w:s.w||'',f:s.f||'',c:chosen?Number(chosen.value):s.c??null,self_score:p&&s.done?exam.pscore(p):null,self_ticks:s.t||[]};}
 }return answers;}
 function setAnswers(questions,answers){const cards=new Set();for(const q of questions){const a=answers?.[q.id]||{};
  if(q.id.startsWith('check:')){const id=q.id.slice(6),el=document.querySelector(`[data-q="${CSS.escape(id)}"]`);el?.querySelectorAll('input[type=radio]').forEach(i=>i.checked=Number(i.value)===a.c);const field=el?.querySelector('input[type=text]');if(field)field.value=a.f||'';}
  else {const p=exam.PARTS[q.id];if(!p)continue;if(a._state)exam.saved[q.id]=clone(a._state);else exam.saved[q.id]={w:a.w||'',f:a.f||'',...(Number.isInteger(a.c)?{c:a.c}:{}),...(a.self_score!=null?{done:true,hid:true,v:a.self_score,t:a.self_ticks||[],source:'self'}:{})};cards.add(p.card);}
 }exam.save();cards.forEach(c=>exam.rerender(c));}
 function restoreIndependent(){const key=backupKey(),backup=key&&storage.get(key);if(backup){setAnswers(activeQuestions,backup);storage.set(key,null);}restoredId=null;}
 async function loadActive(){
  if(!assignmentId||!user())return;try{const data=await api('detail',{id:assignmentId});if(data.students)return;active=data.assignment;activeSubmission=data.submission;activeQuestions=data.questions;if(active.site===site){const tier=active.context?.tier;if(tier&&window.TIER!==tier)document.querySelector(`.tier-switch [data-tier="${tier}"]`)?.click();if(currentPage()!==active.page_id)location.hash=active.page_id;}paintActive();if(!activeSubmission&&currentPage()===active.page_id)saveActive(false);}catch(e){const sec=$('#lab-'+CSS.escape(currentPage()));if(sec){let b=sec.querySelector('.assignment-banner');if(!b){b=document.createElement('div');b.className='assignment-banner';sec.querySelector('.lab-head')?.after(b);}b.textContent=e.message;}}
 }
 function paintActive(){
  if(!active)return;
  if(active.site!==site||active.page_id!==currentPage()){if(restoredId){saveActive(false,true);restoreIndependent();}return;}
  const sec=$('#lab-'+CSS.escape(active.page_id));if(!sec)return;
  if(restoredId!==active.id){
   const key=backupKey(),backup=storage.get(key);if(!backup){const b=gather();for(const q of activeQuestions)if(!q.id.startsWith('check:'))b[q.id]._state=clone(exam.saved[q.id]||{});storage.set(key,b);}
   const cached=storage.get(draftKey()),source=!activeSubmission?.submitted_at&&cached?.updated_at>(activeSubmission?.updated_at||'')?cached:activeSubmission;
   setAnswers(activeQuestions,source?.answers||{});restoredId=active.id;
   const tier=active.context?.tier;if(tier&&window.TIER!==tier)document.querySelector(`.tier-switch [data-tier="${tier}"]`)?.click();
   const essay=active.context?.essay;if(essay&&$('#essay-plan-topic')){$('#essay-plan-topic').value=essay;$('#essay-plan-topic').dispatchEvent(new Event('change',{bubbles:true}));}
  }
  let banner=sec.querySelector('.assignment-banner');if(!banner){banner=document.createElement('div');banner.className='assignment-banner';sec.querySelector('.lab-head').after(banner);}
  banner.innerHTML=`<b>Assignment · Due ${dateLabel(active.due_date)}</b>${active.instructions?`<p>${esc(active.instructions)}</p>`:''}<p class="assignment-status">${activeSubmission?.submitted_at?'Submitted. Your teacher can now see your saved answers.':'Answers save to this assignment as you work. Your independent practice is kept separately.'}</p>${activeSubmission?.submitted_at?'<button class="btn" data-view-submission>View submission and feedback</button>':'<label><input type="checkbox" data-read-confirmed> I have worked through this lesson or paper and completed my answers.</label><div class="assignment-actions"><button class="btn" data-save-assignment>Save now</button><button class="btn primary" data-submit-assignment>Submit assignment</button></div>'}<p role="status" data-save-status></p>`;
  if(activeSubmission?.submitted_at){banner.querySelector('[data-view-submission]').onclick=()=>openDetail(active.id);sec.querySelectorAll('.xbody input,.xbody textarea,.xbody select,.xbody button,.qi input,.qi button').forEach(e=>{e.dataset.assignmentLocked='1';e.disabled=true;});}
  else {sec.querySelectorAll('[data-assignment-locked]').forEach(e=>{e.disabled=false;delete e.dataset.assignmentLocked;});const cached=storage.get(draftKey());banner.querySelector('[data-read-confirmed]').checked=cached?.read_confirmed??activeSubmission?.read_confirmed??false;banner.querySelector('[data-save-assignment]').onclick=()=>saveActive(false);banner.querySelector('[data-submit-assignment]').onclick=()=>saveActive(true);}
  decorate();
 }
 async function saveActive(submit=false,leaving=false){
  if(!active||restoredId!==active.id||activeSubmission?.submitted_at||!leaving&&currentPage()!==active.page_id)return;
  clearTimeout(saveTimer);const stored=leaving?storage.get(draftKey()):null,answers=stored?.answers||gather(),confirmed=stored?.read_confirmed??!!$('[data-read-confirmed]')?.checked;
  const draft={answers,read_confirmed:confirmed,updated_at:new Date().toISOString()},localKey=draftKey();storage.set(localKey,draft);const out=$('[data-save-status]');
  if(submit&&(!confirmed||!activeQuestions.every(q=>answered(q,answers[q.id])))){if(out)out.textContent='Answer every required question and confirm you have completed the work before submitting.';return;}
  const current=active.id;
  saveChain=saveChain.catch(()=>{}).then(async()=>{try{if(out)out.textContent=submit?'Submitting…':'Saving…';const result=await api(submit?'submit':'save',{id:current,...draft});if(active?.id===current){activeSubmission=result.submission;if(storage.get(localKey)?.updated_at===draft.updated_at)storage.set(localKey,null);if(submit)paintActive();else if(out)out.textContent='Saved to your assignment.';}}catch(e){if(out)out.textContent=e.message+' A local draft is kept on this device.';}});return saveChain;
 }
 function rememberDraft(){if(!active||restoredId!==active.id||activeSubmission?.submitted_at||currentPage()!==active.page_id)return;storage.set(draftKey(),{answers:gather(),read_confirmed:!!$('[data-read-confirmed]')?.checked,updated_at:new Date().toISOString()});clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveActive(false),2500);}
 function decorate(){
  for(const sec of $$('.lab:not([hidden])'))for(const part of sec.querySelectorAll('.xp[data-p]')){
   const p=exam.PARTS[part.dataset.p];if(!p||p.opts||p.ans&&p.m===1)continue;let box=part.querySelector('.ai-feedback');
   if(!box){box=document.createElement('div');box.className='ai-feedback';box.dataset.aiBox=p.id;part.querySelector('.xbody').append(box);}
   if(box.dataset.ready==='1')continue;box.dataset.ready='1';
   if(!service?.ai_available){box.innerHTML='<p class="ai-note">Use the existing mark scheme to self-mark this answer. AI feedback will be available when configured.</p>';continue;}
   if(exam.saved[p.id]?.source==='ai-suggested'){const used=document.createElement('p');used.className='ai-note';used.textContent='Your practice score includes an AI-suggested mark for this answer. It has not been teacher reviewed.';box.append(used);}
   const b=button(box,user()?'Get AI feedback':'Sign in for AI feedback',()=>markAnswer(p,box));b.dataset.aiMark=p.id;if(activeSubmission?.submitted_at&&restoredId===active?.id)b.disabled=true;
   const note=document.createElement('p');note.className='ai-note';note.textContent='Provisional feedback. Only your answer and the question are sent to the configured AI provider. Avoid personal information.';box.append(note);
  }
 }
 async function markAnswer(p,box){
  if(!requireUser())return;const s=exam.saved[p.id]||{},text=answerText(s),b=box.querySelector('button');if(!text){box.querySelector('.ai-note').textContent='Write an answer first.';return;}
  if(b.disabled)return;b.disabled=true;let resultBox=box.querySelector('[data-ai-result]');if(!resultBox){resultBox=document.createElement('div');resultBox.dataset.aiResult='';box.append(resultBox);}resultBox.textContent='Assessing your answer…';
  try{const data=await api('mark',{site,question_id:p.id,answer:text,...(active&&restoredId===active.id?{assignment_id:active.id}:{})},45000);
   if(answerText(exam.saved[p.id])!==text){resultBox.textContent='Your answer changed while it was being assessed. Request feedback for the new version.';return;}
   if(data.fallback){resultBox.textContent=data.reason;return;}const r=data.result;
   resultBox.innerHTML=`<p><b>AI-suggested mark: ${r.score}/${r.max}</b> · Provisional${r.needs_review?' · Teacher review recommended':''}</p><p>${esc(r.feedback)}</p><p><b>Next step:</b> ${esc(r.next_step)}</p>${r.criteria.filter(c=>c.awarded).map(c=>`<blockquote>${esc(c.evidence)}</blockquote>`).join('')}<button class="btn" data-use-ai>Use suggested mark in my practice score</button>`;
   resultBox.querySelector('[data-use-ai]').onclick=()=>{if(answerText(exam.saved[p.id])!==text){resultBox.textContent='Your answer has changed. Request new feedback.';return;}const state=exam.saved[p.id]||{};state.done=true;state.source='ai-suggested';state.ai_answer=text;state.hid=true;if(p.lor)state.v=r.score;else state.t=p.ms.map((_,i)=>!!r.criteria.find(c=>c.index===i)?.awarded);exam.saved[p.id]=state;exam.save();exam.rerender(p.card);decorate();rememberDraft();};
  }catch(e){resultBox.textContent='AI marking is unavailable. Use the existing self-mark scheme. '+e.message;}finally{b.disabled=false;}
 }
 document.addEventListener('input',e=>{const id=e.target.dataset.xw||e.target.dataset.xin||e.target.closest('.xp')?.dataset.p;if(id&&exam.saved[id]?.source==='ai-suggested'&&answerText(exam.saved[id])!==exam.saved[id].ai_answer){const s=exam.saved[id];delete s.source;delete s.ai_answer;s.done=false;s.t=[];s.v=0;exam.save();exam.refresh(exam.PARTS[id].card);const box=e.target.closest('.xp')?.querySelector('[data-ai-result]');if(box)box.textContent='Answer changed. Request new feedback.';}if(e.target.closest('.lab'))rememberDraft();});
 document.addEventListener('change',e=>{if(e.target.dataset.xt||e.target.dataset.xlor){const id=e.target.dataset.xt||e.target.dataset.xlor;if(exam.saved[id]){exam.saved[id].source='self';exam.save();}}if(e.target.closest('.lab'))rememberDraft();});
 document.addEventListener('click',e=>{if(e.target.closest('[data-chk],[data-xmcq],[data-xchk],[data-xms]'))queueMicrotask(rememberDraft);});
 let queued=false;const route=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;paintActive();decorate();});};
 new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='data-unit'||r.type==='childList'&&r.target.classList?.contains('exam')))route();}).observe(document.body,{attributes:true,attributeFilter:['data-unit'],childList:true,subtree:true});
 window.addEventListener('hashchange',route);window.addEventListener('popstate',route);window.addEventListener('prodigy-account-change',accountChanged);window.addEventListener('online',()=>saveActive(false));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')rememberDraft();});
 window.addEventListener('pagehide',()=>{rememberDraft();});
 // Called once; account updates also arrive after the existing sign-in bootstrap.
 accountChanged();repaint();
}

})();
