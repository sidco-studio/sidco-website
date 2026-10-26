/* Decorative light only: pointer input and native scrolling remain untouched. */
(() => {
  const makeGlow = className => {
    const glow = document.querySelector(`.${className}`) || document.createElement('div');
    glow.classList.add(className);
    glow.setAttribute('aria-hidden', 'true');
    if (!glow.isConnected) document.body.append(glow);
    return glow;
  };
  const cursorGlow = makeGlow('cursor-glow');
  const scrollbarGlow = makeGlow('scrollbar-glow');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const controlSelector = 'button, .button, .header-contact, .contact-arrow, .text-link';
  let activeControl = null;
  let pointerX = 0, pointerY = 0;
  let cursorFrame = 0;
  let scrollFrame = 0;
  let scrollbarVisible = false;
  let scrollbarHideTimer = 0;
  let hasPosition = false;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  const cursorEnabled = () => !reduced.matches && finePointer.matches && !document.hidden;
  const positionCursor = () => {
    cursorGlow.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  };
  function hideCursor() {
    cursorGlow.classList.remove('is-active');
    if (cursorFrame) cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
    hasPosition = false;
    activeControl = null;
  }
  function hoveredControl(target) {
    const control = target instanceof Element ? target.closest(controlSelector) : null;
    return control && !control.matches(':disabled, [aria-disabled="true"]') && !control.closest('[inert]') ? control : null;
  }
  function validateCursor() {
    if (activeControl && (!cursorEnabled() || hoveredControl(document.elementFromPoint(pointerX, pointerY)) !== activeControl)) hideCursor();
  }
  function followCursor() {
    cursorFrame = 0;
    if (!cursorEnabled() || !activeControl) { hideCursor(); return; }
    const dx = targetX - x, dy = targetY - y;
    if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
      x = targetX; y = targetY;
      positionCursor();
      return;
    }
    x += dx * 0.2; y += dy * 0.2;
    positionCursor();
    cursorFrame = requestAnimationFrame(followCursor);
  }
  function onPointerMove(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') { hideCursor(); return; }
    pointerX = event.clientX;
    pointerY = event.clientY;
    const control = hoveredControl(event.target);
    if (!cursorEnabled() || !control) { hideCursor(); return; }
    activeControl = control;
    targetX = pointerX - 210;
    targetY = pointerY - 210;
    if (!hasPosition) {
      x = targetX; y = targetY;
      hasPosition = true;
      positionCursor();
    } else if (!cursorFrame) {
      cursorFrame = requestAnimationFrame(followCursor);
    }
    cursorGlow.classList.add('is-active');
  }
  function hideScrollbar() {
    scrollbarVisible = false;
    clearTimeout(scrollbarHideTimer);
    scrollbarHideTimer = 0;
    document.documentElement.classList.remove('scrollbar-visible');
    scrollbarGlow.classList.remove('is-active');
  }
  function showScrollbar() {
    const root = document.scrollingElement || document.documentElement;
    const viewport = document.documentElement.clientHeight || window.innerHeight;
    if (document.hidden || root.scrollHeight <= viewport + 1) {
      hideScrollbar();
      return;
    }
    scrollbarVisible = true;
    document.documentElement.classList.add('scrollbar-visible');
    clearTimeout(scrollbarHideTimer);
    scrollbarHideTimer = setTimeout(hideScrollbar, 3000);
    requestScrollbar();
  }
  function updateScrollbar() {
    scrollFrame = 0;
    if (document.hidden) return;
    const root = document.scrollingElement || document.documentElement;
    const viewport = document.documentElement.clientHeight || window.innerHeight;
    const scrollHeight = root.scrollHeight;
    const overflow = scrollHeight - viewport;
    if (overflow <= 1 || viewport <= 0) { hideScrollbar(); return; }
    scrollbarGlow.classList.toggle('is-active', scrollbarVisible && !document.hidden);
    const thumbHeight = Math.min(viewport, Math.max(32, viewport * viewport / scrollHeight));
    const progress = Math.max(0, Math.min(1, root.scrollTop / overflow));
    const top = progress * (viewport - thumbHeight);
    scrollbarGlow.style.height = `${thumbHeight.toFixed(2)}px`;
    scrollbarGlow.style.transform = `translate3d(0, ${top.toFixed(2)}px, 0)`;
  }
  function requestScrollbar() {
    if (!scrollFrame && !document.hidden) scrollFrame = requestAnimationFrame(updateScrollbar);
  }
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerover', onPointerMove, { passive: true });
  document.addEventListener('pointermove', event => {
    if (event.clientX >= window.innerWidth - 24 && event.clientX <= window.innerWidth &&
        event.clientY >= 0 && event.clientY <= window.innerHeight) showScrollbar();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hideCursor, { passive: true });
  document.addEventListener('pointerout', event => {
    if (!event.relatedTarget || (activeControl && hoveredControl(event.relatedTarget) !== activeControl)) hideCursor();
  }, { passive: true });
  window.addEventListener('blur', hideCursor);
  // A stationary pointer must not leave a glow behind when a control scrolls away.
  window.addEventListener('scroll', validateCursor, { passive: true, capture: true });
  window.addEventListener('resize', validateCursor, { passive: true });
  window.addEventListener('scroll', showScrollbar, { passive: true });
  window.addEventListener('resize', showScrollbar, { passive: true });
  window.addEventListener('load', showScrollbar, { once: true });
  new ResizeObserver(requestScrollbar).observe(document.body);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hideCursor();
      hideScrollbar();
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    } else showScrollbar();
  });
  const onMediaChange = () => { if (!cursorEnabled()) hideCursor(); };
  reduced.addEventListener('change', onMediaChange);
  finePointer.addEventListener('change', onMediaChange);
  if (document.fonts) document.fonts.ready.then(requestScrollbar);
  showScrollbar();
})();
