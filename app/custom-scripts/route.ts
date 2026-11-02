import {customScripts} from '../custom-scripts';
import {getPage} from '../pages';
export async function GET(request:Request){
 const page=new URL(request.url).searchParams.get('page')||'home',p=await getPage(page);
 if(!p||p.status!=='published'||['termos','privacidade'].includes(p.slug))return new Response(null,{status:404,headers:{'X-Robots-Tag':'noindex'}});
 const scripts=(await customScripts()).filter(x=>x.enabled);
 const data=JSON.stringify(scripts.map(({src,code})=>({src,code}))).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
 const html=`<!doctype html><html lang="pt-BR"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Scripts autorizados</title><script>const entries=${data};for(const entry of entries){if(entry.src){const s=document.createElement('script');s.src=entry.src;s.async=true;document.head.append(s)}if(entry.code){const s=document.createElement('script');s.textContent=entry.code;document.head.append(s)}}</script></html>`;
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex,nofollow','Content-Security-Policy':"sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline' https:; connect-src https:; img-src https: data:; frame-ancestors 'self'"}});
}
