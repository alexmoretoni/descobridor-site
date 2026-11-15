import {tidioSrc} from '../../custom-scripts';

export async function GET(){
 try{
  const upstream=await fetch(tidioSrc,{redirect:'follow'});
  if(!upstream.ok)return new Response(null,{status:502,headers:{'Cache-Control':'no-store'}});
  return new Response(await upstream.arrayBuffer(),{
   headers:{
    'Content-Type':'application/javascript; charset=utf-8',
    'Cache-Control':'public, max-age=300',
    'X-Content-Type-Options':'nosniff',
   },
  });
 }catch{return new Response(null,{status:502,headers:{'Cache-Control':'no-store'}})}
}
