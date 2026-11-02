import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),{build}=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const temp=mkdtempSync(join(tmpdir(),'mcp-tests-')),db=new DatabaseSync(':memory:');
for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+f,'utf8'));
class Statement{constructor(sql){this.sql=sql;this.params=[];}bind(...p){this.params=p;return this;}async all(){return {results:db.prepare(this.sql).all(...this.params),success:true};}async first(){return (await this.all()).results[0]||null;}async run(){const v=db.prepare(this.sql).run(...this.params);return {success:true,meta:{changes:v.changes}};}async raw(){return (await this.all()).results.map(r=>Object.values(r));}}
globalThis.__mcpEnv={ADMIN_EMAIL:'admin@example.com',GOOGLE_TOKEN_ENCRYPTION_KEY:'A'.repeat(43),DB:{prepare(sql){return new Statement(sql);},async batch(stmts){db.exec('BEGIN');try{const r=[];for(const s of stmts)r.push(await s.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}}};
globalThis.__mcpHeaders=new Headers({'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'admin@example.com'});
const plugin={name:'runtime-mock',setup(b){b.onResolve({filter:/^(cloudflare:workers|next\/headers|next\/navigation)$/},a=>({path:a.path,namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:a.path==='cloudflare:workers'?'export const env=globalThis.__mcpEnv':a.path==='next/headers'?'export async function headers(){return globalThis.__mcpHeaders}':'export function redirect(p){throw Error(p)}',loader:'js'}));}};
async function bundle(entry,n){const outfile=join(temp,n+'.mjs');await build({entryPoints:[entry],outfile,platform:'node',format:'esm',bundle:true,plugins:[plugin],logLevel:'silent'});return import(pathToFileURL(outfile));}
const realFetch=globalThis.fetch;
try{
 const mcp=await bundle('app/mcp-tools.ts','tools'),control=await bundle('app/mcp-control.ts','control'),contract=await bundle('app/mcp-contract.ts','contract');
 assert.equal(new Set(mcp.mcpTools.map(t=>t.name)).size,mcp.mcpTools.length);assert.ok(mcp.mcpTools.length>=40);
 for(const p of ['../secret','.env','app/../../x','C:\\secret','app/.env.local','.git/config'])assert.equal(contract.sourcePath.safeParse(p).success,false);
 assert.equal(contract.branch.safeParse('descobridor-site').success,false);assert.equal(contract.branch.safeParse('mcp/feature').success,true);
 assert.equal(contract.extensionSchemas.run_safe_migration.safeParse({id:'x',table:'admin_security',column:'ext_safe',type:'TEXT'}).success,false);
 await assert.rejects(()=>mcp.callMcp('read_database_records',{table:'site_settings'}));
 const report=await mcp.callMcp('capabilities',{});assert.equal(report.github.configured,false);assert.equal(report.limits.arbitrarySql,false);
 await assert.rejects(()=>mcp.callMcp('get_repository_status',{}),/GITHUB_MCP_TOKEN/);
 const input={id:'add-label',table:'orders',column:'ext_label',type:'TEXT'};
 const pending=await mcp.callMcp('run_safe_migration',input);assert.equal(pending.status,'approval_required');assert.equal(db.prepare('PRAGMA table_info(orders)').all().some(r=>r.name==='ext_label'),false);
 await control.decide('owner',pending.requestId,'approved');
 await assert.rejects(()=>mcp.callMcp('run_safe_migration',{...input,column:'ext_different',approvalId:pending.requestId}));
 const applied=await mcp.callMcp('run_safe_migration',{...input,approvalId:pending.requestId});assert.equal(applied.applied,true);
 await assert.rejects(()=>mcp.callMcp('run_safe_migration',{...input,approvalId:pending.requestId}));
 const req=await mcp.callMcp('delete_source_file',{branch:'mcp/test',path:'app/test.ts',sha:'a'.repeat(40),message:'Delete'});await control.decide('owner',req.requestId,'rejected');await assert.rejects(()=>mcp.callMcp('delete_source_file',{branch:'mcp/test',path:'app/test.ts',sha:'a'.repeat(40),message:'Delete',approvalId:req.requestId}));
 const expired=await mcp.callMcp('run_safe_migration',{...input,id:'expired',column:'ext_expired'});db.prepare("UPDATE site_settings SET value=json_set(value,'$.expiresAt','2000-01-01T00:00:00.000Z') WHERE id=?").run('mcp-request:'+expired.requestId);await assert.rejects(()=>control.decide('owner',expired.requestId,'approved'));
 await control.putSetting('mcp-policy',{...contract.defaultConfig,disabledTools:['list_pages']});await assert.rejects(()=>mcp.callMcp('list_pages',{}),/bloqueada/);
 await control.putSetting('mcp-policy',{...contract.defaultConfig,enabled:false});await assert.rejects(()=>mcp.callMcp('get_database_schema',{}),/desativado/);await control.putSetting('mcp-policy',contract.defaultConfig);
 globalThis.__mcpHeaders=new Headers({'oai-authenticated-user-id':'customer','oai-authenticated-user-email':'customer@example.com'});await assert.rejects(()=>mcp.callMcp('list_database_tables',{}),/administrativa/);globalThis.__mcpHeaders=new Headers({'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'admin@example.com'});
 await control.saveGithubToken('github_pat_'+'A'.repeat(40));assert.equal(await control.githubConfigured(),true);assert.ok(!db.prepare("SELECT value FROM site_settings WHERE id='mcp-github-credential'").get().value.includes('github_pat_'));assert.equal((await mcp.callMcp('capabilities',{})).github.configured,true);assert.ok(!JSON.stringify(await mcp.callMcp('capabilities',{})).includes('github_pat_'));await control.removeGithubToken();assert.equal(await control.githubConfigured(),false);
 globalThis.__mcpEnv.GITHUB_MCP_TOKEN='mock-token';let calls=[];
 globalThis.fetch=async(url,options)=>{calls.push({url:String(url),options});assert.ok(String(url).startsWith('https://api.github.com/repos/alexmoretoni/descobridor-site/'));assert.equal(options.headers.Authorization,'Bearer mock-token');if(String(url).includes('/git/ref/heads/'))return Response.json({object:{sha:'a'.repeat(40)}});if(String(url).includes('/dispatches'))return new Response(null,{status:204});throw Error('Unexpected URL');};
 await assert.rejects(()=>mcp.callMcp('run_build',{branch:'mcp/test',sha:'b'.repeat(40)}),/SHA/);assert.equal(calls.length,1);calls=[];
 const queued=await mcp.callMcp('run_build',{branch:'mcp/test',sha:'a'.repeat(40)});assert.equal(queued.status,'accepted');assert.equal(JSON.parse(calls[1].options.body).ref,'descobridor-site');assert.equal(JSON.parse(calls[1].options.body).inputs.source_sha,'a'.repeat(40));
 await assert.rejects(()=>mcp.callMcp('create_preview_deployment',{branch:'mcp/test',sha:'a'.repeat(40)}),/não configurado/);
 const api=await bundle('app/api/mcp-control/route.ts','api');assert.equal((await api.GET()).status,403);
 console.log('PASS: MCP authorization, strict inputs, path/branch bounds, approval hash/identity/expiry/replay, atomic migration, per-tool policy, missing dependencies, exact-SHA workflow dispatch, password-protected admin.');
}finally{globalThis.fetch=realFetch;db.close();rmSync(temp,{recursive:true,force:true});delete globalThis.__mcpEnv;delete globalThis.__mcpHeaders;}
