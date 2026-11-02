import {rawDb,putSetting} from './mcp-control';
import {tables} from './mcp-contract';
import {listPages} from './pages';
import {settings,publicSettings} from './settings';
import {getDb} from '../db';
import {packages} from '../db/schema';

export async function dataOperation(name:string,a:any){const db=rawDb();
 if(name==='list_database_tables')return {tables,excluded:['site_settings (tokens e políticas)','admin_security (credenciais)'],arbitrarySql:false};
 if(name==='get_database_schema'){return Promise.all(tables.map(async table=>({table,columns:(await db.prepare('PRAGMA table_info("'+table+'")').all()).results})));}
 if(name==='read_database_records'||name==='database_backup'){
  if(!tables.includes(a.table))throw Error('Tabela não autorizada.');
  // Avoid snapshots/internal notes, which may contain arbitrary imported content.
  const columns=(await db.prepare('PRAGMA table_info("'+a.table+'")').all<{name:string}>()).results.map(r=>r.name).filter(n=>!['checkout_snapshot','internal_notes','notes'].includes(n));
  const rows=await db.prepare('SELECT '+columns.map(n=>'"'+n+'"').join(',')+' FROM "'+a.table+'" ORDER BY rowid LIMIT ? OFFSET ?').bind(a.limit+1,a.offset).all();
  const more=rows.results.length>a.limit;return {table:a.table,records:rows.results.slice(0,a.limit),nextOffset:more?a.offset+a.limit:null,hasMore:more,format:name==='database_backup'?'logical-page':'records',excludedColumns:['checkout_snapshot','internal_notes','notes'],physicalBackup:false,consistency:'Consulta paginada; alterações concorrentes podem mudar a exportação. Para backup consistente completo, use o provedor D1.'};
 }
 if(name==='get_audit_logs')return (await db.prepare('SELECT id,actor_id,action,record_id,created_at FROM audit_logs ORDER BY created_at DESC,id LIMIT ? OFFSET ?').bind(a.limit,a.offset).all()).results;
 if(name==='run_safe_migration'){
  const key='mcp-migration:'+a.id,existing=await db.prepare('SELECT value FROM site_settings WHERE id=?').bind(key).first<{value:string}>();
  if(existing){if(existing.value!==JSON.stringify(a))throw Error('ID de migração já utilizado com outros argumentos.');return {applied:false,alreadyApplied:true,id:a.id};}
  // Only an optional ext_ column; table/type/column are validated before interpolation.
  await db.batch([db.prepare('ALTER TABLE "'+a.table+'" ADD COLUMN "'+a.column+'" '+a.type),db.prepare('INSERT INTO site_settings(id,value,updated_at) VALUES(?,?,?)').bind(key,JSON.stringify(a),new Date().toISOString())]);return {applied:true,id:a.id};
 }
 if(name==='create_backup'){
  const id=crypto.randomUUID(),snapshot={id,label:a.label,createdAt:new Date().toISOString(),pages:await listPages(),settings:publicSettings(await settings()),products:await getDb().select().from(packages)};
  if(JSON.stringify(snapshot).length>1000000)throw Error('Snapshot excede 1 MB. Use exportação do provedor.');await putSetting('mcp-snapshot:'+id,snapshot);return {id,label:a.label,scope:'pages, public settings, products',physicalBackup:false};
 }
 if(name==='list_versions'){const r=await db.prepare("SELECT value FROM site_settings WHERE id LIKE 'mcp-snapshot:%' ORDER BY updated_at DESC LIMIT 50").all<{value:string}>();return r.results.map(r=>{const v=JSON.parse(r.value);return {id:v.id,label:v.label,createdAt:v.createdAt,pages:v.pages.length,scope:'content snapshot'};});}
 if(name==='rollback_version'){
  const row=await db.prepare('SELECT value FROM site_settings WHERE id=?').bind('mcp-snapshot:'+a.versionId).first<{value:string}>();if(!row)throw Error('Snapshot não encontrado.');const snap=JSON.parse(row.value);
  // Atomic restore; no unrelated records, OAuth grants, policy or history are touched.
  const current=await settings(),now=new Date().toISOString(),stmts=snap.pages.map((p:any)=>db.prepare('INSERT INTO site_settings(id,value,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at').bind('page:'+p.slug,JSON.stringify(p),now));
  stmts.push(db.prepare('UPDATE site_settings SET value=?,updated_at=? WHERE id=?').bind(JSON.stringify({...current,...snap.settings}),now,'general'));
  for(const p of snap.products)stmts.push(db.prepare('INSERT INTO packages(id,kind,name,description,price_cents,bonus_cents,credits,active) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,name=excluded.name,description=excluded.description,price_cents=excluded.price_cents,bonus_cents=excluded.bonus_cents,credits=excluded.credits,active=excluded.active').bind(p.id,p.kind,p.name,p.description,p.priceCents,p.bonusCents,p.credits,p.active));
  if(stmts.length>90)throw Error('Snapshot grande demais para restauração atômica por este recurso.');await db.batch(stmts);return {restored:true,id:snap.id,scope:'Restaura registros presentes no snapshot; registros criados depois são preservados.'};
 }
 throw Error('Operação de dados desconhecida');
}
