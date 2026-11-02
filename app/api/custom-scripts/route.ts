import {identity,json,bodyOf} from '../../access';
import {hasAdminSession} from '../../admin-security';
import {customScripts,saveCustomScripts,scriptsSchema} from '../../custom-scripts';
import {audit} from '../../admin-actions';
async function guard(){const {user,admin}=await identity();if(!user||!admin||!await hasAdminSession(user.userId))throw Error('Acesso administrativo obrigatório.');return user;}
export async function GET(){try{await guard();return json({scripts:await customScripts()})}catch{return json({error:'Acesso administrativo obrigatório.'},403)}}
export async function POST(request:Request){try{const user=await guard(),body=await bodyOf(request),items=scriptsSchema.parse(body.scripts);await saveCustomScripts(items);await audit(user.userId,'custom_scripts_saved',String(items.length));return json({ok:true})}catch(e){return json({error:e instanceof Error?e.message:'Não foi possível salvar os scripts.'},400)}}
