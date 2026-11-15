'use client';
import {useEffect,useState} from 'react';
import type {CustomScript} from './custom-scripts';
type ScriptResponse={scripts:CustomScript[];revision:string|null;error?:string};
export default function TrackingAdmin({pixel,savePixel,busy}:{pixel:string;savePixel:(value:string)=>Promise<boolean>;busy:boolean}){
 const [scripts,setScripts]=useState<CustomScript[]>([]),[value,setValue]=useState(pixel),[message,setMessage]=useState(''),[saving,setSaving]=useState(false);
 const [revision,setRevision]=useState<string|null|undefined>(undefined);
 useEffect(()=>setValue(pixel),[pixel]);
 useEffect(()=>{fetch('/api/custom-scripts').then(async r=>{const v=await r.json() as ScriptResponse;if(!r.ok)throw Error(v.error);setScripts(v.scripts);setRevision(v.revision)}).catch(e=>setMessage(e.message))},[]);
 const change=(id:string,patch:Partial<CustomScript>)=>setScripts(items=>items.map(s=>s.id===id?{...s,...patch}:s));
 const add=()=>setScripts(items=>[...items,{id:crypto.randomUUID(),name:'',src:'',code:'',enabled:false}]);
 async function save(){
  setSaving(true);setMessage('');
  try{
   const r=await fetch('/api/custom-scripts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scripts,revision})});
   const v=await r.json() as ScriptResponse;
   if(!r.ok)throw Error(v.error);
   setScripts(v.scripts);setRevision(v.revision);
   setMessage('Scripts salvos. Abra uma página pública e aceite as ferramentas para testar.');
  }catch(e){setMessage((e as Error).message)}finally{setSaving(false)}
 }
 return <><section className="box"><h2>Tags de acompanhamento</h2><p>Google Analytics, Tag Manager, Search Console e Ads ficam em <strong>Integrações Google</strong>. Aqui você pode configurar o Meta Pixel e scripts adicionais.</p><label>ID do Meta Pixel<input value={value} placeholder="Somente números" onChange={e=>setValue(e.target.value.trim())}/></label><p className="hint">O pixel é carregado após consentimento em páginas públicas. Não recebe CPF, nome, telefone nem e-mail pelos eventos implementados.</p><button className="primary" disabled={busy} onClick={()=>savePixel(value)}>Salvar Meta Pixel</button></section>
 <section className="box"><h2>Scripts do rodapé</h2>
 <p>As tags ativas carregam após a página e o consentimento, em um quadro separado dos formulários. Widgets que precisam aparecer na página, como o Tidio, exigem integração própria.</p>
 <p className="hint">Use a URL HTTPS do arquivo ou JavaScript puro. O código é público quando ativado. Use apenas fornecedores confiáveis e mantenha credenciais fora destes campos.</p>
 <fieldset disabled={saving||revision===undefined} style={{border:0,padding:0,margin:0,minWidth:0}}>
 {scripts.map((item,i)=><div key={item.id} style={{border:'1px solid #e9e3ef',borderRadius:12,padding:18,margin:'16px 0'}}>
 <div className="toolbar"><h3 style={{margin:0}}>Script {i+1}</h3><button type="button" className="secondary" onClick={()=>setScripts(items=>items.filter(s=>s.id!==item.id))}>Remover</button></div>
 <div className="formgrid"><label>Nome para identificar<input maxLength={80} value={item.name} onChange={e=>change(item.id,{name:e.target.value})}/></label><label>URL do arquivo<input maxLength={500} placeholder="https://exemplo.com/tag.js" value={item.src} onChange={e=>change(item.id,{src:e.target.value.trim()})}/></label></div>
 <label>JavaScript personalizado<textarea rows={5} maxLength={4000} value={item.code} onChange={e=>change(item.id,{code:e.target.value})} placeholder="Cole o código sem as tags script" style={{display:'block',width:'100%',marginTop:8,fontFamily:'monospace'}}/></label>
 <p><label><input type="checkbox" checked={item.enabled} onChange={e=>change(item.id,{enabled:e.target.checked})}/> Ativo após consentimento</label></p>
 </div>)}
 <div className="toolbar">
 <button type="button" className="secondary" disabled={scripts.length>=5} onClick={add}>Adicionar script</button>
 <button type="button" className="primary" onClick={save}>{saving?'Salvando…':'Salvar scripts'}</button>
 </div>
 </fieldset>
 <p role="status">{message}</p><p className="hint">Até cinco scripts. Desativar mantém a configuração salva. Remover exclui o item ao salvar.</p></section></>
}
