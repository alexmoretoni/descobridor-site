import {identity,json,bodyOf} from '../../access';
import {hasAdminSession} from '../../admin-security';
import {readCustomScripts,saveCustomScripts,scriptsSchema} from '../../custom-scripts';
import {audit} from '../../admin-actions';
async function guard(){
 const {user,admin}=await identity();
 return user&&admin&&await hasAdminSession(user.userId)?user:null;
}
export async function GET(){
 if(!await guard())return json({error:'Acesso administrativo obrigatório.'},403);
 try{return json(await readCustomScripts())}
 catch{return json({error:'Não foi possível ler os scripts.'},503)}
}
export async function POST(request:Request){
 const user=await guard();
 if(!user)return json({error:'Acesso administrativo obrigatório.'},403);
 const body=await bodyOf(request,145000).catch(()=>null);
 if(!body||(body.revision!==null&&(typeof body.revision!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(body.revision)||!Number.isFinite(Date.parse(body.revision)))))return json({error:'Recarregue o painel e confira a origem e o formato do pedido.'},400);
 const parsed=scriptsSchema.safeParse(body.scripts);
 if(!parsed.success)return json({error:parsed.error.issues[0].message},400);
 let revision;
 try{revision=await saveCustomScripts(parsed.data,body.revision)}
 catch{return json({error:'Não foi possível salvar os scripts.'},503)}
 if(!revision)return json({error:'A lista mudou em outra sessão. Reabra a aba e revise a versão atual.'},409);
 await audit(user.userId,'custom_scripts_saved',String(parsed.data.length)).catch(()=>{});
 return json({scripts:parsed.data,revision});
}
