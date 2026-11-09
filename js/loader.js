(function(){
  var ld=document.getElementById('ld');if(!ld)return;
  // Minimum time the loading animation stays up (ms). First visit only; returning visitors skip it.
  var FIRST_VISIT_MIN=1200, MAX_WAIT=4000;
  var seen=false;try{seen=!!localStorage.getItem('tf_seen');localStorage.setItem('tf_seen','1');}catch(e){}
  var t0=Date.now(),done=false,min=seen?0:FIRST_VISIT_MIN;
  function hide(){
    if(done)return;done=true;
    setTimeout(function(){ld.classList.add('off');setTimeout(function(){ld.remove();},800);},Math.max(0,min-(Date.now()-t0)));
  }
  // Ready = the app has replaced the boot placeholder and fonts are loaded (no need to wait for every image/script).
  var root=document.getElementById('root');
  function rendered(){return !root||!root.querySelector('.boot');}
  var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
  var appReady=new Promise(function(res){
    if(rendered())return res();
    var mo=new MutationObserver(function(){if(rendered()){mo.disconnect();res();}});
    mo.observe(root,{childList:true,subtree:true});
  });
  Promise.all([appReady,fonts]).then(hide,hide);
  setTimeout(hide,MAX_WAIT);
})();
