import {getPage,listPages} from '../../pages';import {json} from '../../access';
export async function GET(request:Request){const slug=new URL(request.url).searchParams.get('slug');if(slug){const p=await getPage(slug);return p&&p.status==='published'?json({page:p}):json({error:'Página indisponível.'},404)}return json({pages:(await listPages()).filter(p=>p.status==='published')})}
