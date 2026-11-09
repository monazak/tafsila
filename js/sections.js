(function(){
  var sel='#designs,#packages,#how,.band,#contact';
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var t=e.target;
      if(e.isIntersecting){t.setAttribute('data-sec','in');}
      else{t.setAttribute('data-sec',e.boundingClientRect.top>0?'below':'above');}
    });
  },{rootMargin:'0px 0px -14% 0px',threshold:0});
  function scan(){
    document.querySelectorAll(sel).forEach(function(el){
      if(el.__secObs)return;
      el.__secObs=1;
      var r=el.getBoundingClientRect();
      el.setAttribute('data-sec',r.top<innerHeight*.86&&r.bottom>0?'in':(r.top>=innerHeight*.86?'below':'above'));
      io.observe(el);
    });
  }
  new MutationObserver(scan).observe(document.getElementById('root'),{childList:true,subtree:true});
  scan();
})();
