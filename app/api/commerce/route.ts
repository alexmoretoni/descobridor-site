import {eq} from 'drizzle-orm';
import {getDb} from '../../../db';
import {packages,siteSettings,auditLogs} from '../../../db/schema';
import {identity,json,bodyOf} from '../../access';
import {hasAdminSession} from '../../admin-security';
import {commerceData,productInput,ruleInput,metaKey,ruleKey} from '../../commerce';
import {getPage,listPages} from '../../pages';
import {settings} from '../../settings';
async function actor(){const {user,admin}=await identity();return user&&admin&&await hasAdminSession(user.userId)?user:null;}
export async function GET(){if(!await actor())return json({error:'Entre novamente no admin.',adminLoginRequired:true},403);return json({...await commerceData(),pages:(await listPages()).map(p=>({slug:p.slug,name:p.name})),defaultPriceCents:(await settings()).reportPriceCents});}
export async function POST(request:Request){
 const user=await actor();if(!user)return json({error:'Entre novamente no admin.',adminLoginRequired:true},403);
 try{
  const b=await bodyOf(request),db=getDb(),now=new Date().toISOString();
  const audit=(action:string,recordId:string)=>db.insert(auditLogs).values({id:crypto.randomUUID(),actorId:user.userId,action,recordId,createdAt:now});
  const put=(id:string,value:unknown)=>db.insert(siteSettings).values({id,value:JSON.stringify(value),updatedAt:now}).onConflictDoUpdate({target:siteSettings.id,set:{value:JSON.stringify(value),updatedAt:now}});
  if(b.action==='product'){
   const {visible,queryTypes,...p}=productInput.parse(b.product),row={...p,id:p.id||crypto.randomUUID(),active:p.active?1:0};
   // D1 batch commits the item, its visibility and the audit event together.
   await db.batch([db.insert(packages).values(row).onConflictDoUpdate({target:packages.id,set:row}),put(metaKey(row.id),{visible,queryTypes}),audit('commerce_product_saved',row.id)]);
   return json({ok:true,id:row.id});
  }
  if(b.action==='rule'||b.action==='removeRule'){
   const rule=ruleInput.parse(b.rule),id=ruleKey(rule);
   if(b.action==='removeRule'){await db.batch([db.delete(siteSettings).where(eq(siteSettings.id,id)),audit('commerce_rule_removed',id)]);return json({ok:true});}
   if(rule.pageSlug&&!await getPage(rule.pageSlug))throw Error('Página não encontrada. Salve a página antes de definir o preço.');
   if(rule.mode==='product'){const product=(await commerceData()).products.find(p=>p.id===rule.productId);if(!product||!product.active)throw Error('Escolha um produto ativo.');if(rule.queryType!=='all'&&!product.queryTypes.includes(rule.queryType))throw Error('Habilite este tipo de consulta no produto.');}
   await db.batch([put(id,rule),audit('commerce_rule_saved',id)]);return json({ok:true});
  }
  return json({error:'Ação inválida.'},400);
 }catch(e){return json({error:e instanceof Error&&e.name!=='ZodError'?e.message:'Confira preço, nome, tipos e disponibilidade.'},400);}
}
