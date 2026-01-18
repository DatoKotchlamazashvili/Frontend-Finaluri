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

const $ = (selector) => document.querySelector(selector);

function createEl(tag, attrs = {}, text) {
  const element = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  
  if (text) {
    element.textContent = text;
  }
  
  return element;
}

async function fetchPlayerData(url = 'data/player.json') {
  try {
    const response = await fetch(url, { cache: "no-store" });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching player data:', error);
    return null;
  }
}

function renderStats(stats = []) {
  const container = $(SELECTORS.stats);
  container.innerHTML = '';
  
  stats.forEach(stat => {
    const card = createEl('div', { class: 'stat-card' });
    const number = createEl('span', { class: 'stat-number' }, stat.value + (stat.suffix || ''));
    const label = createEl('span', { class: 'stat-label' }, stat.label);
    
    card.append(number, label);
    container.appendChild(card);
  });

  const statNumbers = container.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetValue = parseInt(entry.target.textContent) || 0;
        animateNumber(entry.target, targetValue);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(card => observer.observe(card));
}

function animateNumber(element, targetValue) {
  const suffix = element.textContent.replace(/[0-9]/g, '');
  const numericValue = Number(String(element.textContent).replace(/\D/g, ''));
  
  if (isNaN(numericValue)) return;
  
  const duration = 1000;
  const startTime = performance.now();
  
  function step(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(progress * numericValue);
    
    element.textContent = currentValue + (suffix || '');
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = numericValue + (suffix || '');
    }
  }
  
  requestAnimationFrame(step);
}

function renderHighlights(highlights = []) {
  const grid = $(SELECTORS.highlightsGrid);
  grid.innerHTML = '';
  
  highlights.forEach(highlight => {
    const card = createEl('article', { class: 'highlight' });
    const icon = createEl('div', { class: 'icon' }, '🏆');
    const body = createEl('div', { class: 'highlight-body' });
    const title = createEl('h3', {}, highlight.title);
    const description = createEl('p', {}, highlight.text);
    
    body.append(title, description);
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
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScrollY = currentScrollY;
  }, { passive: true });
}

function setupNavAutoClose() {
  const nav = $(SELECTORS.nav);
  
  nav.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && nav.classList.contains('open')) {
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
  
  if (!data) {
    return;
  }

  $(SELECTORS.playerName).textContent = data.name;
  $(SELECTORS.playerTagline).textContent = data.tagline;
  $(SELECTORS.playerNote).textContent = data.note;
  $(SELECTORS.playerPhoto).src = data.photo;

  renderStats(data.stats || []);
  renderHighlights(data.highlights || []);
}

document.addEventListener('DOMContentLoaded', init);