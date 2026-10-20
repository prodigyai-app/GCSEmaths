const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n');
const NumericTools=require('../numeric-tools.js');
const {parseNumber,matches}=NumericTools;
const helper=new Proxy(function(){return ''},{get:(_,key)=>key===Symbol.toPrimitive?()=> '':helper,apply:()=>''});
const papers=[];
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const context=vm.createContext({Math,SYM:helper,M:helper,MPF:helper,LOR6:helper,LAB:helper,CH:helper,fr:helper,fx:helper,sup:helper,v:helper,res:helper,EXAM:{graph:helper,full:cfg=>papers.push(cfg)},MP:new Proxy({paper:cfg=>papers.push(cfg)},{get:(o,k)=>o[k]||helper})});
for(const script of scripts) if(!script.includes('EXAM.full=function')&&(script.includes('EXAM.full(')||script.includes('MP.paper({'))) vm.runInContext(script,context);

test('all scripts parse, local assets exist and main-page metadata supports phones and screen readers',()=>{
  scripts.forEach((script,i)=>new vm.Script(script,{filename:`inline ${i}`}));
  for(const [,name] of html.matchAll(/<script[^>]*src="([^"/:]+\.js)"[^>]*>/g)) new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
  const head=html.slice(0,html.indexOf('<style>'));
  assert.match(head,/<html lang="en">/);
  assert.match(head,/<meta name="viewport" content="width=device-width, initial-scale=1">/);
});
test('fractions, surds and mathematical expressions give the same numerical answer as decimals',()=>{
  for(const [input,answer] of [['1/2',.5],['1/4',.25],['sqrt(2)',Math.sqrt(2)],['2π',2*Math.PI],['3.2 × 10^-3',.0032],['−1/4',-.25],['2(3+4)',14],['-2^2',-4],['2^-2',.25]]) assert.ok(matches(parseNumber(input),answer,1e-12),input);
  for(const text of ['','1/0','sqrt(-1)','1/','2+','x+4y=2','NaN','Infinity','alert(1)','2;3']) assert.ok(Number.isNaN(parseNumber(text)),text);
  for(const answer of [1e-20,.001,100]) assert.equal(matches(0,answer),false);
});
test('unchecked answers and written working persist synchronously, without waiting for Check answer',()=>{
  const listener=html.split('\n').find(line=>line.startsWith('document.addEventListener("input",e=>{ const t=e.target, id=t.dataset.xw||t.dataset.xin;'));
  const save=html.split('\n').find(line=>line==='const save=()=>store.set(KEY,saved);');
  assert.ok(listener&&save);
  let onInput,persisted;
  const c=vm.createContext({saved:{},KEY:'answers',store:{set:(key,value)=>persisted=JSON.parse(JSON.stringify(value))},document:{addEventListener:(event,fn)=>onInput=fn}});
  vm.runInContext(save+'\n'+listener,c);
  onInput({target:{dataset:{xin:'part'},value:'1/2'}});
  assert.equal(persisted.part.f,'1/2');
  onInput({target:{dataset:{xw:'part'},value:'first line'}});
  assert.equal(persisted.part.w,'first line');
  assert.equal(persisted.part.f,'1/2');
});
test('every full paper keeps its advertised total and valid mark schemes',()=>{
  const maths=html.includes('window.MP=');
  assert.equal(papers.length,maths?18:12);
  for(const paper of papers){
    const parts=paper.qs.flatMap(q=>q.parts||[]);
    assert.equal(parts.reduce((total,p)=>total+(p.m??(p.opts?1:0)),0),maths?80:100,paper.id);
    parts.forEach(p=>{if(p.opts)assert.ok(Number.isInteger(p.a)&&p.a>=0&&p.a<p.opts.length);else if(p.ms)assert.equal(p.ms.length,p.m,paper.id+': '+p.q);});
  }
});

function closingBrace(text,start){
  let depth=0,quote=null;
  for(let i=start;i<text.length;i++){
    const c=text[i];
    if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote=null;continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{')depth++; if(c==='}'&&--depth===0)return i+1;
  }
  throw Error('Unclosed JavaScript block');
}
test('explicit final-value checks do not award every method mark for multi-mark questions',()=>{
  const start=html.indexOf('if(t.dataset.xchk){'),end=closingBrace(html,html.indexOf('{',start));
  for(const marks of [1,3]){
    const s={},fb={},checks=Array.from({length:marks},()=>({checked:false}));
    const c=vm.createContext({NumericTools,num:parseNumber,t:{dataset:{xchk:'part'}},id:'part',s,p:{m:marks,ans:{a:.5,tol:0},ms:Array.from({length:marks},()=>['1','criterion']),card:'card'},save(){},refresh(){},$:selector=>selector.includes('data-xin')?{value:'1/2'}:fb,$$:()=>checks});
    vm.runInContext('(function(){'+html.slice(start,end)+'})()',c);
    assert.match(fb.innerHTML,/correct/i);
    assert.equal((s.t||[]).filter(Boolean).length,marks===1?1:0);
  }
});

if(html.includes('window.MSTEPS=')){
  test('partial algebra and numerical values in working cannot receive full marks',()=>{
    const start=html.indexOf('function mark(p,lines){\n  // Working');
    const end=html.indexOf('\n\n/* ---- the UI ---- */',start);
    const c=vm.createContext({});vm.runInContext(html.slice(start,end)+';this.mark=mark;',c);
    const paper=papers.find(p=>p.id==='pf1');
    const part=paper.qs.flatMap(q=>q.parts).find(p=>p.q==='Simplify 5a + 3b − 2a + b');
    assert.ok(part);
    for(const line of ['4b','3a','3a + 4b'])assert.equal(c.mark(part,[line]).award.filter(Boolean).length,0);
    assert.equal(c.mark({m:2,ans:{a:.5},ms:[['M1','method'],['A1','answer']]},['0.5']).award.filter(Boolean).length,0);
    assert.doesNotMatch(html,/each correct step is ticked and earns its method mark/);
  });
}
if(fs.existsSync(path.join(root,'physics-equations.js'))){
  test('the current AQA summary contains 35 equations and six Higher-only entries',()=>{
    const {rows,officialURL}=require('../physics-equations.js');
    assert.equal(rows.length,35);assert.equal(rows.filter(e=>e[2]).length,6);
    const foundation=rows.filter(e=>!e[2]);
    for(const formula of ['V = IR','F = ma','v = fλ','E<sub>k</sub> = ½mv²'])assert.ok(foundation.some(e=>e[1]===formula));
    assert.ok(!foundation.some(e=>e[1]==='p = mv'));
    assert.match(officialURL,/aqa.org.uk/);
    assert.doesNotMatch(html,/All other equations \(for example/);
    assert.doesNotMatch(html,/eqk rc">Recall/);
  });
  test('Foundation papers exclude Higher-only momentum, motor-effect and hearing questions',()=>{
    const invalid=new Set(['fo12','wa4','mg3','mg4','mg5','mg6']);
    for(const paper of papers.filter(p=>p.tier==='Foundation')) for(const q of paper.qs) for(const p of q.parts){
      assert.ok(!invalid.has(p.tag||q.tag),paper.id+': '+p.q);
      assert.doesNotMatch(p.q,/momentum|Fleming|motor effect|range of normal human hearing|area under|total distance travelled/i);
    }
    const q=papers.find(p=>p.id==='pf12').qs[4];
    assert.equal(q.parts[1].ans.a,.5);assert.equal(q.parts[2].ans.a,1.4);
  });
}
if(html.includes('<title>GCSE Chemistry</title>')){
  test('atmosphere ranges accept the intended percentages and reject impossible values',()=>{
    const answers=papers.flatMap(p=>p.qs.flatMap(q=>q.parts)).filter(p=>p.ans&&/percentage/i.test(p.q)&&/atmosphere/i.test(p.q));
    assert.equal(answers.length,4);
    for(const p of answers){
      const nitrogen=/nitrogen/i.test(p.q), valid=nitrogen?[78,79,80]:[20,20.5,21];
      valid.forEach(n=>assert.equal(matches(n,p.ans.a,p.ans.tol,p.ans.atol),true,p.q));
      for(const n of [0,1,40,100,200,-10])assert.equal(matches(n,p.ans.a,p.ans.tol,p.ans.atol),false,p.q);
    }
    assert.match(html,/a:79,show:"78–80",unit:"%",tol:0,abs:1/);
  });
  test('Foundation strong-versus-weak ionisation question is replaced with acid and alkali ions',()=>{
    const q=papers.find(p=>p.id==='cf21').qs[5];
    assert.equal(q.parts[6].tag,'cc6');assert.equal(q.parts[6].m,2);
    for(const paper of papers.filter(p=>p.tier==='Foundation')) for(const q of paper.qs) for(const p of q.parts){assert.notEqual(p.tag||q.tag,'cc7');assert.doesNotMatch(p.q,/ionised|ionized/i);}
  });
}
