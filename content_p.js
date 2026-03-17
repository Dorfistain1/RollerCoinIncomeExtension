(function(){
  // Stealthy button: no global IDs or dataset; use a closed ShadowRoot so page scripts can't access it.
  let hostEl = null;
  let shadowBtn = null;
  const codeMap = new WeakMap();
  let lastPath = location.pathname;

  function makeHostAndButton(code){
    if(!document.body) return null;
    if(hostEl) return shadowBtn;

    hostEl = document.createElement('div');
    hostEl.setAttribute('aria-hidden', 'true');
    // keep host visually inert
    hostEl.style.position = 'static';
    hostEl.style.width = '0';
    hostEl.style.height = '0';

    const shadow = hostEl.attachShadow({mode: 'closed'});
    const wrapper = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = '\n  .__rc_wrapper{position:fixed;bottom:16px;right:16px;z-index:2147483647}\n  .__rc_btn{padding:8px 12px;background:#1976d2;color:#fff;border:none;border-radius:6px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3)}\n';
    const btn = document.createElement('button');
    btn.className = '__rc_btn';
    btn.textContent = 'Open Calculator';
    const container = document.createElement('div');
    container.className = '__rc_wrapper';
    container.appendChild(btn);
    shadow.appendChild(style);
    shadow.appendChild(container);

    btn.addEventListener('click', function(){
      const code = codeMap.get(btn) || '';
      const url = 'https://rollercoincalculator.app/en/?prefill=' + encodeURIComponent(code);
      try{
        if(window.chrome && chrome.storage && chrome.storage.local){
          chrome.storage.local.set({rc_prefill: code, rc_prefill_ts: Date.now()}, function(){
            window.open(url, '_blank');
          });
          return;
        }
      }catch(e){ }
      window.open(url, '_blank');
    });

    shadowBtn = btn;
    codeMap.set(btn, code || '');
    document.body.appendChild(hostEl);
    return btn;
  }

  function removeHost(){
    if(hostEl && hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
    hostEl = null;
    shadowBtn = null;
  }

  function ensureButtonForLocation(){
    const m = location.pathname.match(/\/p\/([^\/]+)/);
    if(m){
      const code = m[1];
      if(!document.body){ return; }
      const btn = makeHostAndButton(code);
      if(btn) codeMap.set(btn, code);
    } else {
      removeHost();
    }
  }

  // Use popstate + polling instead of wrapping history functions to avoid detection
  window.addEventListener('popstate', () => {
    ensureButtonForLocation();
    lastPath = location.pathname;
  });

  // Poll for SPA path changes (low-frequency, less invasive)
  setInterval(()=>{
    if(location.pathname !== lastPath){
      lastPath = location.pathname;
      ensureButtonForLocation();
    }
  }, 300);

  // Ensure body exists, then initial run
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensureButtonForLocation, {once:true});
  } else {
    ensureButtonForLocation();
  }
})();
