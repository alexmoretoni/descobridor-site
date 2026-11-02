import {json} from '../../access';
import {resolveQuote} from '../../commerce';
export async function GET(request:Request){const p=new URL(request.url).searchParams;try{return json(await resolveQuote({queryType:p.get('type')||'CPF',pageSlug:p.get('pageSlug'),productId:p.get('productId')}));}catch(e){return json({error:e instanceof Error?e.message:'Oferta indisponível.'},400);}}
