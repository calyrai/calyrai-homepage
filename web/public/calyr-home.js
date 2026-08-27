(() => {
  if (location.pathname === '/' || document.querySelector('.calyr-home-button')) return;
  const link = document.createElement('a');
  link.className = 'calyr-home-button';
  link.href = '/';
  link.setAttribute('aria-label', 'Back to calyr.aí homepage');
  link.textContent = 'calyr.aí · home';
  const style = document.createElement('style');
  style.textContent = `.calyr-home-button{position:fixed;right:18px;bottom:18px;z-index:2147483647;display:inline-flex;align-items:center;min-height:38px;padding:0 15px;border:1px solid rgba(255,255,255,.38);border-radius:999px;background:rgba(5,5,5,.88);color:#fff!important;font:600 11px/1 Arial,sans-serif;letter-spacing:.08em;text-decoration:none!important;text-transform:lowercase;box-shadow:0 5px 22px rgba(0,0,0,.24);backdrop-filter:blur(10px);transition:background .18s,color .18s,transform .18s}.calyr-home-button:hover,.calyr-home-button:focus-visible{background:#fff;color:#050505!important;transform:translateY(-2px);outline:none}@media(max-width:720px){.calyr-home-button{right:12px;bottom:12px;min-height:34px;padding:0 12px;font-size:9px}}`;
  document.head.append(style);
  document.body.append(link);
})();
