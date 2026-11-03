'use client';
import {useEffect,useState} from 'react';

const KEY='descobridor-smartlook-consent-v1';
const PROJECT='f5e7479f8e531809a99403ea0d4732d3080a54fc';
type Decision='accepted'|'rejected'|null;
type SmartlookFn=((command:string,...args:unknown[])=>void)&{api?:unknown[][]};
declare global {interface Window {smartlook?:SmartlookFn;__descobridorSmartlookInitialized?:boolean}}
const restricted=/^\/(admin|cliente|checkout|pedido|pedidos|pagamento|login|cadastro|conta|api)(\/|$)/i;
const sensitiveSelector=[
 'form','#searchform','#query','.modal','[role="dialog"]','[aria-modal="true"]',
 '[id*="checkout" i]','[class*="checkout" i]','[id*="pedido" i]','[class*="pedido" i]',
 '[id*="result" i]','[class*="result" i]','[id*="lead" i]','[class*="lead-form" i]',
 '[id*="customer" i]','[class*="customer" i]','[data-private]',
 'input','textarea','select','[contenteditable="true"]'
].join(',');
function sensitivePage(){
 return restricted.test(location.pathname) || Boolean(location.search) || /\/(?:[0-9]{11,}|[A-Za-z0-9_-]{24,})(?:\/|$)/.test(location.pathname);
}
function protectSensitiveDOM(){
 document.querySelectorAll(sensitiveSelector).forEach(node=>node.setAttribute('data-sl','exclude'));
}
function pause(){
 try{window.smartlook?.('pause')}catch{/* Optional SDK may not be loaded. */}
}
function start(){
 if(sensitivePage()) {pause();return;}
 protectSensitiveDOM();
 if(window.__descobridorSmartlookInitialized){window.smartlook?.('resume');return;}
 // Never overwrite an SDK loaded by a tag manager or another integration.
 if(window.smartlook || document.querySelector('script[src*="web-sdk.smartlook.com/recorder.js"]'))return;
 const queue:unknown[][]=[];
 const smartlook=((...args:unknown[])=>{queue.push(args)}) as SmartlookFn;
 smartlook.api=queue;
 window.smartlook=smartlook;
 window.__descobridorSmartlookInitialized=true;
 // Explicitly disable recording of all categories of sensitive information.
 smartlook('init',PROJECT,{region:'eu',cookies:false});
 smartlook('record',{forms:false,emails:false,numbers:false,ips:false});
 const script=document.createElement('script');
 script.id='descobridor-smartlook-sdk';
 script.src='https://web-sdk.smartlook.com/recorder.js';
 script.async=true;
 script.onerror=()=>{window.__descobridorSmartlookInitialized=false;pause()};
 document.head.appendChild(script);
}
export default function SmartlookConsent(){
 const [decision,setDecision]=useState<Decision>(null);
 const [ready,setReady]=useState(false);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const stored=localStorage.getItem(KEY);
  const value:Decision=stored==='accepted'||stored==='rejected'?stored:null;
  setDecision(value);setReady(true);setVisible(!value&&!sensitivePage());
  if(value==='accepted')start();
  const observer=new MutationObserver(()=>{if(window.__descobridorSmartlookInitialized)protectSensitiveDOM()});
  observer.observe(document.documentElement,{subtree:true,childList:true});
  const navigation=()=>{if(sensitivePage())pause();else if(localStorage.getItem(KEY)==='accepted')start()};
  window.addEventListener('popstate',navigation);
  // Consent can also be reset using the site's privacy preference event.
  const preferences=()=>{setVisible(true)};
  window.addEventListener('descobridor:smartlook-preferences',preferences);
  return ()=>{observer.disconnect();window.removeEventListener('popstate',navigation);window.removeEventListener('descobridor:smartlook-preferences',preferences)};
 },[]);
 function decide(value:'accepted'|'rejected'){
  localStorage.setItem(KEY,value);setDecision(value);setVisible(false);
  if(value==='accepted')start();else pause();
 }
 if(!ready||sensitivePage())return null;
 return <>
  {visible&&<aside data-sl="exclude" role="region" aria-label="Preferências de gravação de navegação" style={{position:'fixed',bottom:16,left:16,right:16,maxWidth:560,zIndex:2147483000,margin:'0 auto',background:'#fff',color:'#24202b',border:'1px solid #dcd5e5',borderRadius:14,padding:18,boxShadow:'0 8px 32px #0003',fontFamily:'Arial,sans-serif',fontSize:14,lineHeight:1.55}}>
   <strong style={{fontSize:16}}>Gravação opcional de navegação</strong>
   <p style={{margin:'8px 0 14px'}}>Com sua autorização, usamos o Smartlook para entender cliques e navegação e melhorar o site. Não gravamos campos de formulários, CPF, telefone, e-mail ou dados de pagamento. Você pode recusar e continuar normalmente.</p>
   <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
    <button type="button" onClick={()=>decide('accepted')} style={{background:'#57239b',color:'#fff',padding:'10px 15px',border:0,borderRadius:8,cursor:'pointer'}}>Permitir gravação</button>
    <button type="button" onClick={()=>decide('rejected')} style={{background:'#f2eff6',color:'#24202b',padding:'10px 15px',border:'1px solid #c9c2d0',borderRadius:8,cursor:'pointer'}}>Recusar</button>
   </div>
  </aside>}
  {!visible&&decision!==null&&<button type="button" data-sl="exclude" aria-label="Alterar preferência de gravação Smartlook" onClick={()=>setVisible(true)} style={{position:'fixed',bottom:12,left:12,zIndex:2147482000,fontSize:11,padding:'5px 8px',border:'1px solid #d5cfdd',borderRadius:8,color:'#37303d',background:'#fff',opacity:.85,cursor:'pointer'}}>Privacidade</button>}
 </>;
}
