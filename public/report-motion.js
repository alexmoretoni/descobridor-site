(()=>{
 let stopReveal=null;
 function registration(form,busy){
  form.setAttribute('aria-busy',String(busy));
  const card=form.closest('.identifycard');
  card?.querySelector('.registrationprogress')?.remove();
  if(!busy||!card)return;
  const box=document.createElement('div');box.className='registrationprogress';box.setAttribute('role','status');box.setAttribute('aria-live','polite');
  const spinner=document.createElement('span');spinner.className='preparationspinner';spinner.setAttribute('aria-hidden','true');
  const title=document.createElement('strong');title.textContent='Preparando sua solicitação';
  const text=document.createElement('p');text.textContent='Salvando seu cadastro e organizando as categorias do relatório.';
  box.append(spinner,title,text);card.append(box);
 }
 function reveal(container){
  stopReveal?.();
  if(!container||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const rows=[...container.querySelectorAll('.lockedrow')],timers=[];
  if(!rows.length)return;
  let elapsed=0;
  const interval=Math.min(500,3000/rows.length);
  container.setAttribute('aria-busy','true');
  const entries=rows.map(row=>{const value=row.querySelector('.lockedvalue'),nodes=[...value.childNodes];row.classList.add('pendingrow');row.setAttribute('aria-busy','true');const spinner=document.createElement('span');spinner.className='rowspinner';spinner.setAttribute('aria-hidden','true');const label=document.createElement('span');label.className='rowpreparing';label.textContent='Preparando';value.replaceChildren(spinner,label);return {row,value,nodes}});
  const finish=()=>{for(const timer of timers)clearTimeout(timer);for(const {row,value,nodes} of entries){value.replaceChildren(...nodes);row.classList.remove('pendingrow');row.setAttribute('aria-busy','false')}container.setAttribute('aria-busy','false');stopReveal=null};
  stopReveal=finish;
  entries.forEach(({row,value,nodes},index)=>{elapsed+=interval*(.55+Math.random()*.45);timers.push(setTimeout(()=>{if(!row.isConnected){finish();return}value.replaceChildren(...nodes);row.classList.remove('pendingrow');row.classList.add('revealedrow');row.setAttribute('aria-busy','false');if(index===entries.length-1){container.setAttribute('aria-busy','false');stopReveal=null}},elapsed))});
 }
 window.reportMotion={registration,reveal};
 window.addEventListener('hashchange',()=>{if(location.hash!=='#checkout')stopReveal?.()});
})();
