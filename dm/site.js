
(function(){
var HOOK='https://website-leads-hq.base44.app/api/quote';
function sms(f,body){var ios=/iP(hone|ad|od)/.test(navigator.userAgent);return 'sms:'+f.dataset.sms+(ios?'&':'?')+'body='+encodeURIComponent(body);}
[].slice.call(document.querySelectorAll('form.q')).forEach(function(f){
 f.addEventListener('submit',function(e){e.preventDefault();
  var d=new FormData(f),n=(d.get('name')||'').trim(),p=(d.get('phone')||'').trim(),ok=f.querySelector('.form-ok'),btn=f.querySelector('button[type=submit]');
  var digits=p.replace(/\D/g,'');if(digits.length===11&&digits[0]==='1')digits=digits.slice(1);
  var bad=!n?f.name:(digits.length!==10?f.phone:null);
  f.querySelectorAll('[aria-invalid]').forEach(function(x){x.removeAttribute('aria-invalid')});
  if(bad){bad.setAttribute('aria-invalid','true');var m=f.querySelector('.form-ok');m.innerHTML=bad===f.name?'Please add your name.':'Please enter a 10-digit phone number so we can call you back.';m.style.display='block';bad.focus();return;}
  p='('+digits.slice(0,3)+') '+digits.slice(3,6)+'-'+digits.slice(6);
  var rec={site:f.dataset.site,business:f.dataset.biz,name:n,phone:p,service:d.get('service'),city:d.get('city'),details:d.get('details')||'',page:location.href,status:'new'};
  var text='Quote request for '+f.dataset.biz+'\nName: '+n+'\nPhone: '+p+'\nService: '+rec.service+'\nCity: '+rec.city+'\nDetails: '+rec.details;
  btn.disabled=true;btn.style.opacity=.7;
  rec.website=d.get('website')||'';
  function post(u,h,body){return fetch(u,{method:'POST',headers:h,body:JSON.stringify(body)}).then(function(r){if(!r.ok)throw 0;return r;});}
  post(HOOK,{'Content-Type':'application/json'},rec)
  .catch(function(){return new Promise(function(r){setTimeout(r,1500)}).then(function(){return post(HOOK,{'Content-Type':'application/json'},rec);});})
  .then(function(){
    ok.innerHTML='<b>Got it, '+n.split(' ')[0].replace(/[<>&]/g,'')+'!</b> Your request is in and we will call you back at '+p.replace(/[<>&]/g,'')+'. In a hurry? <a href="'+sms(f,text)+'">Text us too</a>.';
    ok.style.display='block';f.reset();})
  .catch(function(){ok.innerHTML='Opening a text to us with your details. If nothing opens, call or text '+f.dataset.phone+'.';ok.style.display='block';location.href=sms(f,text);})
  .finally(function(){btn.disabled=false;btn.style.opacity=1;});
 });});
var qm=document.getElementById('quoteModal');
function openQ(){if(qm&&!qm.open){qm.showModal();try{sessionStorage.setItem('qmSeen','1')}catch(e){}var i=qm.querySelector('input');if(i)setTimeout(function(){i.focus()},50);}}
if(qm){
 [].slice.call(document.querySelectorAll('[data-quote]')).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();openQ();});});
 qm.querySelector('.x').onclick=function(){qm.close();};
 qm.addEventListener('click',function(e){if(e.target===qm)qm.close();});
 var seen=false;try{seen=sessionStorage.getItem('qmSeen')}catch(e){}
 if(!seen){var t=setTimeout(openQ,35000);
  window.addEventListener('scroll',function sc(){if(window.scrollY>(document.body.scrollHeight-innerHeight)*.6){clearTimeout(t);window.removeEventListener('scroll',sc);openQ();}},{passive:true});}
}
var g=[].slice.call(document.querySelectorAll('.gal button')),dlg=document.querySelector('dialog.lb');
if(dlg&&g.length){var im=null,i=0;
 function show(k){i=(k+g.length)%g.length;if(!im){im=document.createElement('img');dlg.insertBefore(im,dlg.querySelector('.next'));}im.src=g[i].dataset.full;im.alt=g[i].querySelector('img').alt;}
 g.forEach(function(b,k){b.addEventListener('click',function(){show(k);dlg.showModal();});});
 dlg.querySelector('.x').onclick=function(){dlg.close();};
 dlg.querySelector('.prev').onclick=function(){show(i-1);};dlg.querySelector('.next').onclick=function(){show(i+1);};
 dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close();});
 document.addEventListener('keydown',function(e){if(!dlg.open)return;if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1);});
 var x0=null;dlg.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
 dlg.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)show(i+(dx<0?1:-1));x0=null;});}
})();
