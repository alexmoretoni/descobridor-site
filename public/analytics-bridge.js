(()=>{
 const allowed=new Set(['page_view','form_start','form_submit','consulta_iniciada','consulta_concluida']);
 const sent=new Set(),pending=new Map();let flow=0,ready=false;
 const eligible=()=>!clientFlow&&!flowParams.has('editorPreview')&&!['termos','privacidade'].includes(cmsSlug)&&!['#termos','#privacidade'].includes(location.hash);
 const accepted=()=>localStorage.getItem('cc_tracking_consent')==='accepted';
 const page=()=>window.cmsPage?.slug||cmsSlug||'home';
 function flush(){const frame=document.getElementById('analyticsframe');if(!frame||!ready)return;for(const [id,event] of pending)frame.contentWindow.postMessage({type:'descobridor-analytics-event',id,event},location.origin)}
 function ensure(){if(!eligible()||!accepted())return;let frame=document.getElementById('analyticsframe');if(!frame){ready=false;frame=document.createElement('iframe');frame.id='analyticsframe';frame.title='Estatísticas consentidas';frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.referrerPolicy='no-referrer';frame.src='/analytics?page='+encodeURIComponent(page());frame.style.cssText='position:absolute;width:1px;height:1px;border:0;overflow:hidden;pointer-events:none';document.body.append(frame)}flush()}
 window.analyticsTrack=(event)=>{if(!allowed.has(event)||!eligible()||!accepted()||!(publicConfig.ga4Id||publicConfig.gtmId||publicConfig.metaPixelId))return;const id=event+':'+(event==='page_view'||event==='form_start'?0:flow);if(sent.has(id))return;sent.add(id);pending.set(id,event);ensure()};
 window.analyticsBegin=()=>{flow++;window.analyticsTrack('consulta_iniciada')};
 window.addEventListener('message',e=>{const frame=document.getElementById('analyticsframe');if(e.origin!==location.origin||e.source!==frame?.contentWindow)return;if(e.data?.type==='descobridor-analytics-ready'){ready=true;flush()}if(e.data?.type==='descobridor-analytics-ack')pending.delete(e.data.id)});
 window.analyticsFlush=()=>{if(!accepted()||!pending.size)return Promise.resolve();return new Promise(resolve=>{const start=Date.now();const timer=setInterval(()=>{if(!pending.size||Date.now()-start>=300){clearInterval(timer);resolve()}},20)})};
 window.siteAnalyticsConsent=()=>{
  if(!eligible()){document.getElementById('analyticsframe')?.remove();document.getElementById('trackingconsent')?.remove();ready=false;return}
  if(!(publicConfig.ga4Id||publicConfig.gtmId||publicConfig.metaPixelId))return;
  if(accepted()){ensure();window.analyticsTrack('page_view');return}
  document.getElementById('analyticsframe')?.remove();ready=false;pending.clear();sent.clear();
  if(localStorage.getItem('cc_tracking_consent')||['#checkout','#identificacao'].includes(location.hash)||document.getElementById('trackingconsent'))return;
  const box=document.createElement('div');box.id='trackingconsent';box.className='trackingconsent';box.innerHTML='<p>Autoriza ferramentas de análise e publicidade para medir visitas e etapas do pedido? Nenhum dado digitado é enviado nesses eventos.</p><button class="btn" id="accepttracking">Aceitar</button><button class="btn outline" id="rejecttracking">Recusar</button>';document.body.append(box);
  document.getElementById('accepttracking').onclick=()=>{localStorage.setItem('cc_tracking_consent','accepted');box.remove();window.siteAnalyticsConsent()};
  document.getElementById('rejecttracking').onclick=()=>{localStorage.setItem('cc_tracking_consent','rejected');box.remove()};
 };
 document.addEventListener('DOMContentLoaded',()=>document.getElementById('query')?.addEventListener('focus',()=>window.analyticsTrack('form_start'),{once:true}));
})();
