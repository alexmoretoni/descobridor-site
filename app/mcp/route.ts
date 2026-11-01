import {mcpTools,callMcp} from '../mcp-tools';
export async function POST(request:Request){let id:unknown=null;const response=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'}});try{const raw=await request.text();if(raw.length>200000)return response({jsonrpc:'2.0',id,error:{code:-32600,message:'Solicitação muito grande.'}},413);const b=JSON.parse(raw);if(!b||Array.isArray(b)||b.jsonrpc!=='2.0'||typeof b.method!=='string')return response({jsonrpc:'2.0',id,error:{code:-32600,message:'Solicitação inválida.'}},400);id=b.id??null;if(b.method==='tools/call'&&(id===null||!['string','number'].includes(typeof id)))return response({jsonrpc:'2.0',id:null,error:{code:-32600,message:'tools/call exige um identificador válido.'}},400);if(b.method.startsWith('notifications/'))return new Response(null,{status:202});let result:unknown;
 if(b.method==='server/discover')result={supportedVersions:['2026-07-28'],capabilities:{tools:{}}};
 else if(b.method==='initialize')result={protocolVersion:'2026-07-28',capabilities:{tools:{}},serverInfo:{name:'descobridor-admin',version:'1.0.0'}};
 else if(b.method==='ping')result={};
 else if(b.method==='tools/list')result={tools:mcpTools};
 else if(b.method==='tools/call'){try{const data=await callMcp(b.params?.name,b.params?.arguments??{});result={content:[{type:'text',text:JSON.stringify(data)}]}}catch(e){result={isError:true,content:[{type:'text',text:e instanceof Error?e.message:'Não foi possível executar a ferramenta.'}]}}}
 else return response({jsonrpc:'2.0',id,error:{code:-32601,message:'Método não encontrado.'}});
 return response({jsonrpc:'2.0',id,result});
 }catch{return response({jsonrpc:'2.0',id,error:{code:-32700,message:'JSON inválido.'}},400)}}
