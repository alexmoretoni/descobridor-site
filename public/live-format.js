/* Local format checks only: no identity, ownership or database verification. */
(function(root){
 const digits=v=>String(v||'').replace(/\D/g,'');
 function phoneDigits(v){const n=digits(v);return n.length>11&&n.startsWith('55')?n.slice(2,13):n.slice(0,11);}
 function cpf(v){return digits(v).slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/,'$1.$2.$3-$4');}
 function phone(v){const n=phoneDigits(v);return n.length>2?'('+n.slice(0,2)+') '+n.slice(2).replace(n.length>10?/^(\d{5})(\d)/:/^(\d{4})(\d)/,'$1-$2'):n;}
 function validCPF(v){const n=digits(v);if(n.length!==11||/^(\d)\1+$/.test(n))return false;for(let t=9;t<11;t++){let sum=0;for(let i=0;i<t;i++)sum+=Number(n[i])*(t+1-i);let check=sum*10%11;if(check===10)check=0;if(check!==Number(n[t]))return false;}return true;}
 const ddds=new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '));
 function validPhone(v){const n=phoneDigits(v);return ddds.has(n.slice(0,2))&&(n.length===11&&n[2]==='9'||n.length===10&&/^[2-5]/.test(n.slice(2)));}
 root.LiveFormat={digits,phoneDigits,cpf,phone,validCPF,validPhone};
})(globalThis);
