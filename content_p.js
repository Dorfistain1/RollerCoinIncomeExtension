(function(){
  const BUTTON_ID = 'rc-open-calculator-btn';

  function createButton(code){
    let btn = document.getElementById(BUTTON_ID);
    if(btn) {
      btn.dataset.code = code;
      return btn;
    }
    btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.dataset.code = code;
    btn.textContent = 'Open Calculator';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 2147483647,
      padding: '8px 12px',
      background: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
    });

    btn.addEventListener('click', function(){
      const code = btn.dataset.code || '';
      const url = 'https://rollercoincalculator.app/en/?prefill=' + encodeURIComponent(code);
      // Save prefill into chrome.storage so the calculator page can read it reliably
      try{
        if(window.chrome && chrome.storage && chrome.storage.local){
          chrome.storage.local.set({rc_prefill: code, rc_prefill_ts: Date.now()}, function(){
            window.open(url, '_blank');
          });
          return;
        }
      }catch(e){ /* fallthrough */ }
      // Fallback: just open URL with query param
      window.open(url, '_blank');
    });

    document.body.appendChild(btn);
    return btn;
  }

  function removeButton(){
    const btn = document.getElementById(BUTTON_ID);
    if(btn && btn.parentNode) btn.parentNode.removeChild(btn);
  }

  function ensureButtonForLocation(){
    const m = location.pathname.match(/\/p\/([^\/]+)/);
    if(m){
      const code = m[1];
      // ensure body exists
      if(!document.body){
        setTimeout(ensureButtonForLocation, 50);
        return;
      }
      createButton(code);
    } else {
      removeButton();
    }
  }

  // Detect SPA navigations by wrapping pushState/replaceState and listening to popstate
  (function(history){
    if(!history) return;
    const push = history.pushState;
    const replace = history.replaceState;
    history.pushState = function(){
      const ret = push.apply(this, arguments);
      window.dispatchEvent(new Event('locationchange'));
      return ret;
    };
    history.replaceState = function(){
      const ret = replace.apply(this, arguments);
      window.dispatchEvent(new Event('locationchange'));
      return ret;
    };
    window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
  })(window.history);

  // Observe DOM changes in case body appears later (single-page apps)
  const mo = new MutationObserver(() => ensureButtonForLocation());
  mo.observe(document.documentElement || document, {childList: true, subtree: true});

  window.addEventListener('locationchange', ensureButtonForLocation);

  // Initial run
  ensureButtonForLocation();
})();
