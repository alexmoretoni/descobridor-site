import type {SitePage} from './pages';
const escapeHtml=(value:unknown)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]!));
const links:Record<string,string>={
 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cpf/assuntos-relacionados/perguntas-e-respostas':'perguntas frequentes da Receita Federal',
 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-cpf':'portal Meu CPF da Receita Federal',
 'https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes':'orientações da ANPD',
 'https://consultanacional.org/consultas/cpf/':'Consulta Nacional',
 'https://descobridor.online/puxar-dados-pelo-cpf':'relatório cadastral do Descobridor',
 '/como-corrigir-nome-errado-no-cpf':'corrigir nome no CPF',
 '/data-de-nascimento-errada-no-cpf':'corrigir data de nascimento no CPF',
 '/descobrir-nome-pelo-cpf':'conferir nome pelo CPF',
 '/verificar-situacao-cadastral-cpf':'verificar situação cadastral',
 '/consultar-dados-pelo-cpf':'guia de consulta pelo CPF',
 '/consultar-pessoa-pelo-nome':'consulta pelo nome',
 '/pesquisa-de-pessoas':'pesquisa de pessoas',
 '/descobrir-data-de-nascimento':'serviço de conferência de data de nascimento',
 '/consultar-cpf-sem-data-de-nascimento':'consulta de CPF sem data de nascimento',
 'https://www.registrocivil.org.br/faq':'perguntas frequentes do Registro Civil',
 'https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados':'orientações da ANPD sobre seus dados',
 'https://www.cnj.jus.br/2a-via-de-certidoes-de-nascimento-e-de-obito-podem-ser-solicitadas-via-internet/':'orientações do CNJ para segunda via de certidão'
};
export function editorialRichText(value:string):string{
 const expression=/https?:\/\/[^\s<>"']+|(?<![a-zA-Z0-9/])\/[a-z0-9][a-z0-9-]*(?:\/)?/gi;
 let result='',index=0;
 for(const match of value.matchAll(expression)){
   const at=match.index??0,raw=match[0],url=raw.replace(/[.,;:!?]+$/,'');
   result+=escapeHtml(value.slice(index,at));
   const label=links[url]||(url.startsWith('/')?url.replace(/^\/|\/$/g,'').replaceAll('-',' '):'consultar referência');
   const outside=url.startsWith('http');
   result+='<a class="ep-anchor" href="'+escapeHtml(url)+'"'+(outside?' target="_blank" rel="noopener noreferrer"':'')+'>'+escapeHtml(label)+'</a>'+escapeHtml(raw.slice(url.length));
   index=at+raw.length;
 }
 return result+escapeHtml(value.slice(index));
}
const para=(str:string)=>'<p>'+editorialRichText(str)+'</p>';
function renderSection(section:SitePage['sections'][number],i:number,isBirth=false):string{
 const ps=i===0?section.paragraphs.slice(1):section.paragraphs;
 const long=ps.length>2||ps.join(' ').length>680;
 const collapse=long&&ps.length>1;
 const primary=(collapse?ps.slice(0,1):ps).map(para).join('');
 const remaining=(collapse?ps.slice(1):[]).map(para).join('');
 const headings=(section.subheadings||[]).map(h=>'<h3>'+escapeHtml(h.title)+'</h3>'+h.paragraphs.map(para).join('')).join('');
 const picture=section.image?'<figure class="ep-illustration"><img src="'+escapeHtml(section.image)+'" alt="'+escapeHtml(section.imageAlt||section.title)+'" loading="lazy" decoding="async" width="1200" height="675"/><figcaption>'+escapeHtml(section.imageAlt||'Ilustração editorial')+'</figcaption></figure>':'';
 const stepList=isBirth?[['01','Confira','Verifique seus documentos oficiais'],['02','Solicite','Peça a certidão ao Registro Civil'],['03','Compare','Confirme os dados e corrija divergências']]:[['01','Verifique','Procure o CPF em seus próprios documentos'],['02','Recupere','Use os canais oficiais da Receita Federal'],['03','Proteja','Não compartilhe senhas nem códigos']];
 const steps=i===1?'<div class="ep-steps" aria-label="'+(isBirth?'Passos para conferir a data de nascimento':'Como recuperar o número do CPF')+'">'+stepList.map(x=>'<div class="ep-step"><span>'+x[0]+'</span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></div>').join('')+'</div>':'';
 const graphic=i===6?'<figure class="ep-illustration"><img src="'+(isBirth?'/images/blog/data-nascimento-caminhos.svg':'/images/blog/descobrir-cpf-comparativo.svg')+'" alt="'+(isBirth?'Comparativo de documentos próprios, certidão no Registro Civil e conferência autorizada':'Comparativo entre recuperar o próprio CPF, verificar a situação cadastral e conferir dados autorizados')+'" width="1000" height="470" loading="lazy" decoding="async"/><figcaption>Diagrama educativo — não representa dados estatísticos.</figcaption></figure>':'';
 const disclosure=collapse?'<details class="ep-more"><summary>Leia mais <span aria-hidden="true">↓</span></summary><div class="ep-more-content">'+remaining+headings+'</div></details>':headings;
 return '<section class="ep-section" id="topico-'+(i+1)+'"><span class="ep-overline">'+String(i+1).padStart(2,'0')+' / GUIA</span><h2>'+escapeHtml(section.title)+'</h2>'+picture+primary+steps+graphic+disclosure+'</section>';
}
export function editorialArticle(p:SitePage,pages:SitePage[]):string{
 const isBirth=p.slug==='como-descobrir-data-de-nascimento-pelo-nome';
 const summary=p.sections[0]?.paragraphs[0]||p.heroDescription;
 const faq=p.faq.map(f=>'<details><summary>'+escapeHtml(f.question)+'</summary>'+para(f.answer)+'</details>').join('');
 const sources=(p.sources||[]).map(s=>'<li><a href="'+escapeHtml(s.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(s.label)+'</a></li>').join('');
 const other=pages.filter(x=>x.template==='article'&&x.status==='published'&&x.slug!==p.slug).slice(0,3);
 const related=other.length?'<aside class="ep-related"><h2>Continue a leitura</h2>'+other.map(x=>'<a href="/'+escapeHtml(x.slug)+'">'+escapeHtml(x.heroTitle)+'</a>').join('')+'</aside>':'';
 return '<article class="blogpost ep" data-editorial-v2>'+
 '<div class="ep-progress" aria-hidden="true"><span data-ep-progress></span></div>'+
 '<header class="ep-hero"><div><span class="ep-overline">GUIA PRÁTICO · 2026</span><h1>'+escapeHtml(p.heroTitle)+'</h1><p class="ep-deck">'+escapeHtml(p.heroDescription)+'</p><p class="ep-byline"><span aria-hidden="true">✳</span> Redação Descobridor · Guia educativo</p></div>'+
 '<figure class="ep-cover"><img src="'+(isBirth?'/images/blog/data-nascimento-nome-editorial.svg':'/images/blog/descobrir-cpf-pelo-nome-editorial.svg')+'" alt="'+(isBirth?'Ilustração abstrata de certidão de nascimento com elementos de conferência e privacidade':'Ilustração de documento cadastral com lupa, escudo e sinal de confirmação')+'" width="1200" height="800" fetchpriority="high"/><figcaption>Ilustração editorial, sem dados reais.</figcaption></figure></header>'+
 '<div class="ep-toolbar"><span>PERSONALIZE SUA LEITURA</span><div><button type="button" data-ep-font="-1" aria-label="Diminuir tamanho da letra">A−</button><button type="button" data-ep-font="1" aria-label="Aumentar tamanho da letra">A+</button><button type="button" data-ep-reader aria-pressed="false">Modo leitura</button></div></div>'+
 '<div class="ep-layout"><aside class="ep-index"><nav aria-label="Neste artigo"><strong>NESTE ARTIGO</strong>'+p.sections.map((s,i)=>'<a href="#topico-'+(i+1)+'">'+escapeHtml(s.title)+'</a>').join('')+'<a href="#perguntas">Perguntas frequentes</a><a href="#fontes">Fontes oficiais</a></nav></aside>'+
 '<div class="ep-content"><aside class="ep-summary"><span>✓ RESPOSTA RÁPIDA</span><h2>'+(isBirth?'É possível conferir a data de nascimento pelo nome?':'É possível descobrir CPF pelo nome?')+'</h2>'+para(summary)+'</aside>'+p.sections.map((s,i)=>renderSection(s,i,isBirth)).join('')+
 '<section class="ep-section ep-faq" id="perguntas"><h2>'+escapeHtml(p.options?.faqTitle||'Perguntas frequentes')+'</h2>'+faq+'</section>'+
 '<section class="ep-section ep-sources" id="fontes"><h2>Fontes oficiais consultadas</h2><p>Confirme as orientações diretamente nos órgãos responsáveis antes de compartilhar seus documentos.</p><ul>'+sources+'</ul></section>'+
 '<aside class="ep-cta"><div><h2>'+(isBirth?'Precisa conferir uma data com autorização?':'Já possui o número do CPF?')+'</h2><p>'+(isBirth?'Conheça as opções de conferência cadastral para dados próprios ou autorizados. Consulte condições e disponibilidade.':'Conheça o relatório privado para dados próprios ou autorizados, anunciado por R$ 29,00. Disponibilidade sujeita a avaliação.')+'</p></div><a href="'+(isBirth?'/descobrir-data-de-nascimento':'/puxar-dados-pelo-cpf')+'">Conhecer serviço</a></aside>'+related+
 '<footer class="ep-author"><strong>Descobridor</strong><p>Guia educativo. <a href="mailto:contato@descobridor.online">Envie uma correção</a> ou <a href="/blog">veja outros artigos</a>.</p></footer></div></div></article>';
}
