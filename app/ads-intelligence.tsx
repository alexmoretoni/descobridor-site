'use client';
import {useEffect,useState} from 'react';
type Campaign={id:string;name:string;status:string;impressions:number;clicks:number;cost:number;conversions:number;value:number;cpc:number;cpa:number|null;roas:number|null};
const brl=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
const number=(n:number)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(n);
export default function AdsIntelligence(){
 const [state,setState]=useState<any>(null),[customerId,setCustomerId]=useState(''),[loginCustomerId,setLoginCustomerId]=useState(''),[result,setResult]=useState<any>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 useEffect(()=>{fetch('/api/ads-intelligence').then(r=>r.json()).then(setState).catch(()=>setError('Falha ao verificar integração.'))},[]);
 async function load(){setLoading(true);setError('');setResult(null);try{const r=await fetch('/api/ads-intelligence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerId,loginCustomerId})});const data=await r.json();if(!r.ok)throw Error(data.error||'Erro ao consultar campanhas.');setResult(data)}catch(e){setError(e instanceof Error?e.message:'Erro inesperado.')}finally{setLoading(false)}}
 const rows:Campaign[]=result?.campaigns||[];
 const total=rows.reduce((a,c)=>({cost:a.cost+c.cost,clicks:a.clicks+c.clicks,conversions:a.conversions+c.conversions,value:a.value+c.value}),{cost:0,clicks:0,conversions:0,value:0});
 const insights=rows.filter(c=>c.cost>0&&c.conversions===0).sort((a,b)=>b.cost-a.cost).slice(0,5);
 return <section>
  <div className="box"><h2>Inteligência Google Ads</h2><p className="hint">Versão econômica: relatórios reais da Rede de Pesquisa em modo somente leitura, com análise automática por regras. Não altera campanhas e não envia dados de clientes à IA.</p>
  <p className="hint">{state?.configured?'Developer token identificado no servidor.':'Pendente: configurar GOOGLE_ADS_DEVELOPER_TOKEN como segredo no servidor.'} É necessário reconectar a conta em Integrações Google para conceder o escopo Google Ads adwords.</p>
  <div className="formgrid"><label>ID da conta Google Ads (10 dígitos)<input value={customerId} onChange={e=>setCustomerId(e.target.value)} placeholder="123-456-7890" inputMode="numeric" maxLength={12}/></label><label>ID da conta administradora MCC (opcional)<input value={loginCustomerId} onChange={e=>setLoginCustomerId(e.target.value)} placeholder="123-456-7890" inputMode="numeric" maxLength={12}/></label></div>
  <button className="primary" disabled={loading||!state?.configured} onClick={load}>{loading?'Consultando…':'Consultar últimos 30 dias'}</button>
  {error&&<p role="alert" className="message error">{error}</p>}
  </div>
  {result&&<><div className="metrics"><div className="metric"><span>Investimento</span><b>{brl(total.cost)}</b></div><div className="metric"><span>Cliques</span><b>{number(total.clicks)}</b></div><div className="metric"><span>Conversões informadas pelo Ads</span><b>{number(total.conversions)}</b></div><div className="metric"><span>Custo por conversão</span><b>{total.conversions?brl(total.cost/total.conversions):'—'}</b></div></div>
  <div className="box"><h2>Campanhas da conta</h2><p className="hint">Dados do Google Ads, últimos 30 dias. Conversões não representam necessariamente pagamentos aprovados. Valores monetários apresentados em BRL somente se a conta usar BRL.</p><div className="tablewrap"><table><thead><tr><th>Campanha</th><th>Status</th><th>Cliques</th><th>Custo</th><th>CPC</th><th>Conversões</th><th>CPA</th><th>ROAS*</th></tr></thead><tbody>{rows.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.status}</td><td>{number(c.clicks)}</td><td>{brl(c.cost)}</td><td>{brl(c.cpc)}</td><td>{number(c.conversions)}</td><td>{c.cpa===null?'—':brl(c.cpa)}</td><td>{c.roas===null?'—':number(c.roas)+'x'}</td></tr>)}</tbody></table></div>{!rows.length&&<p>Nenhuma campanha retornada.</p>}<p className="hint">*ROAS conforme o valor de conversão configurado no Google Ads. Não equivale necessariamente a lucro.</p></div>
  <div className="box"><h2>Diagnóstico automatizado (regras transparentes)</h2>{insights.length?<><p>Campanhas com investimento e nenhuma conversão atribuída no período:</p><ul>{insights.map(c=><li key={c.id}>{c.name}: {brl(c.cost)} gastos, {number(c.clicks)} cliques. Revise termos de pesquisa, página de destino e medição antes de ajustar orçamento.</li>)}</ul></>:<p>Nenhuma campanha com gasto e zero conversões no período consultado.</p>}<p className="hint">Este MVP usa regras determinísticas, ainda não um modelo generativo de IA. Para recomendar lances com segurança, integrar dados de pagamento e margens por produto.</p></div></>}
 </section>
}
