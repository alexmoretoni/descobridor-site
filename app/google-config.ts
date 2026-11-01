export const googleKeys=['ga4Id','gtmId','googleSiteVerification','ga4PropertyId','googleLookerUrl'] as const;
export function validateGoogleConfig(input:Record<string,unknown>){
 const out:Record<string,string>={};
 for(const key of googleKeys){const v=String(input[key]??'').trim();if(v.length>300)throw Error('Configuração Google muito longa.');
 if(v&&key==='ga4Id'&&!/^G-[A-Z0-9]{4,20}$/.test(v))throw Error('ID de medição GA4 inválido.');
 if(v&&key==='gtmId'&&!/^GTM-[A-Z0-9]{4,20}$/.test(v))throw Error('ID do contêiner GTM inválido.');
 if(v&&key==='googleSiteVerification'&&!/^[A-Za-z0-9_-]{10,200}$/.test(v))throw Error('Cole somente o código de verificação, sem HTML.');
 if(v&&key==='ga4PropertyId'&&!/^\d{1,20}$/.test(v))throw Error('O ID da propriedade Analytics deve ser numérico.');
 if(v&&key==='googleLookerUrl'){let u;try{u=new URL(v)}catch{throw Error('URL do Looker Studio inválida.')}if(u.protocol!=='https:'||u.hostname!=='lookerstudio.google.com'||u.port||u.username||u.password||!u.pathname.startsWith('/reporting/'))throw Error('Use um link HTTPS de relatório do Looker Studio.');}
 out[key]=v;}return out;
}
