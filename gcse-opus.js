/* Learn-tab figures, Foundation exam practice, review-lesson content and Foundation scaffolding.
   Content and answers: gcse-opus-data.js (generated and checked by scripts/opus_gcse.py).
   Figures: maths-figs.js (MF). Runs before the hub boots, so the lesson tabs and tier marking see it. */
(()=>{'use strict';
const D=window.GCSE_OPUS, {hand,fill}=M, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const {svg,fig,line,poly,text,rightAngle,ticks,angle,sideLabel,axes,numberLine,barModel,path,dot}=MF;
const cvH=(a,b)=>`<span class="cv"><span class="cvi"><span>${a}</span><span>${b}</span></span></span>`;
const cv=s=>String(s).replace(/\{cv:([^,}]+),([^}]+)\}/g,(_,a,b)=>cvH(a,b));
const NL=(o,label,cap,na)=>{const N=numberLine(o);return fig(svg(N.w,N.h,N.svg,{label}),cap,{notAccurate:na});};
const BM=(o,label,cap)=>{const B=barModel(o);return fig(svg(B.w,B.h,B.svg,{label}),cap);};
const G=(o,draw,label,cap,na)=>{const A=axes(o);return fig(svg(A.w,A.h,A.svg+draw(A),{label}),cap,{notAccurate:na});};

/* ---------- figures ---------- */
function rightTri(o){ // right angle at C (bottom right); A bottom left; B top right
  const A=[40,170],C=[260,170],B=[260,40];
  let g=poly([A,C,B])+rightAngle(C,A,B,13);
  if(o.angleA) g+=angle(A,C,B,34,o.angleA,{acc:true,lr:16});
  g+=sideLabel(A,C,o.adj||'',1,16)+sideLabel(C,B,o.opp||'',1,24,{a:'start'})+sideLabel(A,B,o.hyp||'',-1,14,{a:'end'});
  return svg(300,205,g,{label:o.label||'Right-angled triangle'});
}
function grid(rows,cols,cell,hi,rl,cl,lab){ // sample-space grid
  const x0=104,y0=40,w=cols.length*cell,h=rows.length*cell;let g='';
  rows.forEach((r,i)=>cols.forEach((c,j)=>{const v=lab(r,c),on=hi(v);g+=`<rect x="${x0+j*cell}" y="${y0+i*cell}" width="${cell}" height="${cell}" class="${on?'mf-fill':'mf-fill2'}" style="${on?'':'fill-opacity:.04'}"/>`+`<rect x="${x0+j*cell}" y="${y0+i*cell}" width="${cell}" height="${cell}" class="mf-ink" style="stroke-width:1.2"/>`+text(x0+j*cell+cell/2,y0+i*cell+cell/2+5,v,{acc:on,bold:on});}));
  rows.forEach((r,i)=>g+=text(x0-14,y0+i*cell+cell/2+5,r,{bold:true}));cols.forEach((c,j)=>g+=text(x0+j*cell+cell/2,y0-12,c,{bold:true}));
  g+=text(x0-14,y0-12,'+',{bold:true})+text(x0+w/2,y0-30,cl,{small:true})+text(40,y0+h/2+4,rl,{small:true});
  return {g,w:x0+w+20,h:y0+h+16};
}
const LEARN_FIGS={
 'nu1:0':()=>NL({w:440,h:86,min:0.00478,max:0.00479,step:0.000001,labelEvery:5,marks:[{v:0.0047819,label:'0.0047819',acc:true}],y:46},'Number line from 0.00478 to 0.00479','0.0047819 lies between 0.00478 and 0.00479 and is below the halfway value 0.004785, so it rounds down to 0.00478.'),
 'nu1:2':()=>NL({w:440,h:90,min:6.3,max:6.5,step:0.01,labelEvery:5,range:{a:6.35,b:6.45,openB:true},marks:[{v:6.4,label:'6.4',acc:true,below:true}],y:42},'Error interval from 6.35 to 6.45','Every value from 6.35 up to (but not including) 6.45 rounds to 6.4. Filled circle: included. Open circle: not included.'),
 'nu3:0':()=>BM({w:440,labelW:56,rows:[{label:'⅓',parts:[{n:4,text:'4/12',acc:true},{n:8}]},{label:'¾',parts:[{n:9,text:'9/12',acc:true},{n:3}]}]},'Fraction bars split into twelfths','Twelfths make the pieces the same size: ⅓ = 4/12 and ¾ = 9/12, so the fractional parts can be added.'),
 'nu4:0':()=>BM({w:440,labelW:10,rows:[{parts:[{n:7,text:'35% = 91',acc:true},{n:13,text:'65%'}],brace:'100% = 260, so each 5% box = 13'}]},'Percentage bar of 260 in 5% boxes','Each box is 5% of 260 = 13. Seven boxes make 35%: 7 × 13 = 91.'),
 'ra1:0':()=>BM({w:440,labelW:56,rows:[{label:'Amy',parts:[{n:3,text:'3 × £15 = £45',acc:true}]},{label:'Ben',parts:[{n:5,text:'5 × £15 = £75'}],brace:'8 parts = £120, so 1 part = £15'}]},'Bar model for sharing £120 in the ratio 3 : 5','One box = one part. Count all the boxes before dividing.'),
 'ra1:1':()=>BM({w:440,labelW:56,rows:[{label:'Red',parts:[{n:2,text:'2'}]},{label:'Blue',parts:[{n:2,text:'2'},{n:5,text:'5 parts = 35',acc:true}]}]},'Bar model showing the difference of 5 parts','Blue has 5 more parts than red, and that difference is 35 counters.'),
 'ra3:1':()=>BM({w:440,labelW:10,rows:[{parts:[{n:4,text:'80% = £68',acc:true},{n:1,text:'20%'}],brace:'100% = original price'}]},'Bar model for a 20% reduction','The sale price is 80% of the original: 4 boxes = £68, so 1 box = £17 and 5 boxes = £85.'),
 'al5:0':()=>G({w:360,h:250,x:[0,6],y:[0,28],ystep:4,xl:'n',yl:'term'},A=>A.fn(n=>4*n+3,'mf-acc mf-dash',0,5.6)+[1,2,3,4].map(n=>A.point(n,4*n+3,String(4*n+3),{dx:-6,dy:-10,a:'end'})).join('')+text(A.X(4.6),A.Y(27),'4n + 3',{acc:true,small:true}),'Terms of 7, 11, 15, 19 plotted against position','Each step along adds 4, so the points lie on a line with gradient 4. At n = 0 it would be 3.'),
 'al7:0':()=>G({w:360,h:270,x:[-1,7],y:[-5,9],ystep:1,ylabEvery:2,xl:'x',yl:'y',grid:true},A=>A.fn(x=>(16-3*x)/2)+A.fn(x=>(5*x-14)/3,'mf-ink')+A.point(4,2,'(4, 2)',{acc:true,dx:10,dy:-6})+text(A.X(0.5),A.Y(8.6),'3x + 2y = 16',{acc:true,small:true,a:'start'})+text(A.X(6.9),A.Y(6.3),'5x − 3y = 14',{small:true,a:'end'}),'Two straight lines crossing at (4, 2)','The solution of a pair of simultaneous equations is the point where their graphs cross.'),
 'al8:0':()=>G({w:360,h:270,x:[-4,7],y:[-14,10],ystep:2,ylabEvery:2,xl:'x',yl:'y'},A=>A.fn(x=>x*x-3*x-10)+A.point(-2,0,'x = −2',{acc:true,dx:-6,dy:-10,a:'end'})+A.point(5,0,'x = 5',{acc:true,dx:8,dy:-10})+A.point(1.5,-12.25,'',{}),'Graph of y = x² − 3x − 10','The solutions of x² − 3x − 10 = 0 are where the curve crosses the x-axis.'),
 'al8:2':()=>{let g='';const X=60,Y=20,x=120,t=48; // x by x square with two 3-by-x strips and the missing 3-by-3 corner
   g+=`<rect x="${X}" y="${Y}" width="${x}" height="${x}" class="mf-fill2"/><rect x="${X}" y="${Y}" width="${x}" height="${x}" class="mf-ink"/>`+text(X+x/2,Y+x/2+5,'x²');
   g+=`<rect x="${X+x}" y="${Y}" width="${t}" height="${x}" class="mf-fill"/><rect x="${X+x}" y="${Y}" width="${t}" height="${x}" class="mf-ink"/>`+text(X+x+t/2,Y+x/2+5,'3x',{acc:true});
   g+=`<rect x="${X}" y="${Y+x}" width="${x}" height="${t}" class="mf-fill"/><rect x="${X}" y="${Y+x}" width="${x}" height="${t}" class="mf-ink"/>`+text(X+x/2,Y+x+t/2+5,'3x',{acc:true});
   g+=`<rect x="${X+x}" y="${Y+x}" width="${t}" height="${t}" class="mf-ink mf-dash"/>`+text(X+x+t/2,Y+x+t/2+5,'9',{small:true});
   g+=text(X+x/2,Y+x+t+22,'x',{italic:true})+text(X+x+t/2,Y+x+t+22,'3')+text(X-14,Y+x/2+5,'x',{italic:true})+text(X-14,Y+x+t/2+5,'3');
   g+=text(X+x+t+16,Y+40,'x² + 6x is the square',{a:'start',small:true})+text(X+x+t+16,Y+60,'(x + 3)² with the',{a:'start',small:true})+text(X+x+t+16,Y+80,'9 corner missing:',{a:'start',small:true})+text(X+x+t+16,Y+104,'x² + 6x = (x + 3)² − 9',{a:'start',acc:true,bold:true});
   return fig(svg(440,240,g,{label:'Area model for completing the square'}),'Half of 6x goes on each side, so the square needs a 3 × 3 corner that is not there: subtract 9.');},
 'nu7:0':()=>BM({w:440,labelW:50,rows:[{label:'√72',parts:[{n:6,text:'6√2',acc:true}]},{label:'√18',parts:[{n:3,text:'3√2'}],brace:'9 lengths of √2 = 9√2'}]},'Lengths of root 2','√72 = √36 × √2 = 6√2 and √18 = √9 × √2 = 3√2: both are made of the same length √2, so they can be collected.'),
 'st1:0':()=>G({w:380,h:262,x:[0,44],y:[0,10],xstep:10,ystep:2,xl:'time t (min)',xlBelow:true,yl:'frequency',padB:46},A=>[[0,10,4],[10,20,9],[20,30,5],[30,40,2]].map(([a,b,f])=>`<rect x="${A.X(a).toFixed(1)}" y="${A.Y(f).toFixed(1)}" width="${(A.X(b)-A.X(a)).toFixed(1)}" height="${(A.Y(0)-A.Y(f)).toFixed(1)}" class="mf-fill2"/>`+poly([[A.X(a),A.Y(0)],[A.X(a),A.Y(f)],[A.X(b),A.Y(f)],[A.X(b),A.Y(0)]],'mf-ink',false)+A.point((a+b)/2,f,'mid '+(a+b)/2,{acc:true,dx:0,dy:-10,a:'middle'})).join(''),'Grouped frequencies with the midpoint of each class','Each class is represented by its midpoint, which is why the mean is only an estimate.'),
 'pr1:1':()=>NL({w:440,h:96,min:0,max:1,step:0.1,labelEvery:5,marks:[{v:0.35,label:'estimate 0.35',acc:true},{v:0.5,label:'fair: 0.5',below:true}],y:46},'Probability scale from 0 to 1','28 ÷ 80 = 0.35 is noticeably below 0.5, the value for a fair pin.'),
 'pr4:0':()=>{const R=grid([1,2,3],[1,2,3,4],46,v=>v===5,'spinner A','spinner B',(r,c)=>r+c);return fig(svg(R.w,R.h,R.g,{label:'Sample space of totals'}),'12 equally likely outcomes; the 3 totals of 5 are shaded, so P(5) = 3/12 = 1/4.');},
 'ge15:1':()=>{let g=`<rect x="60" y="20" width="160" height="160" class="mf-fill2"/>`+poly([[60,20],[220,20],[220,180],[60,180]]);for(let i=1;i<10;i++){g+=line(60+i*16,20,60+i*16,180,'mf-thin')+line(60,20+i*16,220,20+i*16,'mf-thin');}
   g+=text(140,200,'1 m = 100 cm')+text(48,104,'1 m = 100 cm',{a:'end',small:true})+text(250,90,'1 m² =',{a:'start'})+text(250,114,'100 × 100',{a:'start'})+text(250,138,'= 10 000 cm²',{a:'start',acc:true,bold:true});
   return fig(svg(380,212,g,{label:'One square metre'}),'Each side is 100 cm, so the area is 100 × 100 cm², not 100 cm².',{max:420});},
 'ge5:1':()=>fig(rightTri({angleA:'θ',adj:'10 cm',opp:'7 cm',hyp:'',label:'Right-angled triangle with sides 7 and 10'}),'Label the sides from θ: 7 cm is opposite, 10 cm is adjacent, so use tan.',{notAccurate:true,max:380}),
 'ge16:0':()=>{const f=[[40,160],[150,160],[95,90]],d=[110,-50],b=f.map(([x,y])=>[x+d[0],y+d[1]]);let g=poly(f,'mf-fill')+poly(f)+line(f[0][0],f[0][1],b[0][0],b[0][1],'mf-ink mf-dash')+line(f[1][0],f[1][1],b[1][0],b[1][1])+line(f[2][0],f[2][1],b[2][0],b[2][1])+poly([b[1],b[2]],'mf-ink',false)+line(b[0][0],b[0][1],b[1][0],b[1][1],'mf-ink mf-dash')+line(b[0][0],b[0][1],b[2][0],b[2][1],'mf-ink mf-dash');
   [...f,...b].forEach(p=>g+=dot(p[0],p[1],'mf-dota',3.4));g+=text(300,40,'5 faces',{a:'start'})+text(300,64,'9 edges',{a:'start'})+text(300,88,'6 vertices',{a:'start',acc:true});
   return fig(svg(400,180,g,{label:'Triangular prism'}),'Two triangular ends and three rectangles. Dots mark the 6 vertices; dashed edges are hidden.');},
};

/* ---------- figures for exam questions and review worked examples ---------- */
const QFIGS={
 ineq:()=>NL({w:440,h:70,min:-3,max:6,step:1,labelEvery:1,range:{a:-1,b:4,openB:true},y:40},'Inequality on a number line',''),
 trap:()=>{const P=[[70,30],[200,30],[250,140],[40,140]];let g=poly(P)+line(110,30,110,140,'mf-ink mf-dash')+rightAngle([110,140],[250,140],[110,30],11)+text(135,22,'7 cm',{small:true})+text(145,162,'11 cm',{small:true})+text(116,92,'4 cm',{small:true,a:'start'});return fig(svg(290,172,g,{label:'Trapezium'}),'',{notAccurate:true,max:320});},
 cuboid:()=>{const o=[40,150],w=150,h=80,dx=60,dy=-40;const F=[[o[0],o[1]],[o[0]+w,o[1]],[o[0]+w,o[1]-h],[o[0],o[1]-h]];const Bk=F.map(([x,y])=>[x+dx,y+dy]);
   let g=poly(F)+poly([F[1],Bk[1],Bk[2],F[2]],'mf-ink')+poly([F[3],F[2],Bk[2],Bk[3]],'mf-ink')+line(F[0][0],F[0][1],Bk[0][0],Bk[0][1],'mf-ink mf-dash')+line(Bk[0][0],Bk[0][1],Bk[1][0],Bk[1][1],'mf-ink mf-dash')+line(Bk[0][0],Bk[0][1],Bk[3][0],Bk[3][1],'mf-ink mf-dash');
   g+=text(115,172,'5 cm',{small:true})+text(o[0]+w+40,o[1]-12,'4 cm',{small:true,a:'start'})+text(30,110,'3 cm',{small:true,a:'end'});return fig(svg(300,182,g,{label:'Cuboid 5 by 4 by 3'}),'',{notAccurate:true,max:320});},
 ladder:()=>{let g=line(220,20,220,170)+line(20,170,240,170)+line(80,170,220,40,'mf-acc')+rightAngle([220,170],[20,170],[220,20],12)+text(150,96,'5 m',{acc:true,a:'end'})+text(150,190,'1.4 m',{small:true})+text(230,106,'h',{italic:true,a:'start'});
   for(let x=26;x<240;x+=14)g+=line(x,170,x-8,180,'mf-thin');return fig(svg(270,196,g,{label:'Ladder against a wall'}),'',{notAccurate:true,max:300});},
 tree:()=>{const br=(x1,y1,x2,y2,p,l)=>line(x1,y1,x2,y2)+(y2<y1?text((x1+x2)/2-6,(y1+y2)/2-6,p,{small:true,acc:true,a:'end'}):text((x1+x2)/2-6,(y1+y2)/2+18,p,{small:true,acc:true,a:'end'}))+text(x2+6,y2+5,l,{small:true,a:'start'});
   let g=text(110,16,'Monday',{small:true,bold:true})+text(300,16,'Tuesday',{small:true,bold:true});g+=br(30,120,150,60,'0.4','rain')+br(30,120,150,180,'0.6','no rain');
   g+=br(200,60,320,30,'0.3','rain')+br(200,60,320,90,'0.7','no rain')+br(200,180,320,150,'0.3','rain')+br(200,180,320,210,'0.7','no rain');
   return fig(svg(400,226,g,{label:'Probability tree for rain on two days'}),'Multiply along the branches; add the results of different routes.',{max:440});},
 nl74:()=>NL({w:440,h:90,min:7.3,max:7.5,step:0.01,labelEvery:5,range:{a:7.35,b:7.45,openB:true},marks:[{v:7.4,label:'7.4',acc:true,below:true}],y:42},'Error interval for 7.4',''),
 bar235:()=>BM({w:440,labelW:10,rows:[{parts:[{n:2,text:'£30',acc:true},{n:3,text:'£45'},{n:5,text:'£75',acc:true}],brace:'10 parts = £150, so 1 part = £15'}]},'Bar model for 2 : 3 : 5',''),
 tri40:()=>fig(rightTri({angleA:'40°',hyp:'10 cm',opp:'x',adj:'',label:'Right-angled triangle with hypotenuse 10 and angle 40 degrees'}),'',{notAccurate:true,max:380}),
 venn:()=>{let g=`<rect x="10" y="10" width="380" height="180" rx="8" class="mf-ink" style="stroke-width:1.5"/>`+`<circle cx="160" cy="100" r="70" class="mf-fill2"/><circle cx="160" cy="100" r="70" class="mf-ink"/><circle cx="240" cy="100" r="70" class="mf-fill"/><circle cx="240" cy="100" r="70" class="mf-ink"/>`;
   g+=text(125,105,'13',{bold:true})+text(200,105,'5',{bold:true,acc:true})+text(275,105,'7',{bold:true})+text(120,26,'Football',{small:true})+text(285,26,'Tennis',{small:true})+text(360,176,'5',{bold:true})+text(30,30,'ξ = 30',{small:true,a:'start'});
   return fig(svg(400,200,g,{label:'Venn diagram for football and tennis'}),'Fill the overlap first, then each circle, then the outside.',{max:420});},
 scatter:()=>{const xs=[1,2,3,4,6,7,8],ys=[32,40,45,52,63,70,74],n=7,mx=xs.reduce((a,b)=>a+b)/n,my=ys.reduce((a,b)=>a+b)/n;
   const m=xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/xs.reduce((s,x)=>s+(x-mx)**2,0),c=my-m*mx;
   return G({w:380,h:260,x:[0,9],y:[20,80],ystep:10,xl:'hours',yl:'score',padL:38},A=>xs.map((x,i)=>`<path d="M${A.X(x)-5} ${A.Y(ys[i])-5}l10 10m0 -10l-10 10" class="mf-ink"/>`).join('')+A.fn(x=>m*x+c,'mf-acc',0.5,8.6)+line(A.X(5),A.Y(20),A.X(5),A.Y(m*5+c),'mf-ink mf-dash')+line(A.X(5),A.Y(m*5+c),A.X(0),A.Y(m*5+c),'mf-ink mf-dash')+A.point(5,m*5+c,'≈ '+Math.round(m*5+c),{acc:true,dx:8,dy:16}),'Scatter graph of hours revised and test score','Read from the line of best fit, not from the nearest cross.');},
};
/* two similar right-angled triangles (scale factor 2.5) */
QFIGS.simtri=()=>{const A=[30,125],B=[30,165],C=[90,165],D=[150,65],E=[150,165],F=[300,165];
  let g=poly([A,B,C])+poly([D,E,F])+rightAngle(B,A,C,9)+rightAngle(E,D,F,11);
  g+=text(24,150,'4 cm',{small:true,a:'end'})+text(60,184,'6 cm',{small:true})+text(144,120,'10 cm',{small:true,a:'end'})+text(225,184,'EF = ?',{small:true,acc:true});
  g+=text(30,116,'A',{small:true,bold:true})+text(20,178,'B',{small:true,bold:true})+text(98,178,'C',{small:true,bold:true})+text(150,56,'D',{small:true,bold:true})+text(140,178,'E',{small:true,bold:true})+text(308,178,'F',{small:true,bold:true});
  return fig(svg(330,194,g,{label:'Two similar right-angled triangles'}),'',{notAccurate:true,max:380});};

/* ---------- insertion helpers ---------- */
const sec=id=>document.getElementById('lab-'+id);
const card=(id,k)=>$$('.lcard.hw',sec(id)||document.createElement('div'))[k];
const toQ=q=>({stem:cv(q.stem||'')+(q.fig&&QFIGS[q.fig]?QFIGS[q.fig]():''),parts:q.parts.map(p=>({q:cv(p.q),m:p.m,ms:p.ms.map(([c,t])=>[c,cv(t)]),...(p.ans?{ans:p.ans}:{}),...(p.help?{help:p.help}:{})}))});

/* 1. figures inside the relevant worked examples */
for(const [key,make] of Object.entries(LEARN_FIGS)){const [id,k]=key.split(':'),c=card(id,+k);if(!c)continue;const q=$('.hw-q',c);q.insertAdjacentHTML('beforeend',make());c.classList.add('has-mf');}

/* 2. Foundation scaffolding: key words and step prompts, shown in Foundation and All content */
for(const [id,s] of Object.entries(D.scaffold)){const S=sec(id);if(!S)continue;const first=$('.lcard.hw',S);if(!first)continue;
  const el=document.createElement('div');el.className='lcard fo-only fscaf';
  el.innerHTML=`<h3><span class="kind k-ex">Foundation support</span>Key words and steps</h3><div class="fscaf-cols"><section><h4>Key words</h4><ul class="kp">${s.words.map(w=>{const i=w.indexOf(':');return `<li><b>${w.slice(0,i)}</b>${w.slice(i)}</li>`;}).join('')}</ul></section><section><h4>Step by step</h4><ol class="fscaf-steps">${s.steps.map(t=>`<li>${t}</li>`).join('')}</ol></section></div>`;
  first.before(el);}

/* 3. review lessons: three worked examples and four fill-the-gaps after the summary, then exam questions */
for(const [id,r] of Object.entries(D.reviews)){const S=sec(id);if(!S)continue;const lsec=$('.lsec',S),cards=$$('.lsec > .lcard',S);
  const after=cards.find(c=>/^summary$/i.test(($(':scope > h3',c)||{}).textContent||''))||cards[1];
  const html=r.hand.map(h=>hand(h.title,cv(h.q)+(h.fig&&QFIGS[h.fig]?QFIGS[h.fig]():''),h.lines.map(l=>({m:cv(l.m),n:l.n||'',ans:!!l.ans})),{calc:h.calc?true:false})).join('')+fill('Fill the gaps: mixed review',r.fill.map(f=>({q:f.q,lines:f.lines,why:'Check each value against the method in the worked examples above.'})));
  const box=document.createElement('div');box.innerHTML=html;const nodes=[...box.children];
  if(after&&after.parentNode===lsec)after.after(...nodes);else lsec.prepend(...nodes);
  EXAM.attach(id,{suffix:'-rv',title:'Exam-style questions: review',intro:'Original questions in the style of Edexcel GCSE Maths. Mark schemes are indicative.',qs:r.exam.map(toQ)});}

/* 4. more Foundation-level exam practice */
for(const [id,qs] of Object.entries(D.exams)){if(!sec(id))continue;
  EXAM.attach(id,{suffix:'-fx',title:'More exam practice',intro:'Original Foundation-level questions in the style of Edexcel GCSE Maths. Mark schemes are indicative: credit equivalent correct working.',qs:qs.map(toQ)});}

const st=document.createElement('style');st.textContent='.fscaf-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px 22px}.fscaf h4{margin:0 0 8px}.fscaf-steps{margin:0;padding-left:1.3em}.fscaf-steps li{margin:4px 0}.hw-q .mf{max-width:560px}';document.head.append(st);
})();
