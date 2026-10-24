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
let measureFrame;
function measurePanels() {
  cancelAnimationFrame(measureFrame);
  measureFrame = requestAnimationFrame(() => {
    let tallest = 0;
    for (const panel of panels) {
      const wasHidden = panel.hidden;
      panel.hidden = false;
      panel.style.position = 'absolute';
      panel.style.visibility = 'hidden';
      tallest = Math.max(tallest, panel.getBoundingClientRect().height);
      panel.style.position = '';
      panel.style.visibility = '';
      panel.hidden = wasHidden;
    }
    panelContainer.style.height = `${Math.ceil(tallest)}px`;
  });
}
function selectTab(index, focus = false) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    panels[i].hidden = i !== index;
  });
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
