import {discoveryPages,sitemapXml} from '../discovery';
export async function GET(){return new Response(sitemapXml(await discoveryPages()),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
