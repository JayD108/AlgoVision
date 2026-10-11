/* ============================================================
   AlgoVision — core: config, API, helpers, theme, routing, modal
   Loaded before the view scripts; views call registerView().
   ============================================================ */

// Local dev (start.bat, `python -m http.server`) talks to the local backend;
// any other host uses the deployed API.
const PROD_API = 'https://algovision-3xi3.onrender.com';
const API = ['localhost', '127.0.0.1', ''].includes(location.hostname)
  ? 'http://localhost:8080'
  : PROD_API;

// Must match the Pydantic limits in backend/main.py.
const LIMITS = {
  huffmanChars: 10000,
  stockPrices: 1000,
  stockK: 100,
  ksItems: 20,
  ksCapacity: 500,
  tspCities: 30,
  tspExact: 15,
  nqueensN: 12,
  hanoiN: 10,
  flowNodes: 12,
  flowEdges: 60,
  flowCapacity: 1000,
};

// Sidebar groups. Titles, badges and descriptions come from ALGO_INFO.
const NAV = [
  { section: 'Greedy',              items: [['huffman', 'Huffman Coding']] },
  { section: 'Dynamic Programming', items: [['stock', 'Stock Profit'], ['knapsack', '0/1 Knapsack']] },
  { section: 'NP-Hard',             items: [['tsp', 'TSP Solver']] },
  { section: 'Backtracking',        items: [['nqueens', 'N-Queens'], ['sudoku', 'Sudoku']] },
  { section: 'Recursion',           items: [['hanoi', 'Tower of Hanoi']] },
  { section: 'Graphs',              items: [['maxflow', 'Max Flow']] },
  { section: 'Game Theory',         items: [['tictactoe', 'Tic-Tac-Toe']] },
];

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── API ─────────────────────────────────────────────────────────────── */
// Turns every failure shape into an Error with a readable message:
// FastAPI 422s (detail is a list), 400s (detail is a string), non-JSON
// gateway errors (e.g. Render waking up) and network failures.
async function postJSON(path, body) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the backend. It may be starting up — try again in a few seconds.');
  }
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON body */ }
  if (!res.ok) {
    const detail = data?.detail;
    let msg;
    if (Array.isArray(detail)) {
      msg = detail.map(d => {
        const field = (d.loc || []).filter(x => x !== 'body').join('.');
        return field ? `${field}: ${d.msg}` : d.msg;
      }).join('; ');
    } else if (typeof detail === 'string') {
      msg = detail;
    } else {
      msg = `Server error (HTTP ${res.status})`;
    }
    throw new Error(msg);
  }
  return data;
}

// Disable a button and show a spinner while fn runs.
async function withBusy(btn, label, fn) {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> ${escapeHTML(label)}`;
  try {
    return await fn();
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

/* ── Small DOM helpers ───────────────────────────────────────────────── */
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Append a <td> whose content is set as text, never parsed as HTML.
function cell(tr, text, className) {
  const td = document.createElement('td');
  td.textContent = text;
  if (className) td.className = className;
  tr.appendChild(td);
  return td;
}

function parseIntList(raw) {
  return raw.split(',').map(s => s.trim()).filter(Boolean).map(Number);
}

const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

// html must be trusted (built by the caller with escapeHTML for any user/server text).
function showBanner(id, html, type = 'info') {
  const el = $(id);
  el.innerHTML = html;
  el.className = `result-banner show banner-${type}`;
}

function hideBanner(id) { $(id).className = 'result-banner'; }

function toast(message, type = 'error') {
  let root = $('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.setAttribute('aria-live', 'polite');
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => { el.classList.add('toast-out'); setTimeout(() => el.remove(), 300); }, 4000);
}

function storageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function storageSet(key, val) { try { localStorage.setItem(key, val); } catch { /* private mode */ } }

/* ── Canvas helpers ──────────────────────────────────────────────────── */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Theme-aware colours for canvas drawing.
function palette() {
  return {
    text: cssVar('--text'), text2: cssVar('--text2'), text3: cssVar('--text3'),
    grid: cssVar('--canvas-grid'), surface: cssVar('--bg3'), card: cssVar('--card'),
    accent: cssVar('--accent'), accent2: cssVar('--accent2'), purple: cssVar('--purple'),
    green: cssVar('--green'), red: cssVar('--red'), amber: cssVar('--amber'), cyan: cssVar('--cyan'),
  };
}

// Size the backing store for the device pixel ratio and clear. Returns CSS-pixel size.
function setupCanvas(canvas) {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  return { ctx, W, H };
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── View registry & routing ─────────────────────────────────────────── */
// hooks: { run() — primary action (Ctrl/Cmd+Enter), onShow(), redraw() — theme/resize }
const VIEWS = {};
function registerView(id, hooks) { VIEWS[id] = hooks; }

let currentView = null;

function buildNav() {
  const nav = $('sidebar-nav');
  const overview = document.createElement('a');
  overview.className = 'nav-item';
  overview.href = '#/overview';
  overview.dataset.view = 'overview';
  overview.innerHTML = '<span class="nav-label">Overview</span>';
  nav.appendChild(overview);

  NAV.forEach(group => {
    const label = document.createElement('div');
    label.className = 'nav-section-label';
    label.textContent = group.section;
    nav.appendChild(label);
    group.items.forEach(([id, name]) => {
      const info = ALGO_INFO[id];
      const a = document.createElement('a');
      a.className = 'nav-item';
      a.href = `#/${id}`;
      a.dataset.view = id;
      a.innerHTML = `<span class="nav-label">${escapeHTML(name)}</span>`;
      nav.appendChild(a);
    });
  });
}

function buildOverview() {
  const grid = $('overview-grid');
  let num = 0;
  NAV.forEach(group => group.items.forEach(([id]) => {
    const info = ALGO_INFO[id];
    num++;
    const a = document.createElement('a');
    a.className = 'algo-card';
    a.href = `#/${id}`;
    a.innerHTML = `
      <div class="algo-card-top">
        <span class="algo-card-num">${String(num).padStart(2, '0')}</span>
        <span class="algo-card-tag">${escapeHTML(info.badge)}</span>
      </div>
      <div class="algo-card-title">${escapeHTML(info.title)}</div>
      <div class="algo-card-sub">${escapeHTML(info.sub.replace(/^—\s*/, ''))}</div>
      <div class="algo-card-meta"><span>Time</span><code>${escapeHTML(info.info.complexity.time)}</code></div>`;
    grid.appendChild(a);
  }));
}

function viewFromHash() {
  const id = location.hash.replace(/^#\/?/, '');
  return (id === 'overview' || ALGO_INFO[id]) ? id : 'overview';
}

function showView(view) {
  document.querySelectorAll('.view').forEach(v => { v.hidden = true; });
  document.querySelectorAll('.nav-item').forEach(n => {
    const active = n.dataset.view === view;
    n.classList.toggle('active', active);
    if (active) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
  });

  const el = $(`view-${view}`);
  el.hidden = false;
  el.classList.remove('fade-in'); void el.offsetWidth; el.classList.add('fade-in');

  currentView = view;
  const info = ALGO_INFO[view];
  $('topbar-title').textContent = info ? info.title : 'Overview';
  $('topbar-sub').textContent   = info ? info.sub : '— Pick an algorithm to explore';
  const badge = $('topbar-badge');
  badge.hidden = !info;
  if (info) badge.textContent = info.badge;
  $('info-btn').hidden = !info;
  document.title = info ? `${info.title} · AlgoVision` : 'AlgoVision — DAA Interactive Dashboard';

  closeSidebar();
  $('content-area').scrollTop = 0;
  VIEWS[view]?.onShow?.();
}

/* ── Theme ───────────────────────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('theme-btn').setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  VIEWS[currentView]?.redraw?.();
}

function initTheme() {
  const stored = storageGet('algovision-theme');
  const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(stored || system);
  $('theme-btn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    storageSet('algovision-theme', next);
    applyTheme(next);
  });
}

/* ── Mobile sidebar ──────────────────────────────────────────────────── */
function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  $('menu-btn').setAttribute('aria-expanded', 'false');
}

/* ── Info modal ──────────────────────────────────────────────────────── */
let modalReturnFocus = null;

function openInfoModal(view) {
  const algo = ALGO_INFO[view];
  if (!algo) return;
  const d = algo.info;

  const stepsHTML = d.steps.map((s, i) => `
    <div class="info-step">
      <div class="info-step-num">${i + 1}</div>
      <div class="info-step-text">${s}</div>
    </div>`).join('');

  const appsHTML = d.realWorld.map(a => `
    <div class="info-app-item">
      <div class="text"><strong>${a.name}</strong><span>${a.desc}</span></div>
    </div>`).join('');

  $('modal-title').textContent = algo.title;
  $('modal-body').innerHTML = `
    <div class="info-section">
      <div class="info-section-title">Definition</div>
      <p>${d.definition}</p>
    </div>
    <div class="info-section">
      <div class="info-section-title">Algorithm Paradigm</div>
      <div class="info-highlight">${d.paradigm}</div>
    </div>
    <div class="info-section">
      <div class="info-section-title">Step-by-Step Algorithm</div>
      ${stepsHTML}
    </div>
    <div class="info-section">
      <div class="info-section-title">Complexity</div>
      <div class="info-complexity">
        <div class="info-complexity-box"><div class="label">Time Complexity</div><div class="value">${d.complexity.time}</div></div>
        <div class="info-complexity-box"><div class="label">Space Complexity</div><div class="value">${d.complexity.space}</div></div>
      </div>
    </div>
    <div class="info-section">
      <div class="info-section-title">Real-World Applications</div>
      <div class="info-app-grid">${appsHTML}</div>
    </div>
    <div class="info-section">
      <div class="info-section-title">How This Project Uses It</div>
      <div class="info-highlight">${d.projectContext}</div>
    </div>`;

  modalReturnFocus = document.activeElement;
  $('info-overlay').hidden = false;
  document.body.style.overflow = 'hidden';
  $('info-close-btn').focus();
}

function closeInfoModal() {
  if ($('info-overlay').hidden) return;
  $('info-overlay').hidden = true;
  document.body.style.overflow = '';
  modalReturnFocus?.focus?.();
}

/* ── Backend health ──────────────────────────────────────────────────── */
async function checkBackend() {
  const el = $('api-status');
  try {
    const r = await fetch(`${API}/`);
    if (!r.ok) throw new Error();
    el.textContent = 'Connected';
    el.dataset.state = 'ok';
  } catch {
    el.textContent = 'Offline';
    el.dataset.state = 'down';
  }
}

/* ── Init (runs after every view script has registered) ──────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  buildOverview();
  initTheme();

  $('info-btn').addEventListener('click', () => openInfoModal(currentView));
  $('info-close-btn').addEventListener('click', closeInfoModal);
  $('info-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeInfoModal(); });

  $('menu-btn').addEventListener('click', () => {
    const open = document.body.classList.toggle('sidebar-open');
    $('menu-btn').setAttribute('aria-expanded', String(open));
  });
  $('sidebar-scrim').addEventListener('click', closeSidebar);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeInfoModal(); closeSidebar(); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && $('info-overlay').hidden) {
      e.preventDefault();
      VIEWS[currentView]?.run?.();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => VIEWS[currentView]?.redraw?.(), 120);
  });

  window.addEventListener('hashchange', () => showView(viewFromHash()));
  showView(viewFromHash());

  checkBackend();
  setInterval(checkBackend, 15000);
});
