const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Menu openen');
  mobileNav.hidden = true;
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Menu sluiten' : 'Menu openen');
  mobileNav.hidden = !opening;
});
mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu();
});
const desktopMedia = matchMedia('(min-width:601px)');
desktopMedia.addEventListener('change', event => { if (event.matches) closeMenu(); });

const tabs = [...document.querySelectorAll('.service-tab')];
const panels = [...document.querySelectorAll('.service-panel')];
const panelContainer = document.querySelector('.service-panels');
const tabList = document.querySelector('.service-tabs');
function setTabOrientation() {
  tabList.setAttribute('aria-orientation', desktopMedia.matches ? 'vertical' : 'horizontal');
}
desktopMedia.addEventListener('change', setTabOrientation);
setTabOrientation();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const snapSections = [...document.querySelectorAll('main > section')];
const stickyHeader = document.querySelector('.site-header');
let snapFrame;
function measureSectionSnaps() {
  cancelAnimationFrame(snapFrame);
  snapFrame = requestAnimationFrame(() => {
    const headerHeight = Math.ceil(stickyHeader.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--sticky-header-height', `${headerHeight}px`);
    const available = window.innerHeight - headerHeight;
    snapSections.forEach(section => {
      section.classList.toggle('is-snap-section', !reducedMotion.matches && section.getBoundingClientRect().height <= available - 2);
    });
  });
}
const snapObserver = new ResizeObserver(measureSectionSnaps);
snapSections.forEach(section => snapObserver.observe(section));
snapObserver.observe(stickyHeader);
window.addEventListener('resize', measureSectionSnaps, { passive: true });
reducedMotion.addEventListener('change', measureSectionSnaps);
document.fonts.ready.then(measureSectionSnaps);
measureSectionSnaps();
let selectedIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
let selectionVersion = 0;
let panelAnimations = [];
let measureFrame;
function measurePanels() {
  cancelAnimationFrame(measureFrame);
  measureFrame = requestAnimationFrame(() => {
    let windowHeight = 0;
    let captionHeight = 0;
    panelContainer.classList.add('is-measuring');
    for (const panel of panels) {
      const wasHidden = panel.hidden;
      panel.hidden = false;
      windowHeight = Math.max(windowHeight, panel.querySelector('.product-window').getBoundingClientRect().height);
      captionHeight = Math.max(captionHeight, panel.querySelector('.panel-caption').getBoundingClientRect().height);
      panel.hidden = wasHidden;
    }
    windowHeight = Math.ceil(windowHeight);
    captionHeight = Math.ceil(captionHeight);
    panelContainer.style.setProperty('--example-window-height', `${windowHeight}px`);
    panelContainer.style.setProperty('--example-caption-height', `${captionHeight}px`);
    panelContainer.classList.remove('is-measuring');
    panelContainer.style.height = `${windowHeight + captionHeight}px`;
  });
}
function selectTab(index, focus = false) {
  if (index === selectedIndex) {
    if (focus) tabs[index].focus();
    return;
  }
  const previousPanel = panels[selectedIndex];
  const version = ++selectionVersion;
  panelAnimations.forEach(animation => animation.cancel());
  panelAnimations = [];
  selectedIndex = index;
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    panels[i].hidden = i !== index;
    panels[i].classList.remove('is-leaving');
    panels[i].removeAttribute('aria-hidden');
    panels[i].inert = false;
  });
  if (!reducedMotion.matches) {
    previousPanel.hidden = false;
    previousPanel.classList.add('is-leaving');
    previousPanel.setAttribute('aria-hidden', 'true');
    previousPanel.inert = true;
    const outgoing = previousPanel.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 160, easing: 'ease-out', fill: 'forwards'
    });
    const incoming = panels[index].animate([
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 380, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    panelAnimations = [outgoing, incoming];
    outgoing.finished.then(() => {
      if (version !== selectionVersion) return;
      previousPanel.hidden = true;
      previousPanel.classList.remove('is-leaving');
      previousPanel.removeAttribute('aria-hidden');
      previousPanel.inert = false;
      outgoing.cancel();
    }).catch(() => {});
  }
  if (focus) tabs[index].focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(next, true); }
  });
});
let lastWidth = 0;
new ResizeObserver(entries => {
  const width = entries[0].contentRect.width;
  if (Math.abs(lastWidth - width) > .5) { lastWidth = width; measurePanels(); }
}).observe(panelContainer);
document.fonts.ready.then(measurePanels);
panelContainer.querySelectorAll('img').forEach(image => image.addEventListener('load', measurePanels, { once: true }));
measurePanels();

const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('.copy-status');
let statusTimeout;
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('info@sidco.be');
    copyStatus.textContent = 'E-mailadres gekopieerd';
  } catch {
    copyStatus.textContent = 'Je kunt mailen naar info@sidco.be';
  }
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => { copyStatus.textContent = ''; }, 5000);
});
document.querySelector('#year').textContent = new Date().getFullYear();
