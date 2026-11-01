export type PageOptions={
 formLabel:string;formPlaceholder:string;formButton:string;formHint:string;
 modalTitle:string;modalDescription:string;modalButton:string;
 howTitle:string;howIntro:string;steps:{title:string;description:string}[];trustItems:string[];
 faqTitle:string;faqIntro:string;ctaTitle:string;
 purchaseTitle:string;purchaseButton:string;serviceLabel:string;
 accentColor:string;backgroundColor:string;textColor:string;alignment:'center'|'left';density:'comfortable'|'compact';
 showHow:boolean;showFaq:boolean;showCta:boolean;showTrust:boolean;showHeader:boolean;showFooter:boolean;
 socialTitle:string;socialDescription:string;socialImage:string;socialImageAlt:string;canonicalUrl:string;robotsFollow:boolean;twitterCard:'summary'|'summary_large_image';showBreadcrumbs:boolean;breadcrumbLabel:string;schemaMode:'standard'|'webpage'|'none';schemaFaq:boolean;
};
export const defaultPageOptions:PageOptions={
 formLabel:'O que você quer consultar?',formPlaceholder:'',formButton:'Prosseguir',formHint:'',
 modalTitle:'Crie sua conta',modalDescription:'É necessário para continuar.',modalButton:'Gerar Relatório',
 howTitle:'Como funciona?',howIntro:'Para realizar uma consulta, escolha o tipo de dado e siga as instruções do formulário.',
 steps:[{title:'Escolha o tipo de consulta',description:'Selecione o tipo de solicitação e informe a referência para atendimento.'},{title:'Registre seu pedido',description:'Confira o valor e registre seus contatos. A contratação é concluída com a equipe.'},{title:'Acompanhe a solicitação',description:'Acompanhe o pedido pela sua conta e confirme a disponibilidade com o atendimento.'}],
 trustItems:['Navegação simples','Acompanhamento do pedido','Referência protegida'],
 faqTitle:'Perguntas frequentes',faqIntro:'Aqui você encontra as questões e respostas que precisa.',ctaTitle:'',
 purchaseTitle:'Solicitar Relatório Completo',purchaseButton:'Solicitar relatório completo',serviceLabel:'',
 accentColor:'',backgroundColor:'',textColor:'',alignment:'center',density:'comfortable',
 showHow:true,showFaq:true,showCta:true,showTrust:true,showHeader:true,showFooter:true,
 socialTitle:'',socialDescription:'',socialImage:'',socialImageAlt:'',canonicalUrl:'',robotsFollow:true,twitterCard:'summary_large_image',showBreadcrumbs:true,breadcrumbLabel:'',schemaMode:'standard',schemaFaq:true
};
export function pageOptions(options?:Partial<PageOptions>):PageOptions{return {...defaultPageOptions,...options}}
export function safeImageUrl(value:string){if(!value)return true;if(value.startsWith('/')&&!value.startsWith('//')&&!/[\\\s<>]/.test(value))return true;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}}
