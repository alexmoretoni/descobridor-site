import {z} from 'zod';
import {eq,like} from 'drizzle-orm';
import {getDb} from '../db';
import {packages,siteSettings} from '../db/schema';
import {settings} from './settings';
import {getPage} from './pages';

export const queryTypes=['CPF','CNPJ','Nome','Telefone','CEP','Veículo'] as const;
const cents=z.number().int().min(0).max(100000000);
const queryType=z.enum(queryTypes);
export const productInput=z.object({id:z.string().min(1).max(79).optional(),kind:z.enum(['product','package','plan']),name:z.string().trim().min(1).max(80),description:z.string().trim().max(500),priceCents:cents,bonusCents:cents.default(0),credits:z.number().int().min(0).max(100000000).default(0),active:z.boolean(),visible:z.boolean(),queryTypes:z.array(queryType).min(1).max(6)}).strict();
export const ruleInput=z.object({pageSlug:z.string().regex(/^[a-z0-9-]{1,100}$/).nullable(),queryType:z.enum(['all',...queryTypes]),mode:z.enum(['price','product']),priceCents:cents.optional(),productId:z.string().min(1).max(79).optional()}).strict().superRefine((v,c)=>{if(!v.pageSlug&&v.queryType==='all')c.addIssue({code:'custom',message:'Escolha uma página ou um tipo.'});if(v.mode==='price'&&v.priceCents===undefined||v.mode==='product'&&!v.productId)c.addIssue({code:'custom',message:'Informe o preço ou o produto.'});});
export type PriceRule=z.infer<typeof ruleInput>;
export type ProductMeta={visible:boolean;queryTypes:string[]};
export const metaKey=(id:string)=>'commerce-product:'+id;
export const ruleKey=(r:Pick<PriceRule,'pageSlug'|'queryType'>)=>'commerce-rule:'+(r.pageSlug||'*')+':'+r.queryType;
export async function commerceData(){
 const [products,rows]=await Promise.all([getDb().select().from(packages),getDb().select().from(siteSettings).where(like(siteSettings.id,'commerce-%'))]);
 const metadata:Record<string,ProductMeta>={},rules:PriceRule[]=[];
 for(const row of rows){try{const v=JSON.parse(row.value);if(row.id.startsWith('commerce-product:'))metadata[row.id.slice(17)]=z.object({visible:z.boolean(),queryTypes:z.array(queryType).min(1)}).parse(v);else if(row.id.startsWith('commerce-rule:'))rules.push(ruleInput.parse(v));}catch{throw Error('Configuração comercial inválida. Revise os produtos no admin.');}}
 return {products:products.map(p=>({...p,visible:metadata[p.id]?.visible??true,queryTypes:metadata[p.id]?.queryTypes??[...queryTypes]})),rules};
}
export async function publicCatalog(){return (await commerceData()).products.filter(p=>p.active&&p.visible);}
export function chooseRule(rules:PriceRule[],type:string,pageSlug:string|null){return rules.find(r=>r.pageSlug===pageSlug&&!!pageSlug&&r.queryType===type)||rules.find(r=>r.pageSlug===pageSlug&&!!pageSlug&&r.queryType==='all')||rules.find(r=>r.pageSlug===null&&r.queryType===type);}
export async function resolveQuote(input:{queryType:string;pageSlug?:string|null;productId?:string|null}){
 if(!queryTypes.includes(input.queryType as typeof queryTypes[number]))throw Error('Tipo de consulta inválido.');
 const [data,config,page]=await Promise.all([commerceData(),settings(),input.pageSlug?getPage(input.pageSlug):Promise.resolve(null)]);
 if(input.pageSlug&&(!page||page.status!=='published'))throw Error('Página indisponível.');
 const pageSlug=page?.slug||null,rule=chooseRule(data.rules,input.queryType,pageSlug),pinned=rule?.mode==='product'?rule.productId:null;
 if(pinned&&input.productId&&input.productId!==pinned)throw Error('Esta página utiliza outro produto. Atualize o checkout.');
 const productId=pinned||input.productId||null,product=productId?data.products.find(p=>p.id===productId):null;
 if(productId&&(!product||!product.active||!product.queryTypes.includes(input.queryType)||!pinned&&!product.visible))throw Error('Produto indisponível para esta consulta.');
 const baseAmountCents=rule?.mode==='price'?rule.priceCents!:config.reportPriceCents;
 const amountCents=product?.priceCents??baseAmountCents;
 const name=product?.name||'Relatório por '+input.queryType;
 const signature=JSON.stringify([input.queryType,pageSlug,productId,amountCents,name,rule||null]);
 const quoteKey=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(signature))),b=>b.toString(16).padStart(2,'0')).join('');
 return {amountCents,baseAmountCents,productId,name,quoteKey,currency:'BRL',source:rule?(rule.pageSlug?'page':'type'):'default',pinned:!!pinned,offers:data.products.filter(p=>p.active&&p.queryTypes.includes(input.queryType)&&(pinned?p.id===pinned:p.visible)).map(p=>({id:p.id,name:p.name,kind:p.kind,description:p.description,priceCents:p.priceCents,credits:p.credits}))};
}
