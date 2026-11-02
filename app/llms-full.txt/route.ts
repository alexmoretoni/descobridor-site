import {discoveryPages,llmsFullText} from '../discovery';
export const dynamic='force-dynamic';
export async function GET(){
 return new Response(llmsFullText(await discoveryPages()),{headers:{
  'Content-Type':'text/plain; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Robots-Tag':'noindex, follow',
  'X-Content-Type-Options':'nosniff'
 }});
}
