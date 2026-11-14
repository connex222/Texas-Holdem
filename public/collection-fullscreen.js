/* Texas-Holdem: accessible, gesture-initiated fullscreen on TV and phones. */
(() => {
  'use strict';
  const root = document.documentElement;
  const supported = () => typeof root.requestFullscreen === 'function' && typeof document.exitFullscreen === 'function';
  const active = () => Boolean(document.fullscreenElement);
  let autoAttempted = false;
  const style = document.createElement('style');
  style.textContent = `
    #collection-fullscreen-control{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:2147483000;min-height:44px;padding:10px 14px;border:2px solid rgba(255,255,255,.6);border-radius:10px;background:#14223a;color:#fff;font:700 13px/1.2 system-ui,sans-serif;letter-spacing:.035em;box-shadow:0 4px 18px rgba(0,0,0,.4);cursor:pointer}
    #collection-fullscreen-control:focus-visible{outline:3px solid #ffdb58;outline-offset:3px}
    #collection-fullscreen-control:disabled{opacity:.65;cursor:not-allowed}
    body{min-height:100dvh}
  `;
  document.head.appendChild(style);
  // Keep the display toggle clear of other interactive elements on every screen.
  let placementQueued = false;
  function placeControl() {
    placementQueued = false;
    const control = document.getElementById('collection-fullscreen-control');
    if (!control) return;
    const viewport = window.visualViewport;
    const width = viewport ? viewport.width : window.innerWidth;
    const height = viewport ? viewport.height : window.innerHeight;
    const inset = 12;
    const bw = control.offsetWidth || 150;
    const bh = control.offsetHeight || 44;
    if (width < bw + inset * 2 || height < bh + inset * 2) return;
    const obstacles = [...document.querySelectorAll('button, a[href], input, select, textarea, summary, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])')]
      .filter(el => el !== control && !control.contains(el) && !el.contains(control))
      .filter(el => {
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none';
      })
      .map(el => el.getBoundingClientRect())
      .filter(r => r.width > 0 && r.height > 0 && r.width < width * .8 && r.height < height * .8 && r.bottom > 0 && r.top < height);
    const free = (x,y) => !obstacles.some(r => x < r.right + 8 && x + bw > r.left - 8 && y < r.bottom + 8 && y + bh > r.top - 8);
    const right = width - bw - inset;
    const bottom = height - bh - inset;
    const candidates = [[right,inset],[inset,inset],[right,bottom],[inset,bottom]];
    for (let y = inset + bh + 12; y + bh <= bottom; y += bh + 12) {
      candidates.push([right,y],[inset,y]);
    }
    const match = candidates.find(([x,y]) => free(x,y));
    if (!match) {
      // Never layer an unavoidable fullscreen toggle over another button.
      control.style.visibility = 'hidden';
      return;
    }
    control.style.visibility = '';
    control.style.left = Math.round(match[0]) + 'px';
    control.style.top = Math.round(match[1]) + 'px';
    control.style.right = 'auto';
    control.style.bottom = 'auto';
  }
  function schedulePlacement() {
    if (placementQueued) return;
    placementQueued = true;
    requestAnimationFrame(placeControl);
  }
  window.addEventListener('resize', schedulePlacement, {passive:true});
  window.addEventListener('scroll', schedulePlacement, {passive:true});
  document.addEventListener('fullscreenchange', schedulePlacement);
  const observer = new MutationObserver(mutations => {
    if (mutations.some(m => !m.target.closest?.('#collection-fullscreen-control'))) schedulePlacement();
  });
  observer.observe(document.documentElement, {childList:true,subtree:true});
  function sync() {
    const control = document.getElementById('collection-fullscreen-control');
    if (!control) return;
    const on = active();
    control.textContent = on ? '⤢ EXIT FULLSCREEN' : '⛶ FULLSCREEN';
    control.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Enter fullscreen');
    control.setAttribute('aria-pressed', String(on));
  }
  function request() {
    if (!supported() || active()) return;
    // Must happen directly inside the trusted user activation event.
    try { Promise.resolve(root.requestFullscreen()).then(sync).catch(sync); } catch (_) { sync(); }
  }
  function mount() {
    if (document.getElementById('collection-fullscreen-control')) return;
    const button = document.createElement('button');
    button.id = 'collection-fullscreen-control';
    button.type = 'button';
    button.disabled = !supported();
    if (button.disabled) button.title = 'Use your browser fullscreen control where supported';
    button.addEventListener('click', () => {
      autoAttempted = true;
      if (active()) {
        try { Promise.resolve(document.exitFullscreen()).then(sync).catch(sync); } catch (_) { sync(); }
      } else request();
    });
    document.body.appendChild(button);
    sync();
    schedulePlacement();
  }
  // A browser disallows fullscreen without user activation. Use the first
  // deliberate game-start action, not a load timer or text-field focus.
  document.addEventListener('click', event => {
    if (autoAttempted || active() || !supported() || !event.isTrusted) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('#collection-fullscreen-control, input, textarea, select, a, [contenteditable="true"]')) return;
    const trigger = target.closest('button, [role="button"], input[type="submit"]');
    if (!trigger || trigger.disabled) return;
    autoAttempted = true;
    request();
  }, true);
  document.addEventListener('fullscreenchange', sync);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
