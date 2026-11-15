import {config,githubToken} from './mcp-control';
import {branch as branchSchema} from './mcp-contract';
export async function gh(path:string,method='GET',body?:unknown){
 const token=await githubToken();if(!token)throw Error('Configure GITHUB_MCP_TOKEN na hospedagem ou conecte com token pelo admin. A conexão GitHub do chat não é uma credencial do servidor.');
 const c=await config();const r=await fetch('https://api.github.com/repos/'+c.repository+path,{method,redirect:'manual',signal:AbortSignal.timeout(20000),headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','User-Agent':'Descobridor-MCP','Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 if(r.status>=300&&r.status<400)throw Error('O GitHub redirecionou a requisição. Confira se o proprietário e o nome atual do repositório estão corretos.');
 if(r.status===401)throw Error('O GitHub rejeitou a credencial (HTTP 401). Verifique o token do servidor em Admin → Plugin MCP.');
 if(r.status===403)throw Error('O GitHub bloqueou a operação (HTTP 403). Confira as permissões do token, as restrições da conta e o limite da API.');
 if(r.status===404)throw Error('O GitHub não encontrou o recurso (HTTP 404). Confira o repositório, a branch e o acesso do token.');
 if(!r.ok)throw Error('GitHub recusou a operação (HTTP '+r.status+').');if(r.status===204)return {accepted:true};return r.json() as Promise<any>;
}
const enc=encodeURIComponent;
export const toBase64=(s:string)=>{const bytes=new TextEncoder().encode(s);let binary='';for(const b of bytes)binary+=String.fromCharCode(b);return btoa(binary);};
export async function githubOperation(name:string,a:any){const c=await config(),main=c.productionBranch;
 if(name==='list_build_runs'){const r=await gh('/actions/runs?per_page=30'+(a.sha?'&head_sha='+a.sha:''));return r.workflow_runs.map((r:any)=>({runId:r.id,name:r.name,status:r.status,conclusion:r.conclusion,sha:r.head_sha,url:r.html_url}));}
 if(name==='get_repository_status'){const [repo,head]=await Promise.all([gh(''),gh('/git/ref/heads/'+enc(main))]);return {repository:c.repository,visibility:repo.visibility,branch:main,sha:head.object.sha,permissions:repo.permissions};}
 if(name==='list_source_files'){const tree=await gh('/git/trees/'+enc(a.ref||main)+'?recursive=1');return {files:tree.tree.filter((f:any)=>f.type==='blob'&&f.path.startsWith(a.prefix)).map((f:any)=>({path:f.path,sha:f.sha,size:f.size})),truncated:!!tree.truncated};}
 if(name==='read_source_file'){const f=await gh('/contents/'+a.path.split('/').map(enc).join('/')+'?ref='+enc(a.ref||main));if(f.type!=='file'||f.encoding!=='base64'||f.size>150000)throw Error('A leitura exige arquivo de texto de até 150 KB.');const bytes=Uint8Array.from(atob(f.content.replace(/\s/g,'')),c=>c.charCodeAt(0));return {path:f.path,sha:f.sha,content:new TextDecoder('utf-8',{fatal:true}).decode(bytes)};}
 if(name==='create_branch')return gh('/git/refs','POST',{ref:'refs/heads/'+a.branch,sha:a.fromSha});
 if(['write_source_file','create_source_file','delete_source_file'].includes(name)){branchSchema.parse(a.branch);return gh('/contents/'+a.path.split('/').map(enc).join('/'),name==='delete_source_file'?'DELETE':'PUT',{branch:a.branch,message:a.message,...(a.sha?{sha:a.sha}:{}),...(name==='delete_source_file'?{}:{content:toBase64(a.content)})});}
 if(name==='create_commit'){
  if(new Set(a.files.map((f:any)=>f.path)).size!==a.files.length)throw Error('Caminhos duplicados.');
  const head=await gh('/git/ref/heads/'+enc(a.branch));if(head.object.sha!==a.expectedSha)throw Error('A branch mudou. Leia o HEAD e refaça a comparação.');
  const parent=await gh('/git/commits/'+a.expectedSha),tree=await gh('/git/trees','POST',{base_tree:parent.tree.sha,tree:a.files.map((f:any)=>({path:f.path,mode:'100644',type:'blob',...(f.content===null?{sha:null}:{content:f.content})}))});
  const commit=await gh('/git/commits','POST',{message:a.message,tree:tree.sha,parents:[a.expectedSha]});await gh('/git/refs/heads/'+enc(a.branch),'PATCH',{sha:commit.sha,force:false});return {sha:commit.sha,branch:a.branch};
 }
 if(name==='create_pull_request')return gh('/pulls','POST',{title:a.title,body:a.body,head:a.branch,base:main,draft:true});
 if(name==='compare_changes')return gh('/compare/'+enc(main)+'...'+enc(a.branch));
 if(['get_build_logs','get_deployment_status'].includes(name)){const run=await gh('/actions/runs/'+a.runId),jobs=await gh('/actions/runs/'+a.runId+'/jobs?per_page=100');return {runId:run.id,status:run.status,conclusion:run.conclusion,sha:run.head_sha,url:run.html_url,jobs:jobs.jobs.map((j:any)=>({name:j.name,status:j.status,conclusion:j.conclusion,steps:j.steps,url:j.html_url})),logs:'Logs completos disponíveis no link do GitHub.'};}
 if(['run_typecheck','run_tests','run_build','create_preview_deployment','publish_approved_version','rollback_deployment'].includes(name)){
  const checks=name.startsWith('run_'),preview=name==='create_preview_deployment',workflow=checks?c.checksWorkflow:preview?c.previewWorkflow:c.productionWorkflow;
  if(!workflow)throw Error('Workflow de '+(preview?'preview':'produção')+' não configurado em Admin → Plugin MCP. O deploy do Sites exige integração própria.');
  const ref=a.branch||main,head=await gh('/git/ref/heads/'+enc(ref));if((checks||preview)&&head.object.sha!==a.sha)throw Error('SHA diverge do HEAD da branch.');
  if(!checks&&!preview){const cmp=await gh('/compare/'+a.sha+'...'+enc(main));if(!['ahead','identical'].includes(cmp.status))throw Error('Publicação exige commit presente no histórico da branch principal.');}
  await gh('/actions/workflows/'+enc(workflow)+'/dispatches','POST',{ref:main,inputs:{operation:name,source_ref:ref,source_sha:a.sha}});
  return {status:'accepted',workflow,sha:a.sha,url:'https://github.com/'+c.repository+'/actions',message:'Workflow solicitado. Consulte a execução para confirmar conclusão; isto ainda não confirma build ou deploy.'};
 }
 throw Error('Operação GitHub desconhecida');
}
