import {env} from 'cloudflare:workers';
import {identity,json,bodyOf} from '../../access';
import {hasAdminSession} from '../../admin-security';
import {accessToken} from '../../google-oauth';
async function admin(){const {user,admin}=await identity();return user&&admin&&await hasAdminSession(user.userId)?user:null}
const pattern=/^\d{10}$/;
export async function GET(){
 const user=await admin();if(!user)return json({error:'Acesso administrativo necessário.'},403);
 const e=env as unknown as Record<string,string>;
 return json({configured:!!e.GOOGLE_ADS_DEVELOPER_TOKEN,needsCustomerId:true,readOnly:true,requiredScope:'https://www.googleapis.com/auth/adwords'});
}
export async function POST(request:Request){
 const user=await admin();if(!user)return json({error:'Acesso administrativo necessário.'},403);
 try{
  const body=await bodyOf(request);const customerId=String(body.customerId||'').replace(/-/g,'');
  const loginCustomerId=String(body.loginCustomerId||'').replace(/-/g,'');
  if(!pattern.test(customerId)||(loginCustomerId&&!pattern.test(loginCustomerId)))return json({error:'Informe um ID Google Ads de 10 dígitos (e opcionalmente o ID MCC).'},400);
  const developerToken=(env as unknown as Record<string,string>).GOOGLE_ADS_DEVELOPER_TOKEN;
  if(!developerToken)return json({error:'Configure GOOGLE_ADS_DEVELOPER_TOKEN nos segredos do servidor. Não coloque o token no navegador.'},503);
  const token=await accessToken(user.userId);
  const headers:Record<string,string>={'Authorization':'Bearer '+token,'developer-token':developerToken,'Content-Type':'application/json'};
  if(loginCustomerId)headers['login-customer-id']=loginCustomerId;
  const query="SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.cost_micros DESC LIMIT 100";
  const response=await fetch('https://googleads.googleapis.com/v26/customers/'+customerId+'/googleAds:searchStream',{method:'POST',headers,body:JSON.stringify({query}),signal:AbortSignal.timeout(20000)});
  const result:any=await response.json().catch(()=>({}));
  if(!response.ok){const msg=String(result.error?.message||'Falha ao consultar Google Ads. Verifique OAuth com escopo adwords, token e permissões da conta.');return json({error:msg.slice(0,400)},response.status===401?401:400)}
  const batches=Array.isArray(result)?result:[],rows=batches.flatMap((x:any)=>Array.isArray(x.results)?x.results:[]);
  const campaigns=rows.map((r:any)=>{const m=r.metrics||{},cost=Number(m.costMicros||0)/1000000,clicks=Number(m.clicks||0),conversions=Number(m.conversions||0),value=Number(m.conversionsValue||0);return {id:String(r.campaign?.id||''),name:String(r.campaign?.name||''),status:String(r.campaign?.status||''),impressions:Number(m.impressions||0),clicks,cost,conversions,value,cpc:clicks?cost/clicks:0,cpa:conversions?cost/conversions:null,roas:cost?value/cost:null}});
  return json({range:'LAST_30_DAYS',currency:'BRL',currencyNote:'Confirme que a moeda da conta de anúncios é BRL.',campaigns,readOnly:true,generatedAt:new Date().toISOString()});
 }catch(e){return json({error:'Não foi possível consultar Google Ads. Confira a conexão e tente novamente.'},503)}
}
