import {discoveryPages,llmsText} from '../discovery';
export async function GET(){return new Response(llmsText(await discoveryPages()),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
