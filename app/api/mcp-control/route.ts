import {identity,json,bodyOf} from '../../access';
import {hasAdminSession} from '../../admin-security';
import {config,putSetting,requests,decide,saveGithubToken,removeGithubToken} from '../../mcp-control';
import {configSchema} from '../../mcp-contract';
import {mcpTools} from '../../mcp-tools';
import {capabilityReport} from '../../mcp-extension';
import {audit} from '../../admin-actions';
import {gh} from '../../mcp-github';
export const dynamic='force-dynamic';
async function guard(){const {user,admin}=await identity();if(!user||!admin||!await hasAdminSession(user.userId))throw Error('Entre com sua senha administrativa.');return user;}
export async function GET(){try{await guard();return json({config:await config(),capabilities:await capabilityReport(mcpTools.map(t=>t.name)),requests:await requests()});}catch{return json({error:'Acesso administrativo obrigatório.'},403);}}
export async function POST(request:Request){try{const user=await guard(),b=await bodyOf(request);
 if(b.action==='githubCredential'){if(typeof b.token!=='string')throw Error('Token obrigatório.');await saveGithubToken(b.token.trim());await audit(user.userId,'mcp_github_credential_saved','encrypted');return json({ok:true});}
 if(b.action==='removeGithubCredential'){await removeGithubToken();await audit(user.userId,'mcp_github_credential_removed','encrypted');return json({ok:true,message:'Credencial do admin removida; segredo de runtime, se existir, é mantido.'});}
 if(b.action==='config'){const c=configSchema.parse(b.config);if(c.disabledTools.some(n=>!mcpTools.some(t=>t.name===n)))throw Error('Ferramenta inválida.');await putSetting('mcp-policy',c);await audit(user.userId,'mcp_config_saved','policy');return json({ok:true});}
 if(b.action==='decision'){if(typeof b.id!=='string'||!/^[a-f0-9-]{36}$/i.test(b.id)||!['approved','rejected'].includes(b.decision))throw Error('Decisão inválida.');await decide(user.userId,b.id,b.decision);return json({ok:true});}
 if(b.action==='testGithub'){const c=await config(),repo=await gh('');return json({ok:true,repository:c.repository,permissions:repo.permissions,visibility:repo.visibility});}
 return json({error:'Ação inválida.'},400);
 }catch(e){return json({error:e instanceof Error?e.message:'Falha no controle MCP.'},400);}}
