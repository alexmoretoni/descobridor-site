(()=>{
 const onReady=fn=>{if(document.readyState&&document.readyState!=='loading')queueMicrotask(fn);else document.addEventListener('DOMContentLoaded',fn,{once:true});};
 const allowed=new Set(['page_view','form_start','form_submit','consulta_iniciada','consulta_concluida']);
 const sent=new Set(),pending=new Map();let flow=0,ready=false;
 const eligible=()=>!clientFlow&&!flowParams.has('editorPreview')&&!['termos','privacidade'].includes(cmsSlug)&&!['#termos','#privacidade'].includes(location.hash);
 const accepted=()=>localStorage.getItem('cc_tracking_consent')==='accepted';
 const page=()=>window.cmsPage?.slug||cmsSlug||'home';
 let tidioScheduled=false;
 function ensureTidio(){
  if(!publicConfig.tidioEnabled||tidioScheduled||document.getElementById('tidio-chat-code')||['admin','cliente'].includes((location.pathname.split('/')[1]||''))||['termos','privacidade'].includes(cmsSlug))return;
  tidioScheduled=true;
  const run=()=>{tidioScheduled=false;if(!publicConfig.tidioEnabled||document.getElementById('tidio-chat-code'))return;const script=document.createElement('script');script.id='tidio-chat-code';script.src='https://code.tidio.co/fclewtlrwrgnuzqzajk10e8qsutvxpjc.js';script.async=true;document.body.append(script)};
  if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(run,{timeout:1800});else setTimeout(run,300);
 }
 function flush(){const frame=document.getElementById('analyticsframe');if(!frame||!ready)return;for(const [id,event] of pending)frame.contentWindow.postMessage({type:'descobridor-analytics-event',id,event},location.origin)}
 function ensure(){if(!eligible()||!accepted())return;let frame=document.getElementById('analyticsframe');if(!frame){ready=false;frame=document.createElement('iframe');frame.id='analyticsframe';frame.title='Estatísticas consentidas';frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.referrerPolicy='no-referrer';frame.src='/analytics?page='+encodeURIComponent(page());frame.style.cssText='position:absolute;width:1px;height:1px;border:0;overflow:hidden;pointer-events:none';document.body.append(frame)}flush()}
 const footerAllowed=()=>publicConfig.customScriptsEnabled&&eligible()&&accepted()&&!['#checkout','#identificacao'].includes(location.hash);
 let footerScheduled=false;
 function footerScripts(){
  if(!footerAllowed()){document.getElementById('customscriptsframe')?.remove();return}
  if(footerScheduled||document.getElementById('customscriptsframe'))return;
  footerScheduled=true;
  const schedule=()=>{
   const run=()=>{
    footerScheduled=false;
    if(!footerAllowed()||document.getElementById('customscriptsframe'))return;
    const footer=document.getElementById('footer-integrations')||document.body;
    const frame=document.createElement('iframe');
    frame.id='customscriptsframe';frame.title='Scripts de acompanhamento';frame.hidden=true;
    frame.setAttribute('sandbox','allow-scripts');frame.referrerPolicy='no-referrer';
    frame.src='/custom-scripts?page='+encodeURIComponent(page());footer.append(frame);
   };
   if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(run,{timeout:1800});
   else setTimeout(run,300);
  };
  if(document.readyState==='complete')schedule();
  else window.addEventListener('load',schedule,{once:true});
 }
 window.analyticsTrack=(event)=>{if(!allowed.has(event)||!eligible()||!accepted()||!(publicConfig.ga4Id||publicConfig.gtmId||publicConfig.metaPixelId))return;const id=event+':'+(event==='page_view'||event==='form_start'?0:flow);if(sent.has(id))return;sent.add(id);pending.set(id,event);ensure()};
 window.analyticsBegin=()=>{flow++;window.analyticsTrack('consulta_iniciada')};
 window.addEventListener('message',e=>{const frame=document.getElementById('analyticsframe');if(e.origin!==location.origin||e.source!==frame?.contentWindow)return;if(e.data?.type==='descobridor-analytics-ready'){ready=true;flush()}if(e.data?.type==='descobridor-analytics-ack')pending.delete(e.data.id)});
 window.analyticsFlush=()=>{if(!accepted()||!pending.size)return Promise.resolve();return new Promise(resolve=>{const start=Date.now();const timer=setInterval(()=>{if(!pending.size||Date.now()-start>=300){clearInterval(timer);resolve()}},20)})};
 window.siteAnalyticsConsent=()=>{
  ensureTidio();
  footerScripts();
  if(!eligible()){document.getElementById('analyticsframe')?.remove();document.getElementById('trackingconsent')?.remove();ready=false;return}
  const analytics=publicConfig.ga4Id||publicConfig.gtmId||publicConfig.metaPixelId;
  if(!analytics)document.getElementById('analyticsframe')?.remove();
  if(!(analytics||publicConfig.customScriptsEnabled))return;
  if(accepted()){if(analytics){ensure();window.analyticsTrack('page_view')}return}
  document.getElementById('analyticsframe')?.remove();ready=false;pending.clear();sent.clear();
  if(localStorage.getItem('cc_tracking_consent')||['#checkout','#identificacao'].includes(location.hash)||document.getElementById('trackingconsent'))return;
  const box=document.createElement('div');box.id='trackingconsent';box.className='trackingconsent';box.innerHTML='<p>Autoriza ferramentas de análise e publicidade para medir visitas e etapas do pedido? Nenhum dado digitado é enviado nesses eventos.</p><button class="btn" id="accepttracking">Aceitar</button><button class="btn outline" id="rejecttracking">Recusar</button>';document.body.append(box);
  document.getElementById('accepttracking').onclick=()=>{localStorage.setItem('cc_tracking_consent','accepted');box.remove();window.siteAnalyticsConsent()};
  document.getElementById('rejecttracking').onclick=()=>{localStorage.setItem('cc_tracking_consent','rejected');box.remove()};
 };
 onReady(()=>document.getElementById('query')?.addEventListener('focus',()=>window.analyticsTrack('form_start'),{once:true}));
})();
