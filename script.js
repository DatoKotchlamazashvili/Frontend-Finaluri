const SELECTORS = {
  header: '#site-header',
  burger: '#burger',
  nav: '#main-nav',
  stats: '#stats',
  highlightsGrid: '#highlights-grid',
  playerPhoto: '#player-photo',
  playerName: '#player-name',
  playerTagline: '#player-tagline',
  playerNote: '#player-note'
};

const $ = (sel) => document.querySelector(sel);
const createEl = (tag, attrs = {}, text) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
  if (text) el.textContent = text;
  return el;
};

async function fetchPlayerData(url = 'data/player.json') {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error('Failed to fetch data');
    return await res.json();
  } catch (err) {
    console.error('fetchPlayerData error:', err);
    return null;
  }
}

function renderStats(stats = []) {
  const container = $(SELECTORS.stats);
  container.innerHTML = '';
  stats.forEach(s => {
    const card = createEl('div', { class: 'stat-card' });
    const number = createEl('span', { class: 'stat-number' }, s.value + (s.suffix || ''));
    const label = createEl('span', { class: 'stat-label' }, s.label);
    card.append(number, label);
    container.appendChild(card);
  });

  const cards = container.querySelectorAll('.stat-number');
  const obs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target, parseInt(entry.target.textContent) || 0);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  cards.forEach(c => obs.observe(c));
}

function animateNumber(el, targetValue) {
  const suffix = el.textContent.replace(/[0-9]/g, '');
  const numeric = Number(String(el.textContent).replace(/\D/g,''));
  if (isNaN(numeric)) return;
  const duration = 1000;
  const start = performance.now();
  function step(ts) {
    const t = Math.min((ts - start) / duration, 1);
    const value = Math.floor(t * numeric);
    el.textContent = value + (suffix || '');
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = numeric + (suffix || '');
  }
  requestAnimationFrame(step);
}

function renderHighlights(highlights = []) {
  const grid = $(SELECTORS.highlightsGrid);
  grid.innerHTML = '';
  highlights.forEach(h => {
    const card = createEl('article', { class: 'highlight' });
    const icon = createEl('div', { class: 'icon' }, '🏆');
    const body = createEl('div', { class: 'highlight-body' });
    const title = createEl('h3', {}, h.title);
    const p = createEl('p', {}, h.text);
    body.append(title, p);
    card.append(icon, body);
    grid.appendChild(card);
  });
}

function setupBurger() {
  const burger = $(SELECTORS.burger);
  const nav = $(SELECTORS.nav);
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupStickyHeader() {
  const header = $(SELECTORS.header);
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    lastScrollY = y;
  }, { passive: true });
}

function setupNavAutoClose() {
  const nav = $(SELECTORS.nav);
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      $('#burger').setAttribute('aria-expanded', 'false');
    }
  });
}

async function init() {
  setupBurger();
  setupStickyHeader();
  setupNavAutoClose();

  const data = await fetchPlayerData('data/player.json');
  if (!data) return;

  $(SELECTORS.playerName).textContent = data.name;
  $(SELECTORS.playerTagline).textContent = data.tagline;
  $(SELECTORS.playerNote).textContent = data.note;
  $(SELECTORS.playerPhoto).src = data.photo;

  renderStats(data.stats || []);
  renderHighlights(data.highlights || []);
}

document.addEventListener('DOMContentLoaded', init);