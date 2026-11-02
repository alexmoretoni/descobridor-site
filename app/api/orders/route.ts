import {resolveQuote} from '../../commerce';
import {getPage} from '../../pages';
import {identity} from '../../access';
import {settings} from '../../settings';
import { env } from 'cloudflare:workers';
import { getDb } from '../../../db';
import { orders, leads, packages, customers } from '../../../db/schema';
import { eq } from 'drizzle-orm';
export async function POST(request: Request) {
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return Response.json({error:'Origem não autorizada.'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Formato inválido.'},{status:415});
 if(Number(request.headers.get('content-length')||0)>4096)return Response.json({error:'Pedido muito grande.'},{status:413});
 let body; try{const raw=await request.text();if(raw.length>4096)throw Error();body=JSON.parse(raw)}catch{return Response.json({error:'Pedido inválido.'},{status:400})}
 const delivery=body.deliveryFlow==='whatsapp';
 const name=String(body.name||'').trim()||(delivery?'Nome não informado':''),phone=String(body.phone||'').replace(/\D/g,''),email=String(body.email||'').trim();
 const key=String(body.idempotencyKey||'');
 const validEmail=delivery&&!email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 if(delivery&&!/^(?:55)?[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(phone))return Response.json({error:'Informe um telefone válido com DDD.'},{status:400});
 if(name.length<3||name.length>100||!validEmail||email.length>254||!/^(55)?\d{10,11}$/.test(phone)||body.consent!==true||!/^[a-f0-9-]{36}$/i.test(key))return Response.json({error:delivery?'Confira o telefone com DDD e a autorização de contato.':'Confira nome, telefone com DDD, e-mail e autorização de contato.'},{status:400});
 const type=['CPF','CNPJ','Nome','Telefone','CEP','Veículo'].includes(body.queryType)?body.queryType:'CPF';
 const masked=type==='Nome'?'Nome protegido':/^(?:\*{3}\.\*{3}\.\*{3}-\d{2}|\(\*{2}\) \*{5}-\*{2}\d{2}|Placa \*{3}-\*{2}[A-Z0-9]{2})$/.test(body.queryMasked)?body.queryMasked:'Identificador oculto';
 try{
 const {user}=await identity();const db=getDb();const config=await settings();const page=typeof body.pageSlug==='string'?await getPage(body.pageSlug):null;const pageSlug=page?.status==='published'?page.slug:null;let quote;try{quote=await resolveQuote({queryType:type,pageSlug,productId:typeof body.productId==='string'?body.productId:null});}catch(e){return Response.json({error:e instanceof Error?e.message:'Oferta indisponível.'},{status:400});}const [previous]=await db.select().from(orders).where(eq(orders.idempotencyKey,key)).limit(1);if(!previous&&body.quoteKey&&body.quoteKey!==quote.quoteKey)return Response.json({error:'O preço desta oferta mudou. Feche e abra o checkout para confirmar o valor atualizado.',priceChanged:true},{status:409});const {amountCents,productId}=quote;const id='CC-'+crypto.randomUUID().slice(0,8).toUpperCase();const now=new Date().toISOString();
 await db.insert(orders).values({id,userId:user?.userId||null,idempotencyKey:key,demo:0,name,phone,email,queryType:type,queryMasked:masked,consentAt:now,createdAt:now,amountCents,productId,checkoutSnapshot:JSON.stringify({name,phone,email,queryType:type,queryMasked:masked,consent:true,consentAt:now,amountCents,productId,productName:quote.name,pricingSource:quote.source,pageSlug,pageName:pageSlug?page?.name:null,source:pageSlug?'checkout_pagina:'+pageSlug:body.source==='nascimento'?'checkout_nascimento':body.source==='localizar_cpf'?'checkout_localizar_cpf':'checkout'})}).onConflictDoNothing({target:orders.idempotencyKey});
 const [record]=await db.select().from(orders).where(eq(orders.idempotencyKey,key)).limit(1);
 if(!record)return Response.json({error:'Não foi possível registrar. Tente novamente.'},{status:503});
 await db.insert(leads).values({id:crypto.randomUUID(),eventKey:/^[a-f0-9-]{36}$/i.test(body.leadKey||'')?'draft-'+body.leadKey:'order-'+key,userId:user?.userId||null,name,phone,email,source:pageSlug?'checkout_pagina:'+pageSlug:body.source==='nascimento'?'checkout_nascimento':body.source==='localizar_cpf'?'checkout_localizar_cpf':'checkout',queryType:type,queryMasked:masked,createdAt:now}).onConflictDoUpdate({target:leads.eventKey,set:{name,email,phone,source:pageSlug?'checkout_pagina:'+pageSlug:body.source==='nascimento'?'checkout_nascimento':body.source==='localizar_cpf'?'checkout_localizar_cpf':'checkout'}});
 const customerId=record.customerId||(record.userId?'account-'+record.userId:'checkout-'+record.id);await db.insert(customers).values({id:customerId,userId:record.userId,name:record.name,email:record.email,phone:record.phone,createdAt:record.createdAt,updatedAt:now}).onConflictDoUpdate({target:customers.id,set:{name:record.name,email:record.email,phone:record.phone,updatedAt:now}});await db.update(orders).set({customerId}).where(eq(orders.id,record.id));
 const number=String(config.whatsapp||(env as unknown as Record<string,string>).WHATSAPP_NUMBER||'').replace(/\D/g,'');
 const price=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(record.amountCents/100);let productName='Consulta '+record.queryType;try{const savedPageName=JSON.parse(record.checkoutSnapshot||'{}').pageName;if(savedPageName)productName='Relatório cadastral — '+savedPageName;if(JSON.parse(record.checkoutSnapshot||'{}').source==='checkout_localizar_cpf')productName='Relatório cadastral — Conferência por CPF';if(JSON.parse(record.checkoutSnapshot||'{}').source==='checkout_nascimento')productName='Relatório cadastral — Data de nascimento ('+record.queryType+')'}catch{};if(record.productId){const [p]=await db.select().from(packages).where(eq(packages.id,record.productId));if(p)productName=p.name}const message=[`*NOVO PEDIDO — ${config.companyName||'Descobridor Adv'}*`,`Protocolo: ${record.id}`,`Nome: ${record.name}`,`Telefone: ${record.phone}`,`E-mail: ${record.email}`,`Produto/serviço: ${productName}`,`Tipo de consulta: ${record.queryType}`,`Referência: ${record.queryMasked}`,`Valor registrado: ${price}`,`Data: ${new Date(record.createdAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}`,`Status: aguardando atendimento`,'','Gostaria de continuar o atendimento deste pedido.'].join('\n');
 return Response.json({orderId:record.id,whatsappUrl:/^\d{10,15}$/.test(number)?`https://wa.me/${number}?text=${encodeURIComponent(message)}`:null},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Não foi possível salvar o pedido. Tente novamente em instantes.'},{status:503})}
}
