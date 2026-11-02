/* All sample rows are explicitly fictional and remain unreadable in every state. */
(function(root){
 function count(random=Math.random){return 2+Math.min(5,Math.floor(random()*6));}
 function examples(kind,n){return Array.from({length:n},(_,i)=>{
  if(kind==='addresses')return ['Rua de Exemplo '+(i+1)+', '+(120+i*37),'Bairro ilustrativo · Cidade de exemplo · 00000-000'];
  if(kind==='family')return ['Pessoa fictícia '+(i+1)+' · ************','Vínculo de exemplo · identificação protegida'];
  if(kind==='phones')return ['(00) 00000-0000','Contato fictício · número de exemplo'];
  if(kind==='work')return i%2?['Empregador de exemplo '+(i+1),'Vínculo profissional fictício · período protegido']:['Empresa fictícia '+(i+1)+' Ltda.','Participação ilustrativa · 00.000.000/0000-00'];
  return ['contato'+(i+1)+'@exemplo.invalid','Endereço eletrônico fictício'];
 });}
 root.LivePreview={count,examples};
})(globalThis);
