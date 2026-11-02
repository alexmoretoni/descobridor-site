import {publicCatalog} from './commerce';
import {listPages,pageUrl,type SitePage} from './pages';
export function eligiblePages(pages:SitePage[],hasProducts:boolean){return pages.filter(p=>p.status==='published'&&p.indexable&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)&&(p.template!=='packages'||hasProducts)&&(!p.options?.canonicalUrl||p.options.canonicalUrl===pageUrl(p.slug))).sort((a,b)=>a.slug.localeCompare(b.slug))}
export async function discoveryPages(){const [pages,products]=await Promise.all([listPages(),publicCatalog()]);return eligiblePages(pages,products.length>0)}
export const xmlEscape=(value:string)=>value.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export function sitemapXml(pages:SitePage[]){return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>'<url><loc>'+xmlEscape(pageUrl(p.slug))+'</loc>'+(p.updatedAt&&Number.isFinite(Date.parse(p.updatedAt))?'<lastmod>'+new Date(p.updatedAt).toISOString()+'</lastmod>':'')+'</url>').join('')+'</urlset>'}
const line=(s:string)=>s.replace(/[\r\n\t]+/g,' ').replace(/[\\[\]<>]/g,'').trim();
export function llmsText(pages:SitePage[]){const groups:[string,SitePage[]][]=[['Blog e guias',pages.filter(p=>['blog','article'].includes(p.template))],['Páginas de atendimento',pages.filter(p=>p.template==='consultation')],['Informações institucionais',pages.filter(p=>['content','packages'].includes(p.template))]];return '# Descobridor\n\n> Plataforma brasileira de solicitações de atendimento cadastral e guias informativos. Idioma: português do Brasil (pt-BR).\n\nDomínio canônico: https://descobridor.online\n\nO site registra solicitações para atendimento. O envio de um formulário não realiza busca automática em bases externas nem confirma dados encontrados. A disponibilidade, as fontes e as condições são confirmadas antes da contratação. Os guias distinguem serviços oficiais gratuitos e atendimento particular.\n\nEste índice complementar reúne apenas páginas públicas elegíveis para indexação. As páginas vinculadas são as fontes completas; este arquivo não garante inclusão em buscadores ou respostas de IA.\n\n'+groups.filter(([,items])=>items.length).map(([title,items])=>'## '+title+'\n\n'+items.map(p=>'- ['+line(p.name)+']('+pageUrl(p.slug)+'): '+line(p.description)+(p.template==='article'?' ([versão Markdown](https://descobridor.online/ai/'+p.slug+'.md))':'')).join('\n')).join('\n\n')+'\n\n## Recursos técnicos\n\n- [Sitemap XML](https://descobridor.online/sitemap.xml): URLs canônicas públicas.\n- [Robots.txt](https://descobridor.online/robots.txt): Diretrizes de rastreamento.\n- [Textos integrais públicos](https://descobridor.online/llms-full.txt): Versões em Markdown para sistemas que as utilizem.\n'}


// Auxiliary public Markdown representations. HTML remains the canonical resource.
export function pageMarkdown(p:SitePage):string{
 const url=pageUrl(p.slug);
 const chunks:string[]=[
  '# '+line(p.heroTitle),
  '',
  '> Guia informativo do Descobridor. A página HTML é a versão canônica: '+url,
  '',
  'Idioma: pt-BR',
  'Fonte original: '+url,
  ...(p.publishedAt?['Publicado em: '+p.publishedAt]:[]),
  ...(p.updatedAt?['Atualizado em: '+p.updatedAt]:[]),
  '',
  line(p.heroDescription)
 ];
 for(const section of p.sections){
  chunks.push('','## '+line(section.title),'');
  if(section.image)chunks.push('!['+line(section.imageAlt||section.title)+']('+section.image+')','');
  for(const paragraph of section.paragraphs)chunks.push(paragraph,'');
  for(const sub of section.subheadings||[]){
   chunks.push('### '+line(sub.title),'');
   for(const paragraph of sub.paragraphs)chunks.push(paragraph,'');
  }
 }
 if(p.faq.length){
  chunks.push('','## Perguntas frequentes','');
  for(const f of p.faq)chunks.push('### '+line(f.question),'',f.answer,'');
 }
 if(p.sources?.length){
  chunks.push('','## Fontes e leituras relacionadas','');
  for(const source of p.sources)chunks.push('- ['+line(source.label)+']('+source.url+')');
 }
 chunks.push('','---','Fonte canônica: '+url,'Sitemap: https://descobridor.online/sitemap.xml');
 return chunks.join('\n').trim()+'\n';
}
export function llmsFullText(pages:SitePage[]):string{
 const articles=pages.filter(p=>p.template==='article');
 return '# Descobridor — artigos públicos em texto integral\n\n'
 + '> Índice auxiliar para sistemas que leem conteúdo em Markdown. As páginas HTML vinculadas são canônicas; não há garantia de indexação por qualquer serviço.\n\n'
 + 'Sitemap XML: https://descobridor.online/sitemap.xml\n'
 + 'Índice resumido: https://descobridor.online/llms.txt\n\n'
 + articles.map(pageMarkdown).join('\n\n---\n\n');
}
