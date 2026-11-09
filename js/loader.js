(function(){
  var ld=document.getElementById('ld');if(!ld)return;
  var t0=Date.now(),done=false;
  function hide(){
    if(done)return;done=true;
    var wait=Math.max(0,3200-(Date.now()-t0));
    setTimeout(function(){ld.classList.add('off');setTimeout(function(){ld.remove();},800);},wait);
  }
  if(document.readyState==='complete')hide();else addEventListener('load',hide);
  setTimeout(hide,6000);
})();
