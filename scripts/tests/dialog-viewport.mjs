import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function events(base={}){const listeners=new Map();return Object.assign(base,{addEventListener(k,f){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(f)},removeEventListener(k,f){listeners.get(k)?.delete(f)},emit(k){for(const f of listeners.get(k)||[])f()},count(){return [...listeners.values()].reduce((n,s)=>n+s.size,0)}})}
const classes=new Set(),bodyClasses=new Set(),properties=new Map(),frames=new Map();let frameTop=0,id=0;
const viewport=events({height:780,offsetTop:0});const host=events({location:{origin:'https://site.test'},innerHeight:800,visualViewport:viewport});const win=events({location:{origin:'https://site.test'},innerHeight:800,top:host,frameElement:{getBoundingClientRect:()=>({top:frameTop})}});
const dialog=events({isConnected:true,style:{setProperty(k,v){properties.set(k,v)}},classList:{toggle(k,v){v?classes.add(k):classes.delete(k)}}});
const context={window:win,document:{documentElement:{classList:{add:k=>bodyClasses.add(k),remove:k=>bodyClasses.delete(k)}},body:{classList:{add:k=>bodyClasses.add(k),remove:k=>bodyClasses.delete(k)}}},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:k=>frames.delete(k)};
vm.runInNewContext(fs.readFileSync('public/dialog-viewport.js','utf8'),context);const flush=()=>{for(const [k,f] of [...frames]){frames.delete(k);f()}};
win.fitRegistrationDialog(dialog);assert.equal(properties.get('--registration-top'),'8px');assert.equal(properties.get('--registration-height'),'764px');assert.ok(bodyClasses.has('registrationopen'));
viewport.height=330;viewport.emit('resize');flush();assert.equal(properties.get('--registration-height'),'314px');assert.ok(classes.has('tightviewport'));
viewport.offsetTop=60;viewport.emit('scroll');flush();assert.equal(properties.get('--registration-top'),'68px');assert.equal(properties.get('--registration-height'),'314px');
frameTop=120;host.emit('scroll');flush();assert.equal(properties.get('--registration-top'),'8px');assert.equal(properties.get('--registration-height'),'254px');
viewport.height=780;viewport.offsetTop=0;win.innerHeight=400;win.emit('resize');flush();assert.equal(properties.get('--registration-height'),'384px');
dialog.emit('close');assert.equal(viewport.count()+host.count()+win.count(),0);assert.ok(!bodyClasses.has('registrationopen'));
console.log('PASS: dialog fits above keyboard, follows viewport panning, clips embedded frames and cleans up listeners.');
