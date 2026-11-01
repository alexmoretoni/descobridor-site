/* Keep the registration dialog inside the area above the on-screen keyboard. */
window.fitRegistrationDialog=function(dialog){
 let host=window,frame=null;
 try{if(window.top!==window&&window.top.location.origin===window.location.origin){host=window.top;frame=window.frameElement}}catch{}
 const viewport=host.visualViewport||window.visualViewport;
 let pending=0,closed=false;
 function update(){
  pending=0;if(closed||!dialog.isConnected)return;
  const frameTop=frame?frame.getBoundingClientRect().top:0;
  const visibleTop=viewport?viewport.offsetTop:0;
  const visibleHeight=viewport?viewport.height:host.innerHeight;
  const top=Math.max(0,visibleTop-frameTop);
  const bottom=Math.min(window.innerHeight,visibleTop+visibleHeight-frameTop);
  const height=Math.max(80,bottom-top);
  dialog.style.setProperty('--registration-top',Math.round(top+8)+'px');
  dialog.style.setProperty('--registration-height',Math.floor(height-16)+'px');
  dialog.classList.toggle('tightviewport',height<380);
 }
 function schedule(){if(!pending&&!closed)pending=requestAnimationFrame(update)}
 const targets=[window,...(host!==window?[host]:[]),...(viewport?[viewport]:[])];
 for(const target of targets){target.addEventListener('resize',schedule,{passive:true});target.addEventListener('scroll',schedule,{passive:true})}
 document.body.classList.add('registrationopen');document.documentElement.classList.add('registrationopen');update();
 function cleanup(){if(closed)return;closed=true;if(pending)cancelAnimationFrame(pending);for(const target of targets){target.removeEventListener('resize',schedule);target.removeEventListener('scroll',schedule)}document.body.classList.remove('registrationopen');document.documentElement.classList.remove('registrationopen')}
 dialog.addEventListener('close',cleanup,{once:true});
 return cleanup;
};
