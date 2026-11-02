/* Presentation and checkout; simulated examples never represent found records. */
(()=>{
 const F=window.LiveFormat,q=document.getElementById('query'),form=document.getElementById('searchform');if(!q||!form)return;
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const formatMoney=cents=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
 const money=()=>quote?formatMoney(quote.amountCents):'Calculando…';
 const initialProductId=new URLSearchParams(location.search).get('oferta')||'';
 let quote=null,selectedProductId=initialProductId,quoteRequest=0;
 const lock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
 const locked=(label='Abrir checkout')=>`<button type="button" class="live-lock" data-live-checkout title="Dado bloqueado · prévia ilustrativa" aria-label="${e(label)}">${lock}<span>Bloqueado</span></button>`;
 let validationTimer,animationTimer,activeOperation=0,stopPreview=()=>{},previewSamples=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function check(){const t=document.getElementById('querytype').value,v=q.value;return t==='CPF'?F.validCPF(v):t==='Telefone'?F.validPhone(v):t==='Nome'?v.trim().length>=5&&v.trim().includes(' '):t==='Veículo'?/^[A-Z]{3}(?:\d{4}|\d[A-Z]\d{2})$/.test(v.replace(/[^a-z0-9]/gi,'').toUpperCase()):t==='CEP'?F.digits(v).length===8:/^[A-Z0-9]{12}\d{2}$/.test(v.replace(/[^a-z0-9]/gi,'').toUpperCase());}
 function validation(){clearTimeout(validationTimer);const badge=document.getElementById('queryvalid'),value=q.value,valid=check();form.classList.remove('ready','live-invalid');badge.hidden=!value;badge.classList.toggle('is-checking',!!value);badge.textContent='Verificando formato…';badge.title='Validação local de formato; não confirma titularidade nem situação cadastral.';q.removeAttribute('aria-invalid');
  if(!value)return;
  validationTimer=setTimeout(()=>{if(value!==q.value)return;badge.classList.remove('is-checking');badge.textContent=valid?'✓ Formato verificado':'Confira o formato';form.classList.toggle('ready',valid);form.classList.toggle('live-invalid',!valid);q.setAttribute('aria-invalid',String(!valid));},450);
 }
 updateQueryAppearance=validation;
 q.addEventListener('input',event=>{event.stopImmediatePropagation();q.setCustomValidity('');const t=document.getElementById('querytype').value,raw=q.value,pos=q.selectionStart??raw.length,before=F.digits(raw.slice(0,pos)).length;if(t==='CPF'||t==='Telefone'){q.value=t==='CPF'?F.cpf(raw):F.phone(raw);let cursor=0,count=0;while(cursor<q.value.length&&count<before){if(/\d/.test(q.value[cursor]))count++;cursor++;}q.setSelectionRange(cursor,cursor);}validation();},true);
 document.getElementById('querytype').addEventListener('change',()=>{q.maxLength=100;q.inputMode=['Nome','Veículo','CNPJ'].includes(document.getElementById('querytype').value)?'text':'tel';validation();});
 form.addEventListener('submit',event=>{if(document.getElementById('querytype').value==='Telefone'&&!F.validPhone(q.value)){event.preventDefault();event.stopImmediatePropagation();q.setCustomValidity('Informe um telefone válido com DDD.');q.reportValidity();}},true);
 function closeCheckout(){document.getElementById('live-checkout')?.close();}
 function cleanup(){stopPreview();activeOperation++;clearTimeout(animationTimer);document.querySelector('.live-loading')?.remove();document.body.classList.remove('live-report-open');closeCheckout();}
 window.addEventListener('hashchange',()=>{if(!['#checkout','#identificacao'].includes(location.hash))cleanup();});
 renderIdentification=function(){
  if(!queryReady){location.hash='inicio';return;}
  document.getElementById('birthdialog')?.remove();
  identifiedContact={name:'',phone:'',email:'',consent:false,deliveryFlow:'whatsapp'};previewSamples=null;quote=null;selectedProductId=initialProductId;quoteRequest++;
  const operation=++activeOperation,overlay=document.createElement('div');
  overlay.className='live-loading';overlay.setAttribute('role','status');
  overlay.innerHTML='<div><span class="preparationspinner"></span><h2>Preparando sua prévia</h2><p>Organizando as categorias solicitadas…</p><small>Prévia ilustrativa. A disponibilidade será verificada no atendimento.</small></div>';
  document.body.append(overlay);
  animationTimer=setTimeout(()=>{if(operation!==activeOperation)return;overlay.remove();location.hash='checkout';},reduced()?0:900);
 };
 const icons={
  address:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  phone:'<path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a13 13 0 0 1-7-7l2-2-2-5Z"/>',
  family:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/>',
  work:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 13a24 24 0 0 0 18 0m-9-2v4"/>',
  email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  id:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8" cy="10" r="2"/><path d="M5 16a3 3 0 0 1 6 0m3-7h4m-4 4h4"/>',
  status:'<path d="m12 3 8 4v6c0 5-8 8-8 8s-8-3-8-8V7l8-4Z"/><path d="m8 12 3 3 5-6"/>'
 };
 const icon=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
 function glass(value,extra=''){return '<span class="live-glass '+extra+'" aria-label="Dado demonstrativo mascarado"><span aria-hidden="true">'+e(value)+'</span></span>';}
 function sampleSection(title,subtitle,symbol,rows,id){return `<section class="live-card live-scroll-card live-card-${id}" aria-labelledby="live-heading-${id}"><div class="live-card-head"><div><h2 id="live-heading-${id}">${icon(symbol)}${e(title)}</h2><p>${e(subtitle)}</p></div>${locked('Abrir checkout: '+title)}</div><div class="live-scroll-shell is-at-start"><div class="live-examples" tabindex="0" role="region" aria-label="Exemplos fictícios protegidos: ${e(title)}">${rows.map((row,i)=>`<div class="live-example" style="--row-delay:${Math.min(i,3)*60}ms"><span class="live-symbol" aria-hidden="true">${icon(symbol)}</span><div class="live-glass-content" aria-hidden="true"><div class="live-blur"><strong>${e(row[0])}</strong><small>${e(row[1])}</small><span class="live-sample-chip">***********</span></div></div>${locked('Abrir checkout: '+title+', exemplo '+(i+1))}</div>`).join('')}</div><span class="live-scroll-cue" aria-hidden="true">Role para ver mais ↓</span></div></section>`;}
 function contactSection(){
  const groups=[['addresses','Endereços','address'],['phones','Telefones','phone'],['email','E-mails','email']];
  return `<section class="live-card live-scroll-card live-card-contacts" aria-labelledby="live-heading-contacts"><div class="live-card-head"><div><h2 id="live-heading-contacts">${icon('address')}Endereços e contatos</h2><p>Endereços, telefones e e-mails · exemplos protegidos</p></div>${locked('Abrir checkout: endereços e contatos')}</div><nav class="live-contact-tabs" aria-label="Categorias de contato">${groups.map(([key,title])=>`<button type="button" data-contact-group="${key}">${e(title)}</button>`).join('')}</nav><div class="live-scroll-shell is-at-start"><div class="live-examples live-contact-list" tabindex="0" role="region" aria-label="Endereços, telefones e e-mails fictícios protegidos">${groups.map(([key,title,symbol])=>`<section class="live-contact-group" id="live-contact-${key}" aria-label="${e(title)}"><h3>${icon(symbol)}${e(title)}</h3>${previewSamples[key].map((row,i)=>`<div class="live-example" style="--row-delay:${Math.min(i,3)*60}ms"><span class="live-symbol" aria-hidden="true">${icon(symbol)}</span><div class="live-glass-content" aria-hidden="true"><div class="live-blur"><strong>${e(row[0])}</strong><small>${e(row[1])}</small><span class="live-sample-chip">***********</span></div></div>${locked('Abrir checkout: '+title+', exemplo '+(i+1))}</div>`).join('')}</section>`).join('')}</div><span class="live-scroll-cue" aria-hidden="true">Role para ver mais ↓</span></div></section>`;
 }
 function revealPreview(container){
  container.classList.add('live-reveals-ready');
  stopPreview();const timers=[],observer=typeof IntersectionObserver==='function'&&!reduced()?new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add(entry.target.classList.contains('live-example')?'is-row-visible':'is-visible');observer.unobserve(entry.target);}}},{threshold:.1}):null;
  container.querySelectorAll('.live-card,.live-example').forEach(card=>observer?observer.observe(card):card.classList.add(card.classList.contains('live-example')?'is-row-visible':'is-visible'));
  const progress=container.querySelector('.live-preview-progress');if(progress){progress.textContent=reduced()?'Categorias organizadas':'Organizando categorias…';if(!reduced())timers.push(setTimeout(()=>{if(progress.isConnected)progress.textContent='Categorias organizadas';},1100));}
  for(const list of container.querySelectorAll('.live-examples')){
   const update=()=>{const shell=list.parentElement;shell.classList.toggle('is-at-start',list.scrollTop<3);shell.classList.toggle('is-at-end',list.scrollTop+list.clientHeight>=list.scrollHeight-3);};
   let scrollingTimer;list.addEventListener('scroll',()=>{update();list.parentElement.classList.add('is-scrolling');clearTimeout(scrollingTimer);scrollingTimer=setTimeout(()=>list.parentElement.classList.remove('is-scrolling'),160);},{passive:true});requestAnimationFrame(update);
  }
  stopPreview=()=>{observer?.disconnect();timers.forEach(clearTimeout);};
 }
 renderCheckout=function(){
  if(!identifiedContact){renderIdentification();return;}
  previewSamples??=Object.fromEntries(['addresses','family','phones','work','email'].map(kind=>[kind,window.LivePreview.examples(kind,window.LivePreview.count())]));
  document.body.classList.add('live-report-open');document.getElementById('home').classList.add('hidden');const other=document.getElementById('other');other.className='page live-report';
  const reference=e(queryReference),label=e(type==='CPF'?'CPF informado':type==='Telefone'?'Telefone informado':'Referência informada');
  const fields=[['status','Situação do CPF','********'],['id','RG','**.***.***-*'],['family','Mãe','****************'],['family','Pai','****************'],['id','Nascimento','**/**/****']];
  other.innerHTML=`<div class="live-container"><a class="live-back" href="#inicio">← Nova consulta</a><header class="live-title"><span class="live-eyebrow">SEU RELATÓRIO</span><h1>Informações pessoais.<em> Em um só lugar.</em></h1><p>Visualização demonstrativa · dados fictícios protegidos. A disponibilidade será confirmada no atendimento.</p><span class="live-preview-progress" role="status" aria-live="polite"></span></header><div class="live-quick"><span>${lock} Informações rápidas</span><div><button type="button" data-live-checkout>${lock} Situação cadastral</button><button type="button" data-live-checkout>${lock} Vínculos familiares</button><button type="button" data-live-checkout>${lock} Histórico de contatos</button></div></div><div class="live-columns"><div class="live-main"><section class="live-card live-identity" aria-labelledby="live-identification-heading"><div class="live-person"><div class="live-person-label"><span id="live-identification-heading">${icon('id')} IDENTIFICAÇÃO</span><span class="live-private-note">${lock} Dados protegidos</span></div><div class="live-person-grid"><div class="live-person-name"><small>Nome</small>${glass('****************','live-name-mask')}</div><div class="live-reference-inline"><small>${label}</small><strong>${reference}</strong></div></div></div><div class="live-fields">${fields.map(([symbol,label,masked],i)=>`<div class="live-detail-row" style="--detail-delay:${i*100}ms"><span class="live-detail-label">${icon(symbol)}${e(label)}</span>${glass(masked)}${locked('Abrir checkout: '+label)}</div>`).join('')}</div></section>
  ${contactSection()}
  ${sampleSection('Familiares identificados','Vínculos de exemplo · conteúdo protegido','family',previewSamples.family,'family')}
  ${sampleSection('Empresas e empregos','Participações e vínculos profissionais de exemplo','work',previewSamples.work,'work')}
  </div><aside class="live-aside"><section class="live-card live-offer"><span class="live-eyebrow">ATENDIMENTO PERSONALIZADO</span><h2>Solicite seu relatório</h2><p>Confirme a disponibilidade das informações com nossa equipe.</p><div id="live-offer-options"></div><p id="live-quote-error" class="live-quote-error" role="alert"></p><div class="live-offer-price"><span data-live-product-name>Valor do relatório</span><strong data-live-price>${money()}</strong></div><button class="live-primary" type="button" data-live-checkout>${lock} Gerar pedido agora</button><small>Nenhuma cobrança automática. Atendimento pelo WhatsApp.</small></section></aside></div><div class="live-bottom"><button class="live-primary" type="button" data-live-checkout>${lock} Gerar pedido agora · <span data-live-price>${money()}</span></button></div></div>`;
  other.querySelectorAll('[data-live-checkout]').forEach(button=>button.addEventListener('click',openCheckout));other.querySelectorAll('[data-contact-group]').forEach(button=>button.addEventListener('click',()=>{const list=other.querySelector('.live-contact-list'),group=document.getElementById('live-contact-'+button.dataset.contactGroup);list.scrollTo({top:group.offsetTop-list.offsetTop,behavior:reduced()?'instant':'smooth'});}));window.scrollTo({top:0,behavior:'instant'});revealPreview(other);refreshQuote();
 };
 async function refreshQuote(productId=selectedProductId){
  const request=++quoteRequest;quote=null;
  document.querySelectorAll('[data-live-price]').forEach(n=>n.textContent='Calculando…');
  document.querySelectorAll('.live-primary[data-live-checkout]').forEach(b=>b.disabled=true);
  try{
   const params=new URLSearchParams({type,pageSlug:window.cmsPage?.slug||''});if(productId)params.set('productId',productId);
   const response=await fetch('/api/quote?'+params),data=await response.json();if(request!==quoteRequest)return false;
   if(!response.ok)throw Error(data.error||'Não foi possível carregar o preço.');quote=data;selectedProductId=data.productId||'';
   document.querySelectorAll('[data-live-price]').forEach(n=>n.textContent=money());document.querySelectorAll('[data-live-product-name]').forEach(n=>n.textContent=data.name);
   document.querySelectorAll('.live-primary[data-live-checkout]').forEach(b=>b.disabled=false);
   const error=document.getElementById('live-quote-error');if(error)error.textContent='';
   const options=document.getElementById('live-offer-options');if(options){options.innerHTML=offerSelect('live-product');options.querySelector('select')?.addEventListener('change',event=>{reportOrderKey=null;refreshQuote(event.target.value);});}
   return true;
  }catch(err){if(request!==quoteRequest)return false;const box=document.getElementById('live-quote-error');if(box){box.textContent=err.message+' ';const retry=document.createElement('button');retry.type='button';retry.textContent='Tentar novamente';retry.onclick=()=>refreshQuote();box.append(retry);}return false;}
 }
 function offerSelect(id){return !quote.pinned&&quote.offers.length?'<label for="'+id+'">Escolha sua oferta<select id="'+id+'"><option value="">Relatório avulso · '+formatMoney(quote.baseAmountCents)+'</option>'+quote.offers.map(p=>'<option value="'+e(p.id)+'" '+(p.id===quote.productId?'selected':'')+'>'+e(p.name)+' · '+formatMoney(p.priceCents)+'</option>').join('')+'</select></label>':'<p class="live-selected-offer">'+e(quote.name)+'</p>';}
 async function openCheckout(){
  if(!await refreshQuote())return;
  if(!identifiedContact)return;document.getElementById('live-checkout')?.remove();const dialog=document.createElement('dialog');dialog.id='live-checkout';dialog.className='live-checkout';dialog.setAttribute('aria-labelledby','live-checkout-title');
  dialog.innerHTML=`<div class="live-sheet-handle" aria-hidden="true"></div><button class="live-close" type="button" aria-label="Fechar checkout">×</button><h2 id="live-checkout-title">Como vamos entregar seu pedido?</h2><p>Informe seu telefone com WhatsApp para continuar o atendimento.</p><form id="live-order-form"><div class="live-delivery-row"><label for="live-phone">Seu WhatsApp com DDD<input id="live-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="22" placeholder="(11) 99999-9999" required></label><label for="live-reference">${e(type)} consultado<input id="live-reference" type="text" value="${e(queryReference)}" readonly aria-readonly="true"></label></div><p class="live-phone-status" id="live-phone-status" role="status">Digite seu número com DDD.</p><div class="live-total"><span data-live-product-name>${e(quote.name)}</span><strong data-live-price>${money()}</strong></div><p class="live-sheet-note">Ao gerar o pedido, você autoriza o registro deste telefone e o contato sobre a solicitação de dados próprios ou autorizados. <a href="/privacidade">Privacidade</a>.</p><button id="requestreport" class="live-primary" type="submit" disabled>Gerar pedido agora <span aria-hidden="true">→</span></button><p id="ordererror" class="error" role="alert"></p><div id="ordersuccess" class="hidden" role="status"></div></form><p class="live-sheet-note">Seu pedido é salvo antes de abrir o WhatsApp. A validação confere o formato do telefone, sem confirmar uma conta WhatsApp ativa.</p>`;

  document.body.append(dialog);dialog.querySelector('.live-close').onclick=()=>dialog.close();dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>document.body.classList.remove('live-checkout-open'),{once:true});document.body.classList.add('live-checkout-open');
  const f=dialog.querySelector('form'),phone=f.elements.phone,button=f.querySelector('button[type=submit]'),status=dialog.querySelector('#live-phone-status');
  phone.value=F.phone(identifiedContact.phone||'');
  function updatePhone(){phone.setCustomValidity('');const valid=F.validPhone(phone.value);button.disabled=!valid||!quote;status.textContent=valid?'✓ Formato verificado. Pronto para gerar seu pedido.':'Digite seu número com DDD.';status.classList.toggle('is-valid',valid);}
  phone.addEventListener('input',()=>{phone.value=F.phone(phone.value);identifiedContact.phone=F.phoneDigits(phone.value);updatePhone();});
  f.addEventListener('submit',event=>{event.preventDefault();if(!quote||!f.reportValidity()||!F.validPhone(phone.value))return;identifiedContact={name:'',email:'',phone:F.phoneDigits(phone.value),consent:true,deliveryFlow:'whatsapp',productId:quote.productId||undefined,quoteKey:quote.quoteKey};saveOrder();});
  const productPicker=document.createElement('div');productPicker.className='live-sheet-product';productPicker.innerHTML=offerSelect('live-sheet-offer');f.querySelector('.live-total').before(productPicker);
  productPicker.querySelector('select')?.addEventListener('change',async event=>{const select=event.target;select.disabled=true;button.disabled=true;reportOrderKey=null;const ok=await refreshQuote(select.value);select.disabled=false;if(ok)updatePhone();else{dialog.querySelector('#ordererror').textContent='Não foi possível atualizar a oferta. Feche e abra o checkout para tentar novamente.';}});
  updatePhone();dialog.showModal();dialog.querySelector('.live-close').focus({preventScroll:true});

 }
 function refreshFormPrice(){const display=document.querySelector('.cmsprice strong');if(!display)return;const params=new URLSearchParams({type:document.getElementById('querytype').value,pageSlug:window.cmsPage?.slug||''});if(initialProductId)params.set('productId',initialProductId);const selectedType=params.get('type');fetch('/api/quote?'+params).then(async response=>{const data=await response.json();if(selectedType!==document.getElementById('querytype').value)return;display.textContent=response.ok?formatMoney(data.amountCents):'Oferta indisponível';}).catch(()=>{display.textContent='Confira no checkout';});}
 const requestedType=new URLSearchParams(location.search).get('tipo'),selector=document.getElementById('querytype');if(initialProductId&&['CPF','CNPJ','Nome','Telefone','CEP','Veículo'].includes(requestedType)){if(![...selector.options].some(o=>o.value===requestedType))selector.add(new Option(requestedType,requestedType));selector.value=requestedType;selector.dispatchEvent(new Event('change'));}
 selector.addEventListener('change',refreshFormPrice);refreshFormPrice();validation();
})();
