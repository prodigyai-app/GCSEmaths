const {test}=require('node:test');
const assert=require('node:assert/strict');
const MF=require('../maths-figs.js');
const num=(s,attr)=>[...s.matchAll(new RegExp(attr+'="(-?[\\d.]+)"','g'))].map(m=>+m[1]);
const balanced=s=>{const open=(s.match(/<(svg|g|text|figure|figcaption)\b/g)||[]).length,close=(s.match(/<\/(svg|g|text|figure|figcaption)>/g)||[]).length;return open===close;};

test('svg wrapper has a viewBox, role and accessible name, and escapes text',()=>{
 const s=MF.svg(200,100,MF.text(10,10,'a<b & c'),{label:'A & B'});
 assert.match(s,/viewBox="0 0 200 100"/);assert.match(s,/role="img"/);assert.match(s,/aria-label="A &amp; B"/);
 assert.match(s,/a&lt;b &amp; c/);assert.ok(balanced(s));
});
test('labels carry the halo class and colours come from theme variables',()=>{
 assert.match(MF.text(0,0,'x'),/class="mf-t"/);
 assert.match(MF.CSS,/paint-order:stroke/);
 for(const v of ['--ink','--accent','--sunk'])assert.ok(MF.CSS.includes('var('+v),v);
 assert.ok(!/#000\b|black/.test(MF.CSS.replace(/var\([^)]*\)/g,'')),'no hard-coded black outside fallbacks');
});
test('right-angle mark sits on both rays at the requested size',()=>{
 const s=MF.rightAngle([100,100],[200,100],[100,0],10);
 const pts=s.match(/points="([^"]+)"/)[1].split(' ').map(p=>p.split(',').map(Number));
 assert.deepEqual(pts,[[110,100],[110,90],[100,90]]);
});
test('equal-length ticks and parallel arrows are drawn at the midpoint in the requested number',()=>{
 const t=MF.ticks([0,0],[100,0],2);assert.equal((t.match(/<line/g)||[]).length,2);
 const xs=num(t,'x1');assert.ok(xs.every(x=>Math.abs(x-50)<=5));
 const p=MF.parallel([0,0],[0,100],3);assert.equal((p.match(/<polyline/g)||[]).length,3);
});
test('angle arc chooses the smaller angle and labels it',()=>{
 const s=MF.angle([0,0],[10,0],[0,10],20,'90°');assert.match(s,/A20 20 0 0 1 0 20/);assert.match(s,/90°/);
 const r=MF.angle([0,0],[10,0],[0,-10],20);assert.match(r,/0 0 0 0 -20/);
});
test('axes map coordinates linearly and include requested labels',()=>{
 const A=MF.axes({w:300,h:200,x:[-2,4],y:[-1,5],xl:'x',yl:'y',grid:true});
 assert.equal(A.X(-2),34);assert.ok(Math.abs(A.X(4)-282)<1e-9);assert.equal(A.Y(-1),172);assert.ok(Math.abs(A.Y(5)-18)<1e-9);
 assert.ok(A.X(1)>A.X(0)&&A.Y(1)<A.Y(0));
 assert.match(A.svg,/>x<\/text>/);assert.match(A.svg,/>y<\/text>/);
 const f=A.fn(x=>x*x);assert.match(f,/^<path d="M/);
 const sh=A.shadeBetween(x=>x,()=>0,0,2);assert.match(sh,/mf-fill/);
});
test('function curves break where the function leaves the window',()=>{
 const A=MF.axes({x:[-3,3],y:[-3,3]});const d=A.fn(x=>1/x).match(/d="([^"]+)"/)[1];
 assert.ok((d.match(/M/g)||[]).length>=2,'asymptote splits the path');
});
test('number line marks, ranges and jump arrows',()=>{
 const N=MF.numberLine({min:0,max:10,step:1,labelEvery:5,marks:[{v:3.7,label:'3.7',acc:true}],arrows:[{from:0,to:5,label:'+5'}],range:{a:2,b:6,openB:true}});
 assert.ok(N.X(0)<N.X(10));assert.match(N.svg,/>3.7</);assert.match(N.svg,/>\+5</);assert.match(N.svg,/mf-open/);
 assert.match(N.svg,/>5<\/text>/);assert.ok(!/>4<\/text>/.test(N.svg),'only every 5th tick is labelled');
});
test('bar model draws one box per unit and scales to the longest row',()=>{
 const B=MF.barModel({w:400,labelW:60,rows:[{label:'A',parts:[{n:3,text:'3 parts',acc:true}]},{label:'B',parts:[{n:5}]}]});
 const boxes=(B.svg.match(/<rect[^>]*mf-ink/g)||[]).length;assert.equal(boxes,8);
 const widths=num(B.svg,'width');assert.ok(widths.every(v=>Math.abs(v-(400-60-16)/5)<0.11));
});
test('figure wrapper adds the not-accurately-drawn caption on request',()=>{
 const f=MF.fig(MF.svg(10,10,''),'Triangle ABC',{notAccurate:true});
 assert.match(f,/Diagram NOT accurately drawn\./);assert.match(f,/Triangle ABC/);assert.ok(balanced(f));
 assert.ok(!/NOT accurately/.test(MF.fig(MF.svg(10,10,''),'x')));
});
