/* Local button light and an overlay control for the native page scroll. */
(() => {
  const makeGlow = className => {
    const glow = document.querySelector(`.${className}`) || document.createElement('div');
    glow.classList.add(className);
    glow.setAttribute('aria-hidden', 'true');
    if (!glow.isConnected) document.body.append(glow);
    return glow;
  };
  // One reusable glow is clipped inside the current control, never the page.
  document.querySelectorAll('body > .cursor-glow').forEach(glow => glow.remove());
  const cursorClip = document.querySelector('.button-hover-clip') || document.createElement('i');
  cursorClip.classList.add('button-hover-clip');
  cursorClip.setAttribute('aria-hidden', 'true');
  const cursorGlow = cursorClip.querySelector('.cursor-glow') || document.createElement('i');
  cursorGlow.classList.add('cursor-glow');
  cursorGlow.setAttribute('aria-hidden', 'true');
  if (cursorGlow.parentElement !== cursorClip) cursorClip.append(cursorGlow);
  const scrollbarGlow = makeGlow('scrollbar-glow');
  const scrollbarRail = document.querySelector('.scrollbar-rail') || document.createElement('div');
  scrollbarRail.classList.add('scrollbar-rail');
  if (!scrollbarRail.isConnected) document.body.append(scrollbarRail);
  const scrollbarThumb = document.querySelector('.scrollbar-thumb') || document.createElement('div');
  scrollbarThumb.classList.add('scrollbar-thumb');
  scrollbarThumb.setAttribute('role', 'scrollbar');
  scrollbarThumb.setAttribute('aria-label', 'Pagina scrollen');
  scrollbarThumb.setAttribute('aria-controls', 'page-scroll');
  scrollbarThumb.setAttribute('aria-orientation', 'vertical');
  scrollbarThumb.setAttribute('aria-valuemin', '0');
  scrollbarThumb.setAttribute('aria-valuemax', '100');
  scrollbarThumb.setAttribute('aria-valuenow', '0');
  scrollbarThumb.tabIndex = -1;
  scrollbarThumb.style.display = 'none';
  if (scrollbarThumb.parentElement !== scrollbarRail) scrollbarRail.append(scrollbarThumb);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const controlSelector = 'button, .button, .header-contact, .contact-arrow, .text-link';
  let activeControl = null;
  let pointerX = 0, pointerY = 0;
  let cursorFrame = 0;
  let scrollFrame = 0;
  let scrollbarVisible = false;
  let scrollbarHovered = false;
  let scrollbarHideTimer = 0;
  let drag = null;
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
    const changedControl = activeControl !== control || cursorClip.parentElement !== control;
    if (changedControl) {
      control.classList.add('has-hover-glow');
      control.append(cursorClip);
    }
    activeControl = control;
    const bounds = control.getBoundingClientRect();
    targetX = pointerX - bounds.left - control.clientLeft - 210;
    targetY = pointerY - bounds.top - control.clientTop - 210;
    if (!hasPosition || changedControl) {
      if (cursorFrame) cancelAnimationFrame(cursorFrame);
      cursorFrame = 0;
      x = targetX; y = targetY;
      hasPosition = true;
      positionCursor();
    } else if (!cursorFrame) {
      cursorFrame = requestAnimationFrame(followCursor);
    }
    cursorGlow.classList.add('is-active');
  }
  function scrollMetrics() {
    const root = document.scrollingElement || document.documentElement;
    const viewport = document.documentElement.clientHeight || window.innerHeight;
    const scrollHeight = root.scrollHeight;
    const overflow = Math.max(0, scrollHeight - viewport);
    const thumbHeight = Math.min(viewport, Math.max(32, viewport * viewport / Math.max(1, scrollHeight)));
    return { root, viewport, overflow, thumbHeight, travel: Math.max(0, viewport - thumbHeight) };
  }
  function setScrollbarAvailable(available) {
    scrollbarThumb.tabIndex = available ? 0 : -1;
    if (available) {
      scrollbarThumb.style.removeProperty('display');
      scrollbarThumb.removeAttribute('aria-hidden');
    } else {
      scrollbarThumb.style.display = 'none';
      scrollbarThumb.setAttribute('aria-hidden', 'true');
      if (document.activeElement === scrollbarThumb) scrollbarThumb.blur();
    }
  }
  function hideScrollbar(force = false) {
    clearTimeout(scrollbarHideTimer);
    scrollbarHideTimer = 0;
    if (!force && (drag || scrollbarHovered || document.activeElement === scrollbarThumb)) return;
    if (force) scrollbarHovered = false;
    scrollbarVisible = false;
    document.documentElement.classList.remove('scrollbar-visible');
    scrollbarRail.classList.remove('is-active');
    scrollbarThumb.classList.remove('is-active');
    scrollbarGlow.classList.remove('is-active');
  }
  function showScrollbar() {
    const metrics = scrollMetrics();
    if (document.hidden || metrics.overflow <= 1 || metrics.viewport <= 0) {
      endDrag(null, false);
      hideScrollbar(true);
      if (metrics.overflow <= 1 || metrics.viewport <= 0) setScrollbarAvailable(false);
      return;
    }
    setScrollbarAvailable(true);
    scrollbarVisible = true;
    document.documentElement.classList.add('scrollbar-visible');
    scrollbarRail.classList.add('is-active');
    scrollbarThumb.classList.add('is-active');
    scrollbarGlow.classList.add('is-active');
    clearTimeout(scrollbarHideTimer);
    scrollbarHideTimer = 0;
    if (!drag && !scrollbarHovered && document.activeElement !== scrollbarThumb) {
      scrollbarHideTimer = setTimeout(hideScrollbar, 3000);
    }
    requestScrollbar();
  }
  function updateScrollbar() {
    scrollFrame = 0;
    if (document.hidden) return;
    const metrics = scrollMetrics();
    if (metrics.overflow <= 1 || metrics.viewport <= 0) {
      endDrag(null, false);
      hideScrollbar(true);
      setScrollbarAvailable(false);
      return;
    }
    setScrollbarAvailable(true);
    const progress = Math.max(0, Math.min(1, metrics.root.scrollTop / metrics.overflow));
    const top = progress * metrics.travel;
    const active = scrollbarVisible && !document.hidden;
    scrollbarRail.classList.toggle('is-active', active);
    scrollbarThumb.classList.toggle('is-active', active);
    scrollbarGlow.classList.toggle('is-active', active);
    scrollbarThumb.style.height = `${metrics.thumbHeight.toFixed(2)}px`;
    scrollbarThumb.style.transform = `translate3d(0, ${top.toFixed(2)}px, 0)`;
    scrollbarThumb.setAttribute('aria-valuenow', (progress * 100).toFixed(1));
    scrollbarThumb.setAttribute('aria-valuetext', `${Math.round(progress * 100)}%`);
    const glowWidth = scrollbarGlow.offsetWidth;
    scrollbarGlow.style.left = `${window.innerWidth - 4 - glowWidth / 2}px`;
    scrollbarGlow.style.height = `${metrics.thumbHeight.toFixed(2)}px`;
    scrollbarGlow.style.transform = `translate3d(0, ${top.toFixed(2)}px, 0)`;
  }
  function requestScrollbar() {
    if (!scrollFrame && !document.hidden) scrollFrame = requestAnimationFrame(updateScrollbar);
  }
  function scrollInstantly(top, metrics = scrollMetrics()) {
    const position = Math.max(0, Math.min(metrics.overflow, top));
    window.scrollTo({ top: position, behavior: 'instant' });
    requestScrollbar();
  }
  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    const metrics = scrollMetrics();
    if (metrics.overflow <= 1 || metrics.travel <= 0) return;
    event.preventDefault();
    hideCursor();
    drag = { pointerId: event.pointerId, y: event.clientY, scrollTop: metrics.root.scrollTop };
    document.documentElement.classList.add('is-scrollbar-dragging');
    scrollbarThumb.classList.add('is-dragging');
    scrollbarThumb.setPointerCapture(event.pointerId);
    showScrollbar();
  }
  function moveDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    const metrics = scrollMetrics();
    if (metrics.travel <= 0 || metrics.overflow <= 1) { endDrag(event); return; }
    scrollInstantly(drag.scrollTop + (event.clientY - drag.y) / metrics.travel * metrics.overflow, metrics);
    showScrollbar();
  }
  function endDrag(event, reveal = true) {
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    const pointerId = drag.pointerId;
    drag = null;
    document.documentElement.classList.remove('is-scrollbar-dragging');
    scrollbarThumb.classList.remove('is-dragging');
    if (scrollbarThumb.hasPointerCapture(pointerId)) scrollbarThumb.releasePointerCapture(pointerId);
    if (reveal && !document.hidden) showScrollbar();
  }
  scrollbarRail.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    scrollbarHovered = true;
    showScrollbar();
  }, { passive: true });
  scrollbarRail.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    scrollbarHovered = false;
    showScrollbar();
  }, { passive: true });
  scrollbarRail.addEventListener('click', event => {
    if (event.target !== scrollbarRail) return;
    event.preventDefault();
    const metrics = scrollMetrics();
    const bounds = scrollbarRail.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (event.clientY - bounds.top) / Math.max(1, bounds.height)));
    scrollInstantly(progress * metrics.overflow, metrics);
    showScrollbar();
  });
  scrollbarThumb.addEventListener('pointerdown', startDrag);
  scrollbarThumb.addEventListener('pointermove', moveDrag);
  scrollbarThumb.addEventListener('pointerup', endDrag);
  scrollbarThumb.addEventListener('pointercancel', endDrag);
  scrollbarThumb.addEventListener('lostpointercapture', endDrag);
  scrollbarThumb.addEventListener('focus', showScrollbar);
  scrollbarThumb.addEventListener('blur', showScrollbar);
  scrollbarThumb.addEventListener('keydown', event => {
    const metrics = scrollMetrics();
    let top = metrics.root.scrollTop;
    switch (event.key) {
      case 'ArrowUp': top -= 48; break;
      case 'ArrowDown': top += 48; break;
      case 'PageUp': top -= metrics.viewport * 0.9; break;
      case 'PageDown': top += metrics.viewport * 0.9; break;
      case ' ': top += metrics.viewport * 0.9 * (event.shiftKey ? -1 : 1); break;
      case 'Home': top = 0; break;
      case 'End': top = metrics.overflow; break;
      default: return;
    }
    event.preventDefault();
    scrollInstantly(top, metrics);
    showScrollbar();
  });
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
  window.addEventListener('blur', () => {
    hideCursor();
    endDrag(null, false);
    hideScrollbar(true);
  });
  window.addEventListener('focus', showScrollbar);
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
      endDrag(null, false);
      hideScrollbar(true);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    } else showScrollbar();
  });
  const onMediaChange = () => { if (!cursorEnabled()) hideCursor(); };
  reduced.addEventListener('change', onMediaChange);
  finePointer.addEventListener('change', onMediaChange);
  if (document.fonts) document.fonts.ready.then(requestScrollbar);
  document.documentElement.classList.add('has-overlay-scrollbar');
  showScrollbar();
})();
