import {pageUrl,type SitePage} from './pages';
export function redirectForUrl(url:URL,pages:SitePage[]):string|null{
 const path=url.pathname==='/'?'/':url.pathname.replace(/\/+$/,'');
 if(path==='/home')return 'https://descobridor.online/'+url.search;
 if(['/data-de-nascimento','/data-de-nascimento.html'].includes(path))return 'https://descobridor.online/descobrir-data-de-nascimento'+url.search;
 const alias=pages.find(p=>p.status==='published'&&(p.redirects||[]).includes(path));
 if(alias)return pageUrl(alias.slug)+url.search;
 const isProduction=['descobridor.online','www.descobridor.online'].includes(url.hostname);
 if(isProduction&&(url.protocol!=='https:'||url.hostname==='www.descobridor.online'))return 'https://descobridor.online'+path+url.search;
 if(path!==url.pathname)return url.origin+path+url.search;
 return null;
}
