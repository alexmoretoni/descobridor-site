import {bodyOf,json} from '../../access';
import {getDb} from '../../../db';
import {customers} from '../../../db/schema';
import {eq} from 'drizzle-orm';
export const runtime='edge';
const cookie='descobridor_customer';
async function current(request:Request){
 const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookie+'='))?.slice(cookie.length+1)||'';
 if(!/^[a-f0-9-]{36}$/.test(token))return null;
 const [record]=await getDb().select().from(customers).where(eq(customers.id,'registration-'+token)).limit(1);
 return record||null;
}
export async function GET(request:Request){try{const c=await current(request);return json(c?{registered:true,name:c.name,email:c.email,phone:c.phone}:{registered:false});}catch{return json({registered:false})}}
export async function POST(request:Request){try{
 const b=await bodyOf(request),name=String(b.name||'').trim(),phone=String(b.phone||'').replace(/\D/g,''),email=String(b.email||'').trim().toLowerCase();
 if(name.length<3||name.length>100||!/^(?:55)?[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(phone)||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||b.consent!==true)return json({error:'Confira nome, telefone com DDD, e-mail e a autorização.'},400);
 const existing=await current(request);if(existing)return json({registered:true,name:existing.name,email:existing.email,phone:existing.phone});
 const token=crypto.randomUUID(),now=new Date().toISOString();
 await getDb().insert(customers).values({id:'registration-'+token,userId:null,name,email,phone,createdAt:now,updatedAt:now});
 return Response.json({registered:true,name,email,phone},{headers:{'Cache-Control':'no-store','Set-Cookie':cookie+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000'}});
 }catch{return json({error:'Não foi possível concluir o cadastro.'},400)}}
