import {z} from 'zod';
import {getDb} from '../db';
import {siteSettings} from '../db/schema';
import {and,eq} from 'drizzle-orm';

export const tidioSrc='https://code.tidio.co/fclewtlrwrgnuzqzajk10e8qsutvxpjc.js';

const script=z.object({
 id:z.string().uuid(),name:z.string().trim().min(1).max(80),enabled:z.boolean(),
 src:z.string().trim().default('').transform(value=>value.startsWith('//')?'https:'+value:value).pipe(z.string().max(500)),
 code:z.string().max(4000).default(''),
}).strict().superRefine((value,ctx)=>{
 if(!value.src&&!value.code)ctx.addIssue({code:'custom',message:'Informe uma URL HTTPS ou JavaScript.'});
 if(value.src){try{const u=new URL(value.src);if(!/^https:\/\//i.test(value.src)||u.username||u.password||u.port||u.hash)throw Error();}catch{ctx.addIssue({code:'custom',message:'Use uma URL HTTPS válida, sem usuário, senha ou fragmento.'});}}
 if(/<\/?script\b/i.test(value.code))ctx.addIssue({code:'custom',message:'Cole somente o JavaScript, sem tags <script>.'});
});
export const scriptsSchema=z.array(script).max(5).superRefine((items,ctx)=>{
 if(new Set(items.map(x=>x.id)).size!==items.length)ctx.addIssue({code:'custom',message:'Identificadores duplicados.'});
});
export type CustomScript=z.infer<typeof script>;
export function isTidioScript(value:CustomScript){
 const code=value.code.replace(/\s/g,'');
 return value.src===tidioSrc||code.includes(tidioSrc.replace(/\s/g,''));
}

export async function readCustomScripts(){
 const [row]=await getDb().select().from(siteSettings).where(eq(siteSettings.id,'custom-scripts'));
 const revision=row?.updatedAt??null;
 try{
  // A malformed entry must not disable other tags.
  const stored:unknown=row?JSON.parse(row.value):[];
  const scripts=Array.isArray(stored)?stored.slice(0,5).flatMap(item=>{
   const parsed=script.safeParse(item);
   return parsed.success?[parsed.data]:[];
  }):[];
  return {scripts,revision};
 }catch{return {scripts:[],revision}}
}

export async function customScripts(){return (await readCustomScripts()).scripts}

export async function saveCustomScripts(scripts:CustomScript[],revision:string|null){
 const value=JSON.stringify(scripts);
 const updatedAt=new Date(Math.max(Date.now(),revision?Date.parse(revision)+1:0)).toISOString();
 const db=getDb();
 const rows=revision===null
  ?await db.insert(siteSettings).values({id:'custom-scripts',value,updatedAt}).onConflictDoNothing().returning({updatedAt:siteSettings.updatedAt})
  :await db.update(siteSettings).set({value,updatedAt})
    .where(and(eq(siteSettings.id,'custom-scripts'),eq(siteSettings.updatedAt,revision))).returning({updatedAt:siteSettings.updatedAt});
 return rows[0]?.updatedAt??null;
}
