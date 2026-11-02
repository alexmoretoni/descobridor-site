import {mcpEnabled} from './mcp-policy';
import {identity} from './access';
import {getDb} from '../db';
import {siteSettings,packages} from '../db/schema';
import {eq} from 'drizzle-orm';
import {listPages,getPage} from './pages';
import {settings,publicSettings} from './settings';
import {dashboardPost} from './dashboard-api';
import {read,connectionId,reportsFor} from './google-oauth';
import {audit} from './admin-actions';
import {extensionTools,extensionCall,controlledCall} from './mcp-extension';
const str={type:'string'};
const schema=(properties:Record<string,unknown>={},required:string[]=[])=>({type:'object',properties,required,additionalProperties:false});
const tool=(name:string,description:string,inputSchema:ReturnType<typeof schema>,write=false)=>({name,description:description+(write?' Ações sensíveis podem retornar approval_required; aprove no admin e repita com approvalId.':''),inputSchema:{...inputSchema,properties:{...inputSchema.properties,approvalId:{type:'string'}}},annotations:{readOnlyHint:!write,destructiveHint:write,idempotentHint:!write,openWorldHint:name==='google_reports'}});
export const mcpTools=[
 tool('capabilities','Descreve o alcance real e as limitações deste MCP.',schema()),
 tool('page_history','Consulta versões anteriores de uma página para recuperação.',schema({slug:str},['slug'])),
 tool('update_google_integrations','Atualiza IDs e configurações Google validados pelo admin; não recebe credenciais OAuth.',schema({settings:{type:'object',additionalProperties:true}},['settings']),true),
 tool('update_order_status','Atualiza o andamento de um pedido existente.',schema({id:str,status:{enum:['awaiting_contact','in_progress','completed','cancelled']}},['id','status']),true),
 tool('list_pages','Lista páginas e artigos do Descobridor, incluindo rascunhos. Não inclui dados de clientes.',schema()),
 tool('get_page','Lê o conteúdo completo e SEO de uma página para edição. Leia antes de alterar.',schema({slug:str},['slug'])),
 tool('save_page','Cria ou atualiza página/artigo com as mesmas validações e histórico do admin. Envie o objeto completo retornado por get_page, alterando somente o necessário. status draft salva rascunho; published publica imediatamente. Para editar passe originalSlug. Não suporta scripts arbitrários.',schema({page:{type:'object',description:'Objeto SitePage completo, conforme get_page.',additionalProperties:true},originalSlug:str},['page']),true),
 tool('list_products','Lista produtos e pacotes atuais com preços em centavos.',schema()),
 tool('save_product','Cria ou altera produto/pacote. Valores monetários em centavos. Para editar, preserve o id existente.',schema({id:str,name:str,description:str,kind:{enum:['product','package']},priceCents:{type:'integer',minimum:0},bonusCents:{type:'integer',minimum:0},credits:{type:'integer',minimum:0},active:{type:'boolean'}},['name','description','kind','priceCents','bonusCents','credits','active']),true),
 tool('get_public_settings','Lê contatos e configurações públicas do site, sem segredos ou tokens.',schema()),
 tool('google_connection_status','Informa se a identidade administrativa tem uma conta Google conectada. Não revela credenciais.',schema()),
 tool('google_reports','Consulta relatórios reais de Search Console e GA4 dos últimos 28 dias nas propriedades já selecionadas pelo administrador. Exige conexão OAuth prévia. Não altera propriedades ou campanhas.',schema())
,...extensionTools];

export async function callMcp(name:string,args:unknown){
 const {user,admin}=await identity();if(!user||!admin)throw Error('Somente a identidade administrativa autorizada pode usar estas ferramentas.');
 if(!mcpTools.some(t=>t.name===name))throw Error('Ferramenta desconhecida.');
 return controlledCall(name,args,user.userId,mcpTools.map(t=>t.name),a=>extensionTools.some(t=>t.name===name)?extensionCall(name,a,user.userId):legacyCall(name,a));
}

async function legacyCall(name:string,args:unknown){const {user,admin}=await identity();if(!user||!admin)throw Error('Somente a identidade administrativa autorizada pode usar estas ferramentas.');if(!await mcpEnabled())throw Error('MCP desativado no painel administrativo.');const def=mcpTools.find(t=>t.name===name);if(!def)throw Error('Ferramenta desconhecida.');if(!args||typeof args!=='object'||Array.isArray(args))throw Error('Argumentos inválidos.');const a=args as Record<string,any>,spec=def.inputSchema as ReturnType<typeof schema>;if(Object.keys(a).some(k=>!Object.hasOwn(spec.properties,k))||spec.required.some(k=>!Object.hasOwn(a,k)))throw Error('Confira os campos obrigatórios e permitidos.');
 if(name==='list_pages')return (await listPages()).map(p=>({slug:p.slug,name:p.name,status:p.status,template:p.template,seoTitle:p.seoTitle,updatedAt:p.updatedAt}));
 if(name==='get_page'){if(typeof a.slug!=='string')throw Error('Slug inválido.');const p=await getPage(a.slug);if(!p)throw Error('Página não encontrada.');return p}
 if(name==='list_products')return getDb().select().from(packages);
 if(name==='get_public_settings')return publicSettings(await settings());
 if(name==='capabilities')return {version:2,tools:mcpTools.map(t=>({name:t.name,readOnly:t.annotations.readOnlyHint})),authentication:'administrative identity',sourceCode:false,filesystem:false,arbitrarySql:false,deployment:false,notes:'Código-fonte e build exigem uma integração com repositório e executor. Alterações de páginas publicadas entram em vigor imediatamente.'};
 if(['page_history','update_google_integrations','update_order_status'].includes(name)){
 const action=name==='page_history'?'pageHistory':name==='update_google_integrations'?'googleIntegrations':'orderStatus';
 if(name==='page_history'&&typeof a.slug!=='string')throw Error('Slug inválido.');
 if(name==='update_google_integrations'&&(!a.settings||typeof a.settings!=='object'||Array.isArray(a.settings)))throw Error('Configurações inválidas.');
 if(name==='update_order_status'&&(typeof a.id!=='string'||!['awaiting_contact','in_progress','completed','cancelled'].includes(a.status)))throw Error('Pedido ou status inválido.');
 const response=await dashboardPost(new Request('https://descobridor.online/api/dashboard',{method:'POST',headers:{origin:'https://descobridor.online','Content-Type':'application/json'},body:JSON.stringify({...a,action})}),user.userId);
 const result:any=await response.json();if(!response.ok)throw Error(result.error||'Operação recusada.');await audit(user.userId,'mcp_'+name,String(a.slug||a.id||'google'));return result;
 }
 if(name==='google_connection_status'){const c=await read(connectionId(user.userId));return {connected:!!c,connectedAt:c?.connectedAt||null}}
 if(name==='google_reports')return reportsFor(user.userId);
 if(name==='save_page'||name==='save_product'){if(name==='save_page'&&(!a.page||typeof a.page!=='object'||Array.isArray(a.page)))throw Error('Página inválida.');if(name==='save_product'&&typeof a.active!=='boolean')throw Error('active deve ser booleano.');const body=name==='save_page'?{action:'page',page:a.page,originalSlug:a.originalSlug}:{...a,action:'package'};const response=await dashboardPost(new Request('https://descobridor.online/api/dashboard',{method:'POST',headers:{origin:'https://descobridor.online','Content-Type':'application/json'},body:JSON.stringify(body)}),user.userId);const result:any=await response.json();if(!response.ok)throw Error(result.error||'Alteração recusada.');await audit(user.userId,'mcp_'+name,name==='save_page'?String(a.page.slug):String(a.id||'new'));return result}
 throw Error('Ferramenta indisponível.');
}
