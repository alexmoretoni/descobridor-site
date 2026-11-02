import {getPage,pageUrl} from '../../pages';
import {pageMarkdown} from '../../discovery';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
 const segment=(await params).slug;
 if(!segment.endsWith('.md'))return new Response('Not found',{status:404});
 const slug=segment.slice(0,-3);
 const p=await getPage(slug);
 if(!p||p.status!=='published'||!p.indexable||p.template!=='article'||(p.options?.canonicalUrl&&p.options.canonicalUrl!==pageUrl(slug)))return new Response('Not found',{status:404});
 return new Response(pageMarkdown(p),{headers:{
  'Content-Type':'text/markdown; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Robots-Tag':'noindex, follow',
  'Link':'<'+pageUrl(slug)+'>; rel="canonical"',
  'X-Content-Type-Options':'nosniff'
 }});
}
