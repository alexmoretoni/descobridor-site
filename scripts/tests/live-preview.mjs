import vm from 'node:vm';import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const ctx={};vm.createContext(ctx);vm.runInContext(readFileSync('public/live-preview.js','utf8'),ctx);const p=ctx.LivePreview;
assert.equal(p.count(()=>0),2);assert.equal(p.count(()=>.999999),7);for(let i=0;i<100;i++){const n=p.count();assert.ok(n>=2&&n<=7);}
for(const k of ['addresses','family','phones','work','email']){const rows=p.examples(k,7);assert.equal(rows.length,7);assert.ok(rows.every(r=>r.length===2&&r.every(s=>typeof s==='string'&&s.length>0)));}
assert.ok(p.examples('email',2).every(r=>r[0].endsWith('@exemplo.invalid')));assert.match(p.examples('addresses',2)[0][0],/Exemplo/);assert.match(p.examples('family',2)[0][0],/fictícia/);
console.log('PASS: preview counts stay between 2 and 7; example records remain fictitious and contain no live personal data.');
