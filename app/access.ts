import {env} from 'cloudflare:workers';
import {getChatGPTUser} from './chatgpt-auth';
export async function identity(){const user=await getChatGPTUser();const email=String((env as unknown as Record<string,string>).ADMIN_EMAIL||'').toLowerCase();return {user,admin:!!user&&!!email&&user.email.toLowerCase()===email}}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export async function bodyOf(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)throw Error('Origem não autorizada');if(!request.headers.get('content-type')?.includes('application/json'))throw Error('Formato inválido');const raw=await request.text();if(raw.length>(new URL(request.url).pathname==='/api/dashboard'?200000:20000))throw Error('Conteúdo muito grande');return JSON.parse(raw)}
