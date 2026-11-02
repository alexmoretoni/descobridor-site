import {env} from 'cloudflare:workers';
import {getDb} from '../db';
import {siteSettings} from '../db/schema';
import {eq} from 'drizzle-orm';
import {audit} from './admin-actions';
import {configSchema,defaultConfig} from './mcp-contract';
import {read,write,remove} from './google-oauth';

export const rawDb=()=>{if(!env.DB)throw Error('Banco indisponível');return env.DB;};
export async function config(){const [r]=await getDb().select().from(siteSettings).where(eq(siteSettings.id,'mcp-policy'));if(!r)return defaultConfig;return configSchema.parse({...defaultConfig,...JSON.parse(r.value)});}
export async function putSetting(id:string,value:unknown){await getDb().insert(siteSettings).values({id,value:JSON.stringify(value),updatedAt:new Date().toISOString()}).onConflictDoUpdate({target:siteSettings.id,set:{value:JSON.stringify(value),updatedAt:new Date().toISOString()}});}
function canonical(v:any):string{return JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x);}
export async function payloadHash(name:string,args:unknown){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical({name,args}))))).map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function approvalGate(actor:string,name:string,args:unknown,requestId?:string){
 const hash=await payloadHash(name,args),db=rawDb(),now=new Date().toISOString();
 if(requestId){const used=await db.prepare("UPDATE site_settings SET value=json_set(value,'$.status','executing'),updated_at=? WHERE id=? AND json_extract(value,'$.actor')=? AND json_extract(value,'$.hash')=? AND json_extract(value,'$.status')='approved' AND json_extract(value,'$.expiresAt')>? RETURNING id").bind(now,'mcp-request:'+requestId,actor,hash,now).first();if(!used)throw Error('Aprovação ausente, expirada, já utilizada ou de outros argumentos.');return null;}
 const prior=await db.prepare("SELECT value FROM site_settings WHERE id LIKE 'mcp-request:%' AND json_extract(value,'$.actor')=? AND json_extract(value,'$.hash')=? AND json_extract(value,'$.status')='pending' AND json_extract(value,'$.expiresAt')>? ORDER BY updated_at DESC LIMIT 1").bind(actor,hash,now).first<{value:string}>();
 if(prior){const p=JSON.parse(prior.value);return {status:'approval_required',requestId:p.id,expiresAt:p.expiresAt,message:'Esta operação já aguarda revisão no admin.'};}
 const count=await db.prepare("SELECT count(*) AS n FROM site_settings WHERE id LIKE 'mcp-request:%' AND json_extract(value,'$.status')='pending' AND json_extract(value,'$.expiresAt')>?").bind(now).first<{n:number}>();if((count?.n||0)>=30)throw Error('Revise as solicitações pendentes antes de criar outras.');
 const id=crypto.randomUUID(),expiresAt=new Date(Date.now()+30*60*1000).toISOString();
 await putSetting('mcp-request:'+id,{id,actor,name,args,hash,status:'pending',createdAt:now,expiresAt});await audit(actor,'mcp_approval_requested',id);
 return {status:'approval_required',requestId:id,expiresAt,message:'Revise os argumentos em Admin → Plugin MCP e aprove. Repita a mesma ferramenta e argumentos com approvalId. Nenhuma alteração foi executada.'};
}
export async function finishApproval(id:string,status:'completed'|'failed'){await rawDb().prepare("UPDATE site_settings SET value=json_set(value,'$.status',?),updated_at=? WHERE id=? AND json_extract(value,'$.status')='executing'").bind(status,new Date().toISOString(),'mcp-request:'+id).run();}
export async function requests(){const r=await rawDb().prepare("SELECT value FROM site_settings WHERE id LIKE 'mcp-request:%' ORDER BY updated_at DESC LIMIT 50").all<{value:string}>();return r.results.map(r=>JSON.parse(r.value));}
export async function decide(actor:string,id:string,decision:'approved'|'rejected'){
 const now=new Date().toISOString();const row=await rawDb().prepare("UPDATE site_settings SET value=json_set(value,'$.status',?,'$.reviewedBy',?),updated_at=? WHERE id=? AND json_extract(value,'$.status')='pending' AND json_extract(value,'$.expiresAt')>? RETURNING id").bind(decision,actor,now,'mcp-request:'+id,now).first();if(!row)throw Error('Solicitação indisponível ou expirada.');await audit(actor,'mcp_'+decision,id);
}
export async function githubToken(){const runtime=(env as unknown as Record<string,string>).GITHUB_MCP_TOKEN;if(runtime)return runtime;return (await read('mcp-github-credential'))?.token||'';}
export async function githubConfigured(){return !!await githubToken();}
export async function saveGithubToken(token:string){if(!/^github_pat_[A-Za-z0-9_]{20,240}$/.test(token)&&!/^gh[pousr]_[A-Za-z0-9]{20,240}$/.test(token))throw Error('Token GitHub inválido.');await write('mcp-github-credential',{token});}
export async function removeGithubToken(){await remove('mcp-github-credential');}
