/* ============================================================
   AlgoVision — DAA Interactive Dashboard — app.js  v3.0
   ============================================================ */

const API = 'https://algovision-3xi3.onrender.com';

/* ── Algorithm metadata (for topbar + info modal) ─────────────────── */
const ALGO_INFO = {
  huffman: {
    title:  'Huffman Coding',
    sub:    '— Greedy lossless compression',
    badge:  'Greedy',
    badgeClass: 'tag-greedy',
    emoji:  '🗜️',
    info: {
      definition: `Huffman Coding is a <strong>lossless data compression algorithm</strong> invented by David A. Huffman in 1952. It encodes characters using variable-length binary codes — frequent characters get shorter codes, rare characters get longer ones. This is the core idea of a <strong>prefix-free binary code</strong>: no code is a prefix of another, ensuring unambiguous decoding.`,
      paradigm: `<strong>Greedy Algorithm</strong>: At each step, Huffman always picks the two nodes with the <em>lowest frequency</em> from a min-priority queue and merges them. This greedy choice is provably optimal — it leads to the globally shortest encoding.`,
      steps: [
        'Count the frequency of each character in the input text.',
        'Create a leaf node for each character and insert all into a min-priority queue.',
        'While the queue has more than 1 node: extract the two nodes with minimum frequency, create a new internal node with them as children (frequency = sum of both). Re-insert into the queue.',
        'The last remaining node is the <strong>Huffman Tree root</strong>.',
        'Traverse the tree: assign <code class="inline">0</code> for left branch and <code class="inline">1</code> for right branch to build each character\'s code.',
        'Replace each character in the original text with its binary code → compressed output.',
      ],
      complexity: { time: 'O(n log n)', space: 'O(n)' },
      realWorld: [
        { icon: '📦', name: 'ZIP / GZIP Compression', desc: 'The foundation of DEFLATE algorithm used in ZIP files combines Huffman + LZ77.' },
        { icon: '📡', name: 'JPEG / MP3 Encoding', desc: 'JPEG uses Huffman coding after DCT quantization to compress image blocks.' },
        { icon: '📱', name: 'Network Protocols', desc: 'HTTP/2 uses HPACK (Huffman-based) header compression to reduce HTTP overhead.' },
        { icon: '📄', name: 'PDF Generation', desc: 'PDF format uses Huffman within Flate/LZW streams to reduce file sizes.' },
      ],
      projectContext: `In this project, you type any text and the backend builds the Huffman tree using Python's <code class="inline">heapq</code> priority queue. The API returns the prefix code table and encoded binary string. The frontend then renders compression stats — showing exactly how many bits were saved vs. naive 8-bit ASCII encoding.`,
    }
  },
  stock: {
    title:  'Stock Profit (K Transactions)',
    sub:    '— Dynamic Programming on prices',
    badge:  'DP',
    badgeClass: 'tag-dp',
    emoji:  '📈',
    info: {
      definition: `Given an array of stock prices and a maximum number of transactions <strong>K</strong>, find the maximum profit achievable. A transaction is one buy + one sell. You cannot hold two stocks simultaneously. This is <strong>LeetCode #188 — Best Time to Buy and Sell Stock IV</strong>.`,
      paradigm: `<strong>What is Dynamic Programming (DP)?</strong><br><br>
DP is a technique for solving problems by breaking them into <em>overlapping subproblems</em> and storing previous results to avoid recomputation (memoization/tabulation). Unlike Greedy, DP considers all choices.<br><br>
<strong>DP State:</strong> <code class="inline">dp[k][i]</code> = maximum profit using at most <code class="inline">k</code> transactions on days <code class="inline">0..i</code>.<br>
<strong>Recurrence:</strong> <code class="inline">dp[k][i] = max(dp[k][i-1], price[i] + max(dp[k-1][j] - price[j]))</code> for all j &lt; i.`,
      steps: [
        'Initialize a 2D DP table of size (K+1) × (n days), all zeros.',
        'For each number of transactions k from 1 to K:',
        '  Track the maximum value of (dp[k-1][j] - price[j]) seen so far as you scan left to right.',
        '  dp[k][i] = max(dp[k][i-1],  price[i] + best_prev_value)',
        'The answer is dp[K][n-1] — max profit using at most K transactions.',
        'Backtrack through the DP table to identify the actual buy/sell days.',
      ],
      complexity: { time: 'O(K × n)', space: 'O(K × n)' },
      realWorld: [
        { icon: '💹', name: 'Algorithmic Trading', desc: 'Trading bots solve variants of this to maximize profit under trade-count constraints.' },
        { icon: '📊', name: 'Portfolio Optimization', desc: 'Fund managers limit transaction counts to reduce fees — same DP structure applies.' },
        { icon: '🏭', name: 'Resource Scheduling', desc: 'The buy/sell abstraction maps to: acquire/release resource at optimal times with budget constraints.' },
        { icon: '🎮', name: 'Game Theory', desc: 'Maximizing score in sequence-of-decisions games with limited actions uses identical DP formulations.' },
      ],
      projectContext: `You input a price series and K. The backend runs the O(K×n) DP in Python and returns the table + backtracked transactions. The frontend draws the price chart on a Canvas and highlights the buy/sell points with green/red markers, making the DP decisions visually concrete.`,
    }
  },
  knapsack: {
    title:  '0/1 Knapsack',
    sub:    '— Classic DP resource allocation problem',
    badge:  'DP',
    badgeClass: 'tag-dp',
    emoji:  '🎒',
    info: {
      definition: `The <strong>0/1 Knapsack Problem</strong>: Given n items, each with a weight and a value, and a knapsack of capacity W, choose items to <strong>maximize total value</strong> without exceeding W. Each item is either taken (1) or not (0) — no fractions allowed. This is the classic NP-hard optimization problem solved optimally for moderate sizes via DP.`,
      paradigm: `<strong>Dynamic Programming — Bottom-Up Tabulation</strong><br><br>
<strong>DP State:</strong> <code class="inline">dp[i][w]</code> = max value using the first i items with capacity w.<br>
<strong>Recurrence:</strong><br>
If weight[i] &gt; w: <code class="inline">dp[i][w] = dp[i-1][w]</code> (can't take item)<br>
Else: <code class="inline">dp[i][w] = max(dp[i-1][w], value[i] + dp[i-1][w - weight[i]])</code><br><br>
The key insight: each cell answers "what's the best I can do with this many items and this capacity?" Building from small subproblems to large ones.`,
      steps: [
        'Initialize (n+1) × (W+1) table with all zeros.',
        'For each item i from 1 to n:',
        '  For each capacity w from 0 to W:',
        '    If item i\'s weight > w: copy value from row above (skip item).',
        '    Else: take the max of (skip item) vs (take item + best with remaining capacity).',
        'Answer is dp[n][W]. Backtrack: if dp[i][w] ≠ dp[i-1][w], item i was included.',
      ],
      complexity: { time: 'O(n × W)', space: 'O(n × W)' },
      realWorld: [
        { icon: '✈️', name: 'Cargo Loading', desc: 'Airlines/logistics companies maximize revenue by selecting which cargo to load given weight limits.' },
        { icon: '💰', name: 'Investment Selection', desc: 'Given a capital budget, choose projects to maximize NPV — textbook 0/1 knapsack.' },
        { icon: '🔒', name: 'Cryptography', desc: 'The knapsack problem was one of the earliest public-key cryptosystems (Merkle–Hellman).' },
        { icon: '🎮', name: 'Game Inventory', desc: 'RPG games use knapsack variants to manage limited inventory with weight and value constraints.' },
      ],
      projectContext: `You input item weights, values, and knapsack capacity. The backend computes the full DP table and backtracks to find the selected items. The frontend renders an animated DP table where cells light up as they are filled, letting you see exactly which subproblems were solved to reach the optimal answer.`,
    }
  },
  tsp: {
    title:  'TSP Solver (Held-Karp)',
    sub:    '— Exact bitmask DP on complete graphs',
    badge:  'NP-Hard',
    badgeClass: 'tag-np',
    emoji:  '🗺️',
    info: {
      definition: `The <strong>Travelling Salesman Problem (TSP)</strong>: Given n cities and distances between every pair, find the shortest possible route that visits each city exactly once and returns to the starting city. TSP is <strong>NP-Hard</strong> — no known polynomial-time exact solution exists. The best exact algorithm is <strong>Held-Karp (1962)</strong> with O(n² × 2ⁿ) complexity.`,
      paradigm: `<strong>Bitmask Dynamic Programming</strong><br><br>
<strong>State:</strong> <code class="inline">dp[S][v]</code> = minimum cost to visit exactly the cities in subset S, ending at city v.<br>
<strong>Recurrence:</strong> <code class="inline">dp[S][v] = min over all u in S\{v}: dp[S\{v}][u] + dist(u,v)</code><br>
The bitmask S encodes which cities have been visited as bits of an integer.`,
      steps: [
        'Compute the full n×n distance matrix from city coordinates.',
        'Initialize: dp[{0}][0] = 0 (start at city 0, visited only it).',
        'For each subset S of size 2 to n: for each endpoint v in S: try all previous cities u in S\{v}.',
        'Select the minimum-cost tour: dp[(1<<n)-1][v] + dist[v][0] over all v.',
        'Backtrack parent pointers to reconstruct the actual tour order.',
        'For n > 14, fall back to nearest-neighbor heuristic for speed.',
      ],
      complexity: { time: 'O(n² × 2ⁿ)', space: 'O(n × 2ⁿ)' },
      realWorld: [
        { icon: '🚚', name: 'Delivery Route Planning', desc: 'FedEx, UPS, Amazon use TSP variants (VRP) to minimize driver miles across thousands of stops.' },
        { icon: '🧬', name: 'DNA Sequencing', desc: 'Fragment assembly in genomics is modeled as TSP — finding shortest superstring.' },
        { icon: '🏭', name: 'PCB Drilling', desc: 'Drilling holes in circuit boards in minimum-distance order reduces manufacturing time.' },
        { icon: '🌐', name: 'Network Optimization', desc: 'Routing internet packets or planning fiber-optic cable layouts are TSP-related graph problems.' },
      ],
      projectContext: `Click on the canvas to place cities (or input coordinates). The backend runs Held-Karp exact DP (up to 14 cities) or nearest-neighbor heuristic for larger inputs. The solution is drawn as an animated route on the canvas with city labels and distance display.`,
    }
  },
  nqueens: {
    title:  'N-Queens',
    sub:    '— Backtracking constraint satisfaction',
    badge:  'Backtrack',
    badgeClass: 'tag-bt',
    emoji:  '♛',
    info: {
      definition: `The <strong>N-Queens Problem</strong>: Place N chess queens on an N×N board such that no two queens attack each other (no two in the same row, column, or diagonal). For N=8, there are exactly <strong>92 solutions</strong>. It's a classic <strong>constraint satisfaction problem</strong> solved elegantly with backtracking.`,
      paradigm: `<strong>Backtracking Algorithm</strong><br><br>
Backtracking is a refined brute-force: explore candidate positions, and <em>abandon (backtrack)</em> a partial solution the moment you detect it cannot lead to a valid complete solution. It prunes the search tree dramatically.<br><br>
<strong>Key constraint:</strong> Queens attack in same row, column, or diagonal. We place one queen per row, so rows are guaranteed distinct. We only check columns and diagonals.`,
      steps: [
        'Start with an empty board. Process row by row.',
        'For row r: try placing a queen in each column c (0 to N-1).',
        'Check if column c, diagonal (r-c), and anti-diagonal (r+c) are all free.',
        'If safe: place the queen, mark column and diagonals as occupied, recurse to row r+1.',
        'If all N rows are filled → record solution.',
        'If no safe column exists in row r → backtrack to row r-1, unplace that queen, try next column.',
      ],
      complexity: { time: 'O(N!)', space: 'O(N)' },
      realWorld: [
        { icon: '🔧', name: 'Constraint Solving', desc: 'Scheduling N tasks on N machines with mutual exclusion constraints — same backtracking structure.' },
        { icon: '🗺️', name: 'Map Coloring', desc: 'The graph coloring problem (no adjacent regions same color) uses identical CSP backtracking.' },
        { icon: '🤖', name: 'AI Planning', desc: 'Early AI planning systems (STRIPS) used backtracking to search through action sequences.' },
        { icon: '📡', name: 'Frequency Assignment', desc: 'Assigning radio frequencies to towers without interference is a constraint satisfaction problem.' },
      ],
      projectContext: `Enter board size N (1–12). The backend runs recursive backtracking, collecting all valid queen placements. The frontend renders the board as a visual chessboard grid with queens (♛) placed on the solution. You can page through all solutions with Prev/Next buttons.`,
    }
  },
  hanoi: {
    title:  'Tower of Hanoi',
    sub:    '— Classic recursion with optimal moves',
    badge:  'Recursion',
    badgeClass: 'tag-rec',
    emoji:  '🗼',
    info: {
      definition: `The <strong>Tower of Hanoi</strong> is a mathematical puzzle with three pegs (A, B, C) and N disks of different sizes stacked on peg A (largest at bottom). Goal: move all disks to peg C, following two rules: (1) Only one disk moves at a time. (2) A larger disk may never be placed on a smaller disk. The minimum number of moves is <strong>2ⁿ − 1</strong>.`,
      paradigm: `<strong>Divide and Conquer via Recursion</strong><br><br>
The key insight is a beautiful recursive decomposition:<br>
To move N disks from A to C using B as auxiliary:<br>
<code class="inline">Hanoi(N-1, A → B)</code> → move top N-1 disks out of the way<br>
<code class="inline">Move disk N: A → C</code> → move the largest disk directly<br>
<code class="inline">Hanoi(N-1, B → C)</code> → move the N-1 disks on top<br><br>
The recursion stack depth is N. Total calls: 2ⁿ−1 (each call is one disk move).`,
      steps: [
        'Hanoi(n, src=A, dst=C, via=B)',
        'Base case: if n=0, do nothing (return).',
        'Step 1: Recursively move top (n-1) disks from A to B using C as aux.',
        'Step 2: Move disk n (the largest) from A directly to C.',
        'Step 3: Recursively move (n-1) disks from B to C using A as aux.',
        'Each leaf call corresponds to exactly one physical disk move. Total = 2ⁿ−1.',
      ],
      complexity: { time: 'O(2ⁿ)', space: 'O(n) stack depth' },
      realWorld: [
        { icon: '💾', name: 'Memory Management', desc: 'Backup rotation schemes (grandfather-father-son) follow Tower of Hanoi patterns for tape storage rotation.' },
        { icon: '🔬', name: 'Recursive Algorithms', desc: 'Understanding Hanoi builds mental models for merge sort, quicksort, and tree traversal recursion.' },
        { icon: '🧮', name: 'Frame-Stewart Algorithm', desc: 'Multi-peg Hanoi variants inspired research in combinatorics and still have open conjectures.' },
        { icon: '🎓', name: 'CS Education', desc: 'Hanoi is the canonical example for teaching recursion, call stacks, and divide-and-conquer in every CS curriculum.' },
      ],
      projectContext: `You choose the number of disks (1–10). The backend runs the recursive function in Python, recording every disk move. The frontend animates the full sequence on a canvas with colored disks, pegs, and a move log. Watch the recursion "play out" in real time at adjustable speed.`,
    }
  },
};

/* ── Backend health check ─────────────────────────────────────────────── */
async function checkBackend() {
  try {
    const r = await fetch(`${API}/`);
    if (r.ok) {
      document.getElementById('api-status').textContent = 'Connected ✓';
      document.getElementById('api-status').style.color = '#22c55e';
    } else { throw new Error(); }
  } catch {
    document.getElementById('api-status').textContent = 'Offline ✗';
    document.getElementById('api-status').style.color = '#f43f5e';
  }
}
checkBackend();
setInterval(checkBackend, 10000);

/* ── Navigation ──────────────────────────────────────────────────────── */
let currentView = 'huffman';

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => (v.style.display = 'none'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`view-${view}`);
  if (el) { el.style.display = ''; el.classList.remove('fade-in'); void el.offsetWidth; el.classList.add('fade-in'); }

  const nav = document.querySelector(`[data-view="${view}"]`);
  if (nav) nav.classList.add('active');

  currentView = view;
  const info = ALGO_INFO[view];
  if (info) {
    document.getElementById('topbar-title').textContent = info.title;
    document.getElementById('topbar-sub').textContent   = info.sub;
    const badge = document.getElementById('topbar-badge');
    badge.textContent  = info.badge;
    badge.className    = `topbar-badge ${info.badgeClass}`;
  }
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchView(item.dataset.view));
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') switchView(item.dataset.view); });
});

/* ── Info Modal ──────────────────────────────────────────────────────── */
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
      <div class="icon">${a.icon}</div>
      <div class="text"><strong>${a.name}</strong><span>${a.desc}</span></div>
    </div>`).join('');

  document.getElementById('modal-title').textContent = `${algo.emoji}  ${algo.title}`;
  document.getElementById('modal-body').innerHTML = `
    <div class="info-section">
      <div class="info-section-title">📖 Definition</div>
      <p>${d.definition}</p>
    </div>

    <div class="info-section">
      <div class="info-section-title">🧠 Algorithm Paradigm</div>
      <div class="info-highlight">${d.paradigm}</div>
    </div>

    <div class="info-section">
      <div class="info-section-title">🔢 Step-by-Step Algorithm</div>
      ${stepsHTML}
    </div>

    <div class="info-section">
      <div class="info-section-title">⏱ Complexity</div>
      <div class="info-complexity">
        <div class="info-complexity-box"><div class="label">Time Complexity</div><div class="value">${d.complexity.time}</div></div>
        <div class="info-complexity-box"><div class="label">Space Complexity</div><div class="value">${d.complexity.space}</div></div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-section-title">🌍 Real-World Applications</div>
      <div class="info-app-grid">${appsHTML}</div>
    </div>

    <div class="info-section">
      <div class="info-section-title">🔬 How This Project Uses It</div>
      <div class="info-highlight">${d.projectContext}</div>
    </div>
  `;

  const overlay = document.getElementById('info-overlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
  document.getElementById('info-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

document.getElementById('info-btn').addEventListener('click', () => openInfoModal(currentView));
document.getElementById('info-close-btn').addEventListener('click', closeInfoModal);
document.getElementById('info-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeInfoModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeInfoModal(); });

/* ════════════════════════════════════════════════════════════════════════
   HUFFMAN CODING
   ════════════════════════════════════════════════════════════════════════ */
document.getElementById('huf-compress-btn').addEventListener('click', async () => {
  const text = document.getElementById('huf-text').value.trim();
  if (!text) return;

  const btn = document.getElementById('huf-compress-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Compressing…';

  try {
    const res = await fetch(`${API}/api/huffman`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const d = await res.json();

    // Stats
    document.getElementById('huf-orig-bits').textContent  = d.original_bits;
    document.getElementById('huf-comp-bits').textContent  = d.compressed_bits;
    document.getElementById('huf-ratio').textContent      = d.ratio_pct.toFixed(1);
    document.getElementById('huf-stats').style.display    = '';

    // Encoded binary preview
    document.getElementById('huf-encoded').textContent    = d.encoded.substring(0, 800) + (d.encoded.length > 800 ? '…' : '');
    document.getElementById('huf-encoded-card').style.display = '';

    // Code table
    const tbody = document.getElementById('huf-tbody');
    tbody.innerHTML = '';
    d.table.sort((a, b) => b.freq - a.freq).forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.char === ' ' ? '<em style="color:var(--text3)">SPC</em>' : row.char}</td>
        <td>${row.freq}</td>
        <td><span style="color:var(--cyan);font-family:var(--font-mono)">${row.code}</span></td>
        <td>${row.code.length}</td>`;
      tbody.appendChild(tr);
    });
    document.getElementById('huf-table-card').style.display = '';

  } catch (e) {
    alert('Huffman error: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🗜️ Compress';
  }
});

document.getElementById('huf-clear-btn').addEventListener('click', () => {
  document.getElementById('huf-text').value = '';
  document.getElementById('huf-stats').style.display = 'none';
  document.getElementById('huf-encoded-card').style.display = 'none';
  document.getElementById('huf-table-card').style.display = 'none';
});

/* ════════════════════════════════════════════════════════════════════════
   STOCK PROFIT
   ════════════════════════════════════════════════════════════════════════ */
const stockCanvas = document.getElementById('stock-chart');
const stockCtx    = stockCanvas.getContext('2d');

function drawStockChart(prices, transactions) {
  const W = stockCanvas.offsetWidth;
  const H = stockCanvas.offsetHeight;
  stockCanvas.width  = W * devicePixelRatio;
  stockCanvas.height = H * devicePixelRatio;
  stockCtx.scale(devicePixelRatio, devicePixelRatio);

  const pad = { top: 20, right: 20, bottom: 30, left: 44 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top  - pad.bottom;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const n   = prices.length;

  const px = i => pad.left + (i / (n - 1)) * cw;
  const py = v => pad.top  + (1 - (v - min) / (max - min + 1)) * ch;

  // Grid
  stockCtx.strokeStyle = 'rgba(255,255,255,0.05)';
  stockCtx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const y = pad.top + (g / 4) * ch;
    stockCtx.beginPath(); stockCtx.moveTo(pad.left, y); stockCtx.lineTo(W - pad.right, y); stockCtx.stroke();
    const val = max - (g / 4) * (max - min);
    stockCtx.fillStyle = 'rgba(148,163,184,0.5)';
    stockCtx.font = '10px JetBrains Mono';
    stockCtx.fillText(val.toFixed(0), 4, y + 4);
  }

  // Buy/sell background bands
  (transactions || []).forEach(t => {
    stockCtx.fillStyle = 'rgba(34,197,94,0.07)';
    stockCtx.fillRect(px(t.buy_day), pad.top, px(t.sell_day) - px(t.buy_day), ch);
  });

  // Price line (gradient)
  const grad = stockCtx.createLinearGradient(pad.left, 0, W - pad.right, 0);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(1, '#a855f7');
  stockCtx.strokeStyle = grad;
  stockCtx.lineWidth = 2.5;
  stockCtx.lineJoin = 'round';
  stockCtx.beginPath();
  prices.forEach((p, i) => { i === 0 ? stockCtx.moveTo(px(i), py(p)) : stockCtx.lineTo(px(i), py(p)); });
  stockCtx.stroke();

  // Buy/sell markers
  (transactions || []).forEach(t => {
    // Buy - green circle
    stockCtx.fillStyle = '#22c55e';
    stockCtx.beginPath(); stockCtx.arc(px(t.buy_day), py(t.buy_price), 5, 0, Math.PI * 2); stockCtx.fill();
    // Sell - red circle
    stockCtx.fillStyle = '#f43f5e';
    stockCtx.beginPath(); stockCtx.arc(px(t.sell_day), py(t.sell_price), 5, 0, Math.PI * 2); stockCtx.fill();
  });

  // X-axis day labels
  stockCtx.fillStyle = 'rgba(148,163,184,0.6)';
  stockCtx.font = '10px JetBrains Mono';
  prices.forEach((_, i) => {
    if (n <= 20 || i % Math.ceil(n / 10) === 0)
      stockCtx.fillText(`D${i}`, px(i) - 8, H - pad.bottom + 18);
  });
}

document.getElementById('stock-solve-btn').addEventListener('click', async () => {
  const raw = document.getElementById('stock-prices').value;
  const prices = raw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const k = parseInt(document.getElementById('stock-k').value);
  if (prices.length < 2) return alert('Enter at least 2 prices.');

  const btn = document.getElementById('stock-solve-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Solving…';

  try {
    const res = await fetch(`${API}/api/stock`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prices, k })
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const d = await res.json();

    document.getElementById('stock-profit').textContent = d.max_profit;

    const tbody = document.getElementById('stock-tbody');
    tbody.innerHTML = '';
    d.transactions.forEach((t, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${idx+1}</td><td>Day ${t.buy_day}</td><td>Day ${t.sell_day}</td>
        <td style="color:var(--green)">$${t.buy_price}</td>
        <td style="color:var(--red)">$${t.sell_price}</td>
        <td style="color:var(--amber);font-weight:700">+${t.profit}</td>`;
      tbody.appendChild(tr);
    });

    showBanner('stock-banner', `✅ Max profit with ≤${k} transactions: <strong>$${d.max_profit}</strong> using ${d.transactions.length} trade(s).`, 'success');
    drawStockChart(prices, d.transactions);

  } catch (e) {
    showBanner('stock-banner', '❌ ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = '📈 Find Max Profit';
  }
});

/* ════════════════════════════════════════════════════════════════════════
   0/1 KNAPSACK
   ════════════════════════════════════════════════════════════════════════ */
document.getElementById('ks-solve-btn').addEventListener('click', async () => {
  const weights  = document.getElementById('ks-weights').value.split(',').map(s => parseInt(s.trim())).filter(x => !isNaN(x));
  const values   = document.getElementById('ks-values').value.split(',').map(s => parseInt(s.trim())).filter(x => !isNaN(x));
  const capacity = parseInt(document.getElementById('ks-capacity').value);

  if (weights.length === 0 || weights.length !== values.length) return alert('Weights and values must have the same count.');
  if (isNaN(capacity) || capacity <= 0) return alert('Enter a valid capacity.');

  const btn = document.getElementById('ks-solve-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Solving…';

  try {
    const res = await fetch(`${API}/api/knapsack`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights, values, capacity })
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const d = await res.json();

    // Stats
    document.getElementById('ks-value').textContent  = d.max_value;
    document.getElementById('ks-weight').textContent = `${d.total_weight}/${capacity}`;
    document.getElementById('ks-count').textContent  = d.selected.length;
    document.getElementById('ks-stats').style.display = '';

    // Item table
    const tbody = document.getElementById('ks-tbody');
    tbody.innerHTML = '';
    d.items.forEach(item => {
      const tr = document.createElement('tr');
      const yes = item.selected;
      tr.innerHTML = `
        <td>Item ${item.index + 1}</td>
        <td>${item.weight}</td>
        <td>${item.value}</td>
        <td style="color:${yes ? 'var(--green)' : 'var(--text3)'};font-weight:${yes ? 700 : 400}">
          ${yes ? '✔ Selected' : '✗ Skipped'}
        </td>`;
      tbody.appendChild(tr);
    });
    document.getElementById('ks-items-card').style.display = '';

    // Animate DP table
    animateKnapsackTable(d);

  } catch (e) {
    alert('Knapsack error: ' + e.message);
  } finally {
    btn.disabled = false; btn.innerHTML = '🎒 Solve Knapsack';
  }
});

function animateKnapsackTable(d) {
  const container = document.getElementById('ks-table-container');
  document.getElementById('ks-table-placeholder').style.display = 'none';

  const table = document.createElement('table');
  table.className = 'ks-dp-table';

  // Header row: capacities 0 → display_cap
  const thead = document.createElement('thead');
  let headerRow = '<tr><th>Item \\ Cap</th>';
  for (let w = 0; w <= d.display_cap; w++) headerRow += `<th>${w}</th>`;
  headerRow += '</tr>';
  thead.innerHTML = headerRow;
  table.appendChild(thead);

  // Body: all rows initially empty cells
  const tbody = document.createElement('tbody');
  const rows = [];
  for (let i = 0; i <= d.n_items; i++) {
    const tr = document.createElement('tr');
    const labelText = i === 0 ? 'None' : `Item ${i} (w=${d.items[i-1]?.weight || '?'}, v=${d.items[i-1]?.value || '?'})`;
    tr.innerHTML = `<td class="ks-row-label">${labelText}</td>`;
    const cells = [];
    for (let w = 0; w <= d.display_cap; w++) {
      const td = document.createElement('td');
      td.textContent = '·';
      tr.appendChild(td);
      cells.push(td);
    }
    tbody.appendChild(tr);
    rows.push(cells);
  }
  table.appendChild(tbody);

  container.innerHTML = '';
  container.appendChild(table);

  // Animate row by row
  let i = 0;
  function fillNextRow() {
    if (i > d.n_items) return;
    const rowData = d.dp_table[i];
    for (let w = 0; w <= d.display_cap && w < rowData.length; w++) {
      const td = rows[i][w];
      td.textContent = rowData[w];
      // Highlight selected items (those whose choice changed from row above)
      if (i > 0 && d.dp_table[i][w] !== d.dp_table[i-1][w]) {
        td.classList.add('ks-highlighted');
      }
    }
    // After all rows done, mark selected cells
    if (i === d.n_items) {
      let w = Math.min(d.capacity, d.display_cap);
      for (let ri = d.n_items; ri >= 1; ri--) {
        if (d.dp_table[ri][w] !== d.dp_table[ri-1][w]) {
          rows[ri][w].classList.add('ks-selected');
          w -= (d.items[ri-1]?.weight || 0);
          if (w < 0) break;
        }
      }
    }
    i++;
    setTimeout(fillNextRow, 120);
  }
  fillNextRow();
}

/* ════════════════════════════════════════════════════════════════════════
   TSP SOLVER
   ════════════════════════════════════════════════════════════════════════ */
const tspCanvas = document.getElementById('tsp-canvas');
const tspCtx    = tspCanvas.getContext('2d');
let   tspCities = [];
let   tspTour   = null;

function resizeTSPCanvas() {
  tspCanvas.width  = tspCanvas.offsetWidth  * devicePixelRatio;
  tspCanvas.height = tspCanvas.offsetHeight * devicePixelRatio;
  tspCtx.scale(devicePixelRatio, devicePixelRatio);
  drawTSP();
}

function drawTSP() {
  const W = tspCanvas.offsetWidth;
  const H = tspCanvas.offsetHeight;
  tspCtx.clearRect(0, 0, W, H);

  if (tspTour && tspTour.length > 1) {
    // Draw tour edges
    const grad = tspCtx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#6366f1'); grad.addColorStop(1, '#a855f7');
    tspCtx.strokeStyle = grad;
    tspCtx.lineWidth = 2.5;
    tspCtx.lineJoin = 'round';
    tspCtx.beginPath();
    tspTour.forEach((ci, idx) => {
      const c = tspCities[ci];
      idx === 0 ? tspCtx.moveTo(c.x, c.y) : tspCtx.lineTo(c.x, c.y);
    });
    tspCtx.closePath();
    tspCtx.stroke();
  }

  // Draw cities
  tspCities.forEach((c, i) => {
    tspCtx.fillStyle = '#6366f1';
    tspCtx.beginPath(); tspCtx.arc(c.x, c.y, 8, 0, Math.PI * 2); tspCtx.fill();
    tspCtx.fillStyle = '#fff';
    tspCtx.font = 'bold 10px Inter';
    tspCtx.textAlign = 'center';
    tspCtx.textBaseline = 'middle';
    tspCtx.fillText(i, c.x, c.y);
    tspCtx.textAlign = 'start';
    tspCtx.textBaseline = 'alphabetic';
  });

  document.getElementById('tsp-city-count').textContent = tspCities.length;
}

tspCanvas.addEventListener('click', e => {
  if (tspCities.length >= 15) return;
  const rect = tspCanvas.getBoundingClientRect();
  tspCities.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  tspTour = null;
  document.getElementById('tsp-dist').textContent = '—';
  document.getElementById('tsp-method').textContent = '—';
  drawTSP();
});

document.getElementById('tsp-parse-btn').addEventListener('click', () => {
  const raw = document.getElementById('tsp-coord-input').value;
  const pts = raw.split(';').map(s => {
    const [x, y] = s.split(',').map(Number);
    return { x, y };
  }).filter(p => !isNaN(p.x) && !isNaN(p.y));
  if (!pts.length) return alert('No valid coordinates found.');
  const remaining = 15 - tspCities.length;
  tspCities.push(...pts.slice(0, remaining));
  tspTour = null;
  drawTSP();
});

document.getElementById('tsp-clear-btn').addEventListener('click', () => {
  tspCities = []; tspTour = null;
  document.getElementById('tsp-dist').textContent   = '—';
  document.getElementById('tsp-method').textContent = '—';
  document.getElementById('tsp-banner').className   = 'result-banner';
  drawTSP();
});

document.getElementById('tsp-solve-btn').addEventListener('click', async () => {
  if (tspCities.length < 2) return alert('Place at least 2 cities on the canvas.');

  const btn = document.getElementById('tsp-solve-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Solving…';

  try {
    const res = await fetch(`${API}/api/tsp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cities: tspCities.map(c => ({ x: c.x, y: c.y })) })
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const d = await res.json();
    tspTour = d.tour;
    document.getElementById('tsp-dist').textContent   = d.distance.toFixed(1);
    document.getElementById('tsp-method').textContent = d.method || 'Held-Karp';
    showBanner('tsp-banner', `✅ Tour distance: <strong>${d.distance.toFixed(1)}</strong> units via ${d.method || 'Held-Karp'}`, 'success');
    drawTSP();
  } catch (e) {
    showBanner('tsp-banner', '❌ ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = '🗺️ Solve TSP (Held-Karp)';
  }
});

window.addEventListener('resize', () => { if (currentView === 'tsp') resizeTSPCanvas(); });
setTimeout(resizeTSPCanvas, 100);

/* ════════════════════════════════════════════════════════════════════════
   N-QUEENS
   ════════════════════════════════════════════════════════════════════════ */
let nqSolutions = [];
let nqIndex     = 0;

function renderNQBoard(solution, n) {
  const container = document.getElementById('nq-board-container');
  container.innerHTML = '';
  if (!solution) return;

  const size = Math.min(Math.floor((container.offsetWidth || 400) / n), 52);
  const board = document.createElement('div');
  board.style.cssText = `display:grid;grid-template-columns:repeat(${n},${size}px);gap:2px;`;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cell = document.createElement('div');
      const light = (r + c) % 2 === 0;
      cell.style.cssText = `
        width:${size}px;height:${size}px;border-radius:4px;
        background:${light ? 'rgba(99,102,241,0.12)' : 'rgba(10,14,26,0.6)'};
        display:flex;align-items:center;justify-content:center;
        font-size:${size * 0.55}px;border:1px solid rgba(255,255,255,0.05);
        transition:all 0.2s ease;`;
      if (solution[r] === c) {
        cell.textContent = '♛';
        cell.style.background = 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(168,85,247,0.25))';
        cell.style.boxShadow = '0 0 12px rgba(99,102,241,0.4)';
      }
      board.appendChild(cell);
    }
  }
  container.appendChild(board);
}

document.getElementById('nq-solve-btn').addEventListener('click', async () => {
  const n = parseInt(document.getElementById('nq-n').value);
  if (isNaN(n) || n < 1 || n > 12) return alert('N must be 1–12');

  const btn = document.getElementById('nq-solve-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Solving…';

  try {
    const res = await fetch(`${API}/api/nqueens`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n })
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const d = await res.json();
    nqSolutions = d.solutions;
    nqIndex     = 0;

    document.getElementById('nq-size-stat').textContent = `${n}×${n}`;
    document.getElementById('nq-total').textContent     = nqSolutions.length;
    document.getElementById('nq-viewing').textContent   = nqSolutions.length > 0 ? `1 / ${nqSolutions.length}` : 'None';

    if (nqSolutions.length > 0) {
      renderNQBoard(nqSolutions[0], n);
      showBanner('nq-banner', `✅ Found <strong>${nqSolutions.length}</strong> solutions for N=${n}.`, 'success');
    } else {
      showBanner('nq-banner', `❌ No solutions exist for N=${n}.`, 'error');
    }
  } catch (e) {
    showBanner('nq-banner', '❌ ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = '♛ Solve N-Queens';
  }
});

document.getElementById('nq-prev-btn').addEventListener('click', () => {
  if (!nqSolutions.length) return;
  nqIndex = (nqIndex - 1 + nqSolutions.length) % nqSolutions.length;
  renderNQBoard(nqSolutions[nqIndex], parseInt(document.getElementById('nq-n').value));
  document.getElementById('nq-viewing').textContent = `${nqIndex + 1} / ${nqSolutions.length}`;
});

document.getElementById('nq-next-btn').addEventListener('click', () => {
  if (!nqSolutions.length) return;
  nqIndex = (nqIndex + 1) % nqSolutions.length;
  renderNQBoard(nqSolutions[nqIndex], parseInt(document.getElementById('nq-n').value));
  document.getElementById('nq-viewing').textContent = `${nqIndex + 1} / ${nqSolutions.length}`;
});

document.getElementById('nq-verify-btn').addEventListener('click', async () => {
  const raw = document.getElementById('nq-custom').value.trim();
  const n   = parseInt(document.getElementById('nq-n').value);
  const placement = raw.split(/\s+/).map(Number).filter(x => !isNaN(x));
  if (!placement.length) return alert('Enter a placement first.');

  try {
    const res = await fetch(`${API}/api/nqueens/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placement, n })
    });
    const d = await res.json();
    if (d.valid) {
      renderNQBoard(placement, n);
      showBanner('nq-banner', '✅ Valid placement! All queens are safe.', 'success');
    } else {
      showBanner('nq-banner', `❌ Invalid: ${d.reason}`, 'error');
    }
  } catch (e) {
    showBanner('nq-banner', '❌ ' + e.message, 'error');
  }
});

/* ════════════════════════════════════════════════════════════════════════
   TOWER OF HANOI
   ════════════════════════════════════════════════════════════════════════ */
let hanoiMoves   = [];
let hanoiStep    = 0;
let hanoiTimer   = null;
let hanoiPegs    = { A: [], B: [], C: [] };
let hanoiN       = 4;

const hCanvas = document.getElementById('hanoi-canvas');
const hCtx    = hCanvas.getContext('2d');

const PEG_COLORS = ['A', 'B', 'C'];
const DISK_COLORS = [
  '#f43f5e','#f59e0b','#22c55e','#06b6d4',
  '#6366f1','#a855f7','#ec4899','#14b8a6','#f97316','#84cc16'
];

function hanoiPegX(pegId, canvasW) {
  const idx = { A: 0, B: 1, C: 2 }[pegId];
  const section = canvasW / 3;
  return section * idx + section / 2;
}

function drawHanoiCanvas() {
  const W = hCanvas.offsetWidth  || 560;
  const H = hCanvas.offsetHeight || 300;
  hCanvas.width  = W * devicePixelRatio;
  hCanvas.height = H * devicePixelRatio;
  hCtx.scale(devicePixelRatio, devicePixelRatio);

  hCtx.clearRect(0, 0, W, H);

  const baseY   = H - 30;
  const pegW    = 8;
  const maxDiskW = W / 3 - 30;
  const diskH   = Math.min(22, (baseY - 60) / (hanoiN + 1));

  // Draw base line
  hCtx.fillStyle = 'rgba(255,255,255,0.08)';
  hCtx.fillRect(20, baseY, W - 40, 4);

  // Draw pegs and labels
  ['A', 'B', 'C'].forEach(peg => {
    const cx = hanoiPegX(peg, W);
    // Peg rod
    const grad = hCtx.createLinearGradient(cx, 50, cx, baseY);
    grad.addColorStop(0, 'rgba(148,163,184,0.6)');
    grad.addColorStop(1, 'rgba(148,163,184,0.2)');
    hCtx.fillStyle = grad;
    hCtx.fillRect(cx - pegW / 2, 50, pegW, baseY - 50);

    // Peg label
    hCtx.fillStyle = 'rgba(148,163,184,0.7)';
    hCtx.font = `bold 13px Inter`;
    hCtx.textAlign = 'center';
    hCtx.fillText(`Peg ${peg}`, cx, baseY + 20);

    // Draw disks on this peg
    const disksOnPeg = hanoiPegs[peg];
    disksOnPeg.forEach((diskNum, idx) => {
      const fraction = diskNum / hanoiN;
      const diskW    = maxDiskW * (0.3 + 0.7 * fraction);
      const y        = baseY - diskH * (idx + 1);
      const radius   = diskH / 2;

      const color = DISK_COLORS[(diskNum - 1) % DISK_COLORS.length];
      const dGrad = hCtx.createLinearGradient(cx - diskW/2, y, cx + diskW/2, y + diskH);
      dGrad.addColorStop(0, color + 'dd');
      dGrad.addColorStop(1, color + '88');

      hCtx.fillStyle = dGrad;
      hCtx.shadowColor = color;
      hCtx.shadowBlur = 8;
      roundRect(hCtx, cx - diskW / 2, y, diskW, diskH - 2, radius);
      hCtx.fill();
      hCtx.shadowBlur = 0;

      // Disk number label
      hCtx.fillStyle = '#fff';
      hCtx.font = `bold ${Math.max(9, diskH * 0.5)}px JetBrains Mono`;
      hCtx.textAlign = 'center';
      hCtx.fillText(diskNum, cx, y + diskH / 2 + 1);
    });
  });

  hCtx.textAlign = 'start';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function resetHanoiPegs(n) {
  hanoiPegs = { A: [], B: [], C: [] };
  for (let i = n; i >= 1; i--) hanoiPegs.A.push(i);
}

function applyHanoiMove(move) {
  const disk = hanoiPegs[move.from].pop();
  hanoiPegs[move.to].push(disk);
}

document.getElementById('hanoi-solve-btn').addEventListener('click', async () => {
  const n = parseInt(document.getElementById('hanoi-n').value);
  if (isNaN(n) || n < 1 || n > 10) return alert('N must be 1–10.');

  if (hanoiTimer) { clearInterval(hanoiTimer); hanoiTimer = null; }

  const btn = document.getElementById('hanoi-solve-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Solving…';

  try {
    const res = await fetch(`${API}/api/hanoi`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n })
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const d = await res.json();

    hanoiMoves = d.moves;
    hanoiN     = n;
    hanoiStep  = 0;

    document.getElementById('hanoi-disks-stat').textContent = n;
    document.getElementById('hanoi-total').textContent      = d.total_moves;
    document.getElementById('hanoi-current').textContent    = '0';

    resetHanoiPegs(n);
    drawHanoiCanvas();

    const log = document.getElementById('hanoi-log');
    log.innerHTML = '';

    showBanner('hanoi-banner', `🗼 Animating ${d.total_moves} moves for ${n} disks (2ⁿ−1 = ${d.total_moves})…`, 'info');

    const speed = parseInt(document.getElementById('hanoi-speed').value);

    hanoiTimer = setInterval(() => {
      if (hanoiStep >= hanoiMoves.length) {
        clearInterval(hanoiTimer); hanoiTimer = null;
        showBanner('hanoi-banner', `✅ Done! Moved ${n} disks in exactly ${d.total_moves} moves.`, 'success');
        btn.disabled = false; btn.innerHTML = '🗼 Solve & Animate';
        return;
      }

      const move = hanoiMoves[hanoiStep];
      applyHanoiMove(move);
      drawHanoiCanvas();

      // Log entry
      const entry = document.createElement('div');
      entry.className = 'hanoi-log-entry hanoi-current-move';
      entry.textContent = `Move ${hanoiStep + 1}: Disk ${move.disk}  →  Peg ${move.from}  →  Peg ${move.to}`;
      log.prepend(entry);

      // Dim previous current
      const prev = log.querySelector('.hanoi-current-move:nth-child(2)');
      if (prev) { prev.classList.remove('hanoi-current-move'); prev.style.color = 'var(--text3)'; }

      document.getElementById('hanoi-current').textContent = hanoiStep + 1;
      hanoiStep++;
    }, speed);

  } catch (e) {
    showBanner('hanoi-banner', '❌ ' + e.message, 'error');
    btn.disabled = false; btn.innerHTML = '🗼 Solve & Animate';
  }
});

document.getElementById('hanoi-reset-btn').addEventListener('click', () => {
  if (hanoiTimer) { clearInterval(hanoiTimer); hanoiTimer = null; }
  resetHanoiPegs(hanoiN);
  hanoiStep = 0;
  document.getElementById('hanoi-current').textContent    = '—';
  document.getElementById('hanoi-disks-stat').textContent = '—';
  document.getElementById('hanoi-total').textContent      = '—';
  document.getElementById('hanoi-log').innerHTML          = '';
  document.getElementById('hanoi-banner').className       = 'result-banner';
  document.getElementById('hanoi-solve-btn').disabled     = false;
  document.getElementById('hanoi-solve-btn').innerHTML    = '🗼 Solve & Animate';
  drawHanoiCanvas();
});

/* ════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ════════════════════════════════════════════════════════════════════════ */
function showBanner(id, html, type = 'info') {
  const el = document.getElementById(id);
  el.innerHTML = html;
  el.className = `result-banner show banner-${type}`;
}

/* ── Init ─────────────────────────────────────────────────────────────── */
switchView('huffman');
setTimeout(() => {
  resizeTSPCanvas();
  drawHanoiCanvas();
}, 200);
