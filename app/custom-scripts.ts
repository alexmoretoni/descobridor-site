import {z} from 'zod';
import {getDb} from '../db';
import {siteSettings} from '../db/schema';
import {eq} from 'drizzle-orm';

const script=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(80),enabled:z.boolean(),src:z.string().max(500).default(''),code:z.string().max(4000).default('')}).strict().superRefine((value,ctx)=>{
 if(!value.src&&!value.code)ctx.addIssue({code:'custom',message:'Informe uma URL HTTPS ou JavaScript.'});
 if(value.src){try{const u=new URL(value.src);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)throw Error();}catch{ctx.addIssue({code:'custom',message:'Use uma URL HTTPS válida, sem usuário, senha ou fragmento.'});}}
 if(/<\/?script\b/i.test(value.code))ctx.addIssue({code:'custom',message:'Cole somente o JavaScript, sem tags <script>.'});
});
export const scriptsSchema=z.array(script).max(5).superRefine((items,ctx)=>{if(new Set(items.map(x=>x.id)).size!==items.length)ctx.addIssue({code:'custom',message:'Identificadores duplicados.'});});
export type CustomScript=z.infer<typeof script>;
export async function customScripts():Promise<CustomScript[]>{const [row]=await getDb().select().from(siteSettings).where(eq(siteSettings.id,'custom-scripts'));try{return scriptsSchema.parse(row?JSON.parse(row.value):[])}catch{return []}}
export async function saveCustomScripts(items:CustomScript[]){const value=scriptsSchema.parse(items);await getDb().insert(siteSettings).values({id:'custom-scripts',value:JSON.stringify(value),updatedAt:new Date().toISOString()}).onConflictDoUpdate({target:siteSettings.id,set:{value:JSON.stringify(value),updatedAt:new Date().toISOString()}});}
