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
