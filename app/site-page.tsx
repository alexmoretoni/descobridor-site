import PublicRuntime from './public-runtime';
import {publicCatalog,resolveQuote} from './commerce';
import {settings,publicSettings} from './settings';
import {renderPublicPage,publicPageStyle} from './public-render';
import {publicTemplate} from './public-template.generated';
import {pageOptions} from './page-options';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getPage,pageUrl,type SitePage} from './pages';
import {siteUrl,shareImage,structuredData} from './seo';
export async function pageMetadata(slug:string):Promise<Metadata>{const p=await getPage(slug);if(!p||p.status!=='published')return {title:'Página indisponível | Descobridor',robots:{index:false,follow:false}};const indexable=p.indexable&&(p.template!=='packages'||(await publicCatalog()).length>0);const o=pageOptions(p.options),url=o.canonicalUrl||pageUrl(slug),image=o.socialImage?{url:new URL(o.socialImage,siteUrl).href,alt:o.socialImageAlt||p.name}:shareImage;const google=(await settings()).googleSiteVerification;return {...(slug==='home'&&/^[A-Za-z0-9_-]{10,200}$/.test(google)?{verification:{google}}:{}),title:p.seoTitle,description:p.description,alternates:{canonical:url},robots:{index:indexable,follow:o.robotsFollow,googleBot:{index:indexable,follow:o.robotsFollow,'max-image-preview':'large'}},openGraph:{type:p.template==='article'?'article':'website',...(p.template==='article'?{publishedTime:p.publishedAt,modifiedTime:p.updatedAt,authors:['Descobridor']}:{}),locale:'pt_BR',siteName:'Descobridor',url,title:o.socialTitle||p.seoTitle,description:o.socialDescription||p.description,images:[image]},twitter:{card:o.twitterCard,title:o.socialTitle||p.seoTitle,description:o.socialDescription||p.description,images:[image]}}}
export function pageStructuredData(p:SitePage){const options=pageOptions(p.options),url=options.canonicalUrl||pageUrl(p.slug),image=p.options?.socialImage?new URL(p.options.socialImage,siteUrl).href:null,primaryImageId=image?url+'#primaryimage':siteUrl+'/#primaryimage',showFaq=options.schemaFaq&&options.showFaq&&p.faq.length>0;return {'@context':'https://schema.org','@graph':[
 ...(options.schemaMode==='standard'?structuredData['@graph'].filter(x=>x['@type']!=='WebPage'&&(!image||x['@type']!=='ImageObject')):[]),
 ...(p.template==='article'?[{'@type':'BlogPosting','@id':url+'#article',headline:p.heroTitle,description:p.description,inLanguage:'pt-BR',mainEntityOfPage:{'@id':url+'#page'},author:{'@type':'Organization',name:'Descobridor',url:siteUrl+'/'},publisher:{'@id':siteUrl+'/#organization'},...(image?{image:[image]}:{}),...(p.publishedAt?{datePublished:p.publishedAt}:{}),...(p.updatedAt?{dateModified:p.updatedAt}:{}),citation:(p.sources||[]).map(s=>s.url)}]:[]),
 ...(image?[{'@type':'ImageObject','@id':primaryImageId,url:image,contentUrl:image,caption:p.options?.socialImageAlt||p.name}]:[]),
 {'@type':p.template==='blog'?'CollectionPage':showFaq?['WebPage','FAQPage']:'WebPage','@id':url+'#page',url,name:p.heroTitle.replace(/\n/g,' '),description:p.description,inLanguage:'pt-BR',...(options.schemaMode==='standard'?{publisher:{'@id':siteUrl+'/#organization'},isPartOf:{'@id':siteUrl+'/#website'}}:{}),...(options.schemaMode==='standard'||image?{primaryImageOfPage:{'@id':primaryImageId}}:{}),...(!options.showBreadcrumbs||p.slug==='home'?{}:{breadcrumb:{'@id':url+'#breadcrumb'}}),...(showFaq?{mainEntity:p.faq.map(q=>({'@type':'Question',name:q.question,acceptedAnswer:{'@type':'Answer',text:q.answer}}))}:{})},
 ...(!options.showBreadcrumbs||p.slug==='home'?[]:[{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Início',item:siteUrl+'/'},...(p.template==='article'?[{'@type':'ListItem',position:2,name:'Blog',item:siteUrl+'/blog'}]:[]),{'@type':'ListItem',position:p.template==='article'?3:2,name:options.breadcrumbLabel||p.name,item:url}]}])
]}}
export default async function SitePageView({slug}:{slug:string}){
 const p=await getPage(slug);if(!p||p.status!=='published')notFound();
 const [pages,config,products]=await Promise.all([import('./pages').then(m=>m.listPages()),settings(),p.template==='packages'?publicCatalog():Promise.resolve([])]);
 if(p.template==='consultation'){try{config.reportPriceCents=(await resolveQuote({queryType:p.queryType==='general'?'CPF':p.queryType,pageSlug:p.slug})).amountCents;}catch{/* Checkout displays a precise availability error. */}}
 const publicPages=pages.filter(p=>p.status==='published').map(p=>({slug:p.slug,name:p.name,template:p.template}));
 const bootstrap=JSON.stringify({page:p,pages:publicPages,settings:publicSettings(config),packages:products}).replace(/</g,'\\u003c');
 const graph=pageOptions(p.options).schemaMode==='none'?null:pageStructuredData(p);
 return <><link rel="stylesheet" href={'/'+publicTemplate.cssName}/><style dangerouslySetInnerHTML={{__html:publicPageStyle(p)}}/>{graph&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>}<div className="public-shell" dangerouslySetInnerHTML={{__html:renderPublicPage(p,pages,config,products)}}/><script dangerouslySetInnerHTML={{__html:'window.__PUBLIC_PAGE__='+bootstrap+';window.cmsPage=window.__PUBLIC_PAGE__.page;window.publicSitePages=window.__PUBLIC_PAGE__.pages;'}}/><PublicRuntime src={'/'+publicTemplate.jsName}/></>
}
