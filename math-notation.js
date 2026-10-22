/* Shared plain-text maths notation. This is a converter, never an evaluator. */
(function(root){
 'use strict';
 function normaliseMath(input) {
  const supers='⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺⁽⁾ˣʸⁿᵃᵇᶜᵉᵗᐟ',plain='0123456789-+()xynabcet/';
  return String(input??'').replace(/⁽([^⁾]*)⁾/g,(_,s)=>'^('+[...s].map(c=>supers.includes(c)?plain[supers.indexOf(c)]:c).join('')+')').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺⁽⁾ˣʸⁿᵃᵇᶜᵉᵗᐟ]+/g,s=>{
   const p=[...s].map(c=>plain[supers.indexOf(c)]).join('');
   return /^\([^]*\)$/.test(p)?'^'+p:/^-?\d+$/.test(p)?'^'+p:'^('+p+')';
  }).replace(/[−–]/g,'-').replace(/×/g,'*').replace(/[÷⁄]/g,'/').replace(/π/g,'pi').replace(/√/g,'sqrt').replace(/\*\*/g,'^');
 }
 if(typeof module==='object'&&module.exports)module.exports={normaliseMath};else root.ProdigyMathNotation={normaliseMath};
})(typeof window==='undefined'?globalThis:window);
