'use client';
import {useEffect} from 'react';
// The retained public UI owns its DOM after React has hydrated the SSR shell.
export default function PublicRuntime({src}:{src:string}){
 useEffect(()=>{
  if(document.getElementById('public-runtime-script'))return;
  const script=document.createElement('script');script.id='public-runtime-script';script.src=src;script.async=true;
  script.onload=()=>document.querySelectorAll<HTMLButtonElement>('[data-runtime-pending]').forEach(button=>{button.disabled=false;button.removeAttribute('data-runtime-pending');});
  script.onerror=()=>{const hint=document.querySelector('#searchform small');if(hint)hint.textContent='Não foi possível carregar o formulário. Recarregue a página para tentar novamente.';};
  document.body.appendChild(script);
 },[src]);
 return <span hidden data-public-runtime={src}/>;
}
