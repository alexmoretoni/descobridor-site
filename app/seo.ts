export const siteUrl='https://descobridor.online';
export const seoTitle='Descobridor | Consultas cadastrais e atendimento';
export const seoDescription='Solicite consultas por CPF, telefone ou placa com a Descobridor. Cadastre seu pedido, acompanhe o atendimento e tire suas dúvidas pelo WhatsApp.';
export const shareImage={url:siteUrl+'/images/descobridor-preview.webp',width:1200,height:628,alt:'Descobridor — Consultas e atendimento — descobridor.online'};
export const structuredData={
 '@context':'https://schema.org',
 '@graph':[
  {'@type':'Organization','@id':siteUrl+'/#organization',name:'Descobridor',url:siteUrl+'/',email:'contato@descobridor.online',description:'Plataforma de solicitações de consultas cadastrais e atendimento.',contactPoint:{'@type':'ContactPoint',contactType:'Atendimento ao cliente',email:'contato@descobridor.online',availableLanguage:'Portuguese'}},
  {'@type':'WebSite','@id':siteUrl+'/#website',url:siteUrl+'/',name:'Descobridor',inLanguage:'pt-BR',publisher:{'@id':siteUrl+'/#organization'}},
  {'@type':'WebPage','@id':siteUrl+'/#webpage',url:siteUrl+'/',name:seoTitle,description:seoDescription,inLanguage:'pt-BR',isPartOf:{'@id':siteUrl+'/#website'},about:{'@id':siteUrl+'/#organization'},primaryImageOfPage:{'@id':siteUrl+'/#primaryimage'}},
  {'@type':'ImageObject','@id':siteUrl+'/#primaryimage',url:shareImage.url,contentUrl:shareImage.url,width:1200,height:628,caption:shareImage.alt}
 ]
};
