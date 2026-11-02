/* Presentation and checkout; simulated examples never represent found records. */
(()=>{
 const F=window.LiveFormat,q=document.getElementById('query'),form=document.getElementById('searchform');if(!q||!form)return;
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=()=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(publicConfig.reportPriceCents/100);
 const lock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
 const locked=(label='Abrir checkout')=>`<button type="button" class="live-lock" data-live-checkout title="Dado bloqueado · prévia ilustrativa" aria-label="${e(label)}">${lock}<span>Bloqueado</span></button>`;
 let validationTimer,animationTimer,activeOperation=0;
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
 function cleanup(){activeOperation++;clearTimeout(animationTimer);document.querySelector('.live-loading')?.remove();document.body.classList.remove('live-report-open');closeCheckout();}
 window.addEventListener('hashchange',()=>{if(!['#checkout','#identificacao'].includes(location.hash))cleanup();});
 renderIdentification=function(){
  if(!queryReady){location.hash='inicio';return;}
  document.getElementById('birthdialog')?.remove();
  identifiedContact={name:'',phone:'',email:'',consent:false,deliveryFlow:'whatsapp'};
  const operation=++activeOperation,overlay=document.createElement('div');
  overlay.className='live-loading';overlay.setAttribute('role','status');
  overlay.innerHTML='<div><span class="preparationspinner"></span><h2>Preparando sua prévia</h2><p>Organizando as categorias solicitadas…</p><small>Prévia ilustrativa. A disponibilidade será verificada no atendimento.</small></div>';
  document.body.append(overlay);
  animationTimer=setTimeout(()=>{if(operation!==activeOperation)return;overlay.remove();location.hash='checkout';},reduced()?0:900);
 };
 function sampleSection(title,subtitle,icon,rows){return `<section class="live-card"><div class="live-card-head"><div><h2>${e(title)}</h2><p>${e(subtitle)}</p></div>${locked('Abrir checkout para '+title)}</div><div class="live-examples" aria-label="Exemplos fictícios de ${e(title)}">${rows.map((row,i)=>`<div class="live-example"><span class="live-symbol" aria-hidden="true">${icon}</span><div class="live-blur" aria-hidden="true"><strong>${e(row[0])}</strong><small>${e(row[1]||'Informação ilustrativa indisponível')}</small></div>${locked('Abrir checkout: '+title+', exemplo '+(i+1))}</div>`).join('')}</div></section>`;}
 renderCheckout=function(){
  if(!identifiedContact){renderIdentification();return;}document.body.classList.add('live-report-open');document.getElementById('home').classList.add('hidden');const other=document.getElementById('other');other.className='page live-report';
  const reference=e(queryReference),label=e(type==='CPF'?'CPF informado':type==='Telefone'?'Telefone informado':'Referência informada');
  other.innerHTML=`<div class="live-container"><a class="live-back" href="#inicio">← Nova consulta</a><header class="live-title"><span class="live-eyebrow">PRÉVIA DO RELATÓRIO</span><h1>Informações pessoais.<br><em>Em um só lugar.</em></h1><p>Confira as categorias que você pode solicitar no atendimento.</p></header><aside class="live-disclosure"><strong>Prévia ilustrativa · dados fictícios</strong><p>Os cartões abaixo demonstram o formato do relatório. Nenhuma informação pessoal foi localizada ou confirmada. A disponibilidade depende de análise e autorização no atendimento.</p></aside><div class="live-columns"><div class="live-main"><section class="live-card live-identity"><div class="live-person"><span>${lock} IDENTIFICAÇÃO</span><h2>Nome: <b>********************</b></h2><p>${label}: <strong>${reference}</strong></p><p>Nasceu em: <strong>**/**/****</strong></p></div><div class="live-fields">${['Situação do CPF','RG','Mãe','Pai'].map(label=>`<div><span>${e(label)}</span><span class="live-field-end"><small>Dado bloqueado</small>${locked('Abrir checkout: '+label)}</span></div>`).join('')}</div></section>
  ${sampleSection('Onde essa pessoa já morou','Modelo de histórico de endereços','⌖',Array.from({length:4},(_,i)=>['Endereço fictício '+(i+1),'Rua de exemplo, 000 · Cidade ilustrativa']))}
  ${sampleSection('Familiares identificados','Modelo de vínculos familiares','♙',Array.from({length:3},(_,i)=>['Pessoa fictícia '+(i+1),'Vínculo familiar ilustrativo']))}
  ${sampleSection('Participações em empresas','Modelo de informações empresariais','▥',[['Empresa fictícia Alfa','CNPJ 00.000.000/0000-00'],['Empresa fictícia Beta','Participação meramente ilustrativa']])}
  ${sampleSection('Empregos','Modelo de histórico profissional','▤',[['Empregador fictício','Cargo e período ilustrativos'],['Outra empresa fictícia','Vínculo ilustrativo']])}
  ${sampleSection('E-mails','Modelo de contatos eletrônicos','@',[['exemplo@exemplo.invalid','Endereço fictício'],['contato@exemplo.invalid','Endereço fictício']])}
  ${sampleSection('Telefones','Modelo de contatos telefônicos','☎',[['(00) 00000-0000','Número fictício'],['(00) 0000-0000','Número fictício']])}</div><aside class="live-aside"><section class="live-card live-offer"><span class="live-eyebrow">ATENDIMENTO PERSONALIZADO</span><h2>Solicite seu relatório</h2><p>Confirme a disponibilidade das informações com nossa equipe.</p><div class="live-offer-price"><span>Valor apresentado</span><strong>${money()}</strong></div><button class="live-primary" type="button" data-live-checkout>${lock} Gerar pedido agora</button><small>Nenhuma cobrança automática. Atendimento pelo WhatsApp.</small></section></aside></div><div class="live-bottom"><button class="live-primary" type="button" data-live-checkout>${lock} Gerar pedido agora · ${money()}</button></div></div>`;
  other.querySelectorAll('[data-live-checkout]').forEach(button=>button.addEventListener('click',openCheckout));window.scrollTo({top:0,behavior:'instant'});
 };
 function openCheckout(){
  if(!identifiedContact)return;document.getElementById('live-checkout')?.remove();const dialog=document.createElement('dialog');dialog.id='live-checkout';dialog.className='live-checkout';dialog.setAttribute('aria-labelledby','live-checkout-title');
  dialog.innerHTML=`<div class="live-sheet-handle" aria-hidden="true"></div><button class="live-close" type="button" aria-label="Fechar checkout">×</button><h2 id="live-checkout-title">Como vamos entregar seu pedido?</h2><p>Informe seu telefone com WhatsApp para continuar o atendimento.</p><form id="live-order-form"><div class="live-delivery-row"><label for="live-phone">Seu WhatsApp com DDD<input id="live-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="22" placeholder="(11) 99999-9999" required></label><label for="live-reference">${e(type)} consultado<input id="live-reference" type="text" value="${e(queryReference)}" readonly aria-readonly="true"></label></div><p class="live-phone-status" id="live-phone-status" role="status">Digite seu número com DDD.</p><div class="live-total"><span>Valor do relatório</span><strong>${money()}</strong></div><p class="live-sheet-note">Ao gerar o pedido, você autoriza o registro deste telefone e o contato sobre a solicitação de dados próprios ou autorizados. <a href="/privacidade">Privacidade</a>.</p><button id="requestreport" class="live-primary" type="submit" disabled>Gerar pedido agora <span aria-hidden="true">→</span></button><p id="ordererror" class="error" role="alert"></p><div id="ordersuccess" class="hidden" role="status"></div></form><p class="live-sheet-note">Seu pedido é salvo antes de abrir o WhatsApp. A validação confere o formato do telefone, sem confirmar uma conta WhatsApp ativa.</p>`;

  document.body.append(dialog);dialog.querySelector('.live-close').onclick=()=>dialog.close();dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>document.body.classList.remove('live-checkout-open'),{once:true});document.body.classList.add('live-checkout-open');
  const f=dialog.querySelector('form'),phone=f.elements.phone,button=f.querySelector('button[type=submit]'),status=dialog.querySelector('#live-phone-status');
  phone.value=F.phone(identifiedContact.phone||'');
  function updatePhone(){phone.setCustomValidity('');const valid=F.validPhone(phone.value);button.disabled=!valid;status.textContent=valid?'✓ Formato verificado. Pronto para gerar seu pedido.':'Digite seu número com DDD.';status.classList.toggle('is-valid',valid);}
  phone.addEventListener('input',()=>{phone.value=F.phone(phone.value);identifiedContact.phone=F.phoneDigits(phone.value);updatePhone();});
  f.addEventListener('submit',event=>{event.preventDefault();if(!f.reportValidity()||!F.validPhone(phone.value))return;identifiedContact={name:'',email:'',phone:F.phoneDigits(phone.value),consent:true,deliveryFlow:'whatsapp'};saveOrder();});
  updatePhone();dialog.showModal();dialog.querySelector('.live-close').focus({preventScroll:true});

 }
 validation();
})();
