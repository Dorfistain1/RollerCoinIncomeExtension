(function(){
  function getParam(name){
    return new URLSearchParams(location.search).get(name);
  }
  const prefill = getParam('prefill');
  if(!prefill) return;

  function setValue(el, val){
    try{
      el.focus();
      el.value = val;
      el.dispatchEvent(new Event('input', {bubbles:true}));
      el.dispatchEvent(new Event('change', {bubbles:true}));
    }catch(e){/* ignore */}
  }

    function clearAndSeedStorage(val){
      try{
        // Remove suspicious localStorage keys and seed common keys
        const keys = Object.keys(localStorage || {});
        for(const k of keys){
          if(/power|prefill|value|calculator|rc/i.test(k)){
            try{ localStorage.removeItem(k); }catch(e){}
          }
        }
        try{ localStorage.setItem('rc_prefill', val); }catch(e){}
        try{ localStorage.setItem('power', val); }catch(e){}

        // Clear cookies for this domain (best-effort) then set a marker cookie
        const cookies = document.cookie.split(';').map(c=>c.trim()).filter(Boolean);
        for(const c of cookies){
          const name = c.split('=')[0];
          try{ document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;'; }catch(e){}
        }
        try{ document.cookie = 'rc_prefill=' + encodeURIComponent(val) + '; Path=/;'; }catch(e){}
      }catch(e){ /* ignore */ }
    }

    function forceSetInput(val){
      clearAndSeedStorage(val);
      // Try repeatedly for a short window so site scripts can't immediately overwrite us
      let attempts = 0;
      const max = 15;
      const iv = setInterval(()=>{
        attempts++;
        const el = document.querySelector('.power-value-input');
        if(el) setValue(el, val);
        if(attempts>=max) clearInterval(iv);
      }, 150);
      // also try once after a small delay
      setTimeout(()=>{
        const el = document.querySelector('.power-value-input');
        if(el) setValue(el, val);
      }, 500);
    }

  function waitFor(selector, timeout){
    timeout = timeout || 8000;
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if(el) return resolve(el);
      const obs = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if(found){ obs.disconnect(); resolve(found); }
      });
      obs.observe(document.documentElement, {childList:true, subtree:true});
      setTimeout(()=>{ obs.disconnect(); reject(new Error('timeout')); }, timeout);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
      if(prefill) forceSetInput(prefill);
      waitFor('.power-value-input', 8000).then(el => setValue(el, prefill)).catch(() => {
        const el = document.querySelector('.power-value-input');
        if(el) setValue(el, prefill);
      });
  });

  // Try to read prefill from chrome.storage (set by opener) as the most reliable method
  function readFromStorageAndApply(){
    try{
      if(window.chrome && chrome.storage && chrome.storage.local){
        chrome.storage.local.get(['rc_prefill','rc_prefill_ts'], function(items){
          try{
            if(!items || !items.rc_prefill) return;
            // apply only recent values (within 60s)
            const ts = items.rc_prefill_ts || 0;
            if(Date.now() - ts > 60000) return;
            const val = items.rc_prefill;
            forceSetInput(val);
            // remove the stored value so it doesn't affect other tabs
            chrome.storage.local.remove(['rc_prefill','rc_prefill_ts']);
          }catch(e){/*ignore*/}
        });
      }
    }catch(e){/*ignore*/}
  }

  readFromStorageAndApply();
})();
