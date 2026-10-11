/* Max Flow — Edmonds-Karp on an editable edge list, drawn as a layered graph. */
(() => {
  const PRESETS = {
    clrs: { n: 6, s: 0, t: 5, edges: '0 1 16\n0 2 13\n1 3 12\n2 1 4\n2 4 14\n3 2 9\n3 5 20\n4 3 7\n4 5 4' },
    diamond: { n: 4, s: 0, t: 3, edges: '0 1 10\n0 2 5\n1 2 15\n1 3 5\n2 3 10' },
    // Workers 1-3, jobs 4-6; each worker can do some jobs. Max flow = max matching.
    matching: { n: 8, s: 0, t: 7, edges: '0 1 1\n0 2 1\n0 3 1\n1 4 1\n1 5 1\n2 4 1\n3 5 1\n3 6 1\n4 7 1\n5 7 1\n6 7 1' },
  };

  const canvas = $('flow-canvas');
  let result = null;      // last API response
  let graph = null;       // { n, s, t, edges } that produced it
  let highlight = null;   // index of augmenting path to highlight
  let replayToken = 0;

  function parseEdges(text) {
    const edges = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    for (const [i, line] of lines.entries()) {
      const parts = line.split(/[\s,]+/).map(Number);
      if (parts.length !== 3 || parts.some(x => !Number.isInteger(x))) {
        throw new Error(`Line ${i + 1} ("${line}") must be three whole numbers: from to capacity.`);
      }
      edges.push({ from: parts[0], to: parts[1], capacity: parts[2] });
    }
    return edges;
  }

  // x = BFS distance from the source (sink pinned to the last column),
  // y = evenly spread within the column.
  function layout(n, s, t, edges, W, H) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
    const level = Array(n).fill(-1);
    level[s] = 0;
    const q = [s];
    while (q.length) {
      const u = q.shift();
      adj[u].forEach(v => { if (level[v] === -1) { level[v] = level[u] + 1; q.push(v); } });
    }
    let maxLevel = Math.max(1, ...level);
    for (let v = 0; v < n; v++) if (level[v] === -1) level[v] = Math.max(1, maxLevel - 1);  // unreachable nodes
    if (level[t] !== maxLevel || level.filter(l => l === maxLevel).length > 1) level[t] = ++maxLevel;
    const cols = Array.from({ length: maxLevel + 1 }, () => []);
    level.forEach((l, v) => cols[l].push(v));
    const pos = [];
    const padX = 50, padY = 40;
    cols.forEach((col, l) => col.forEach((v, k) => {
      pos[v] = {
        x: padX + (l / maxLevel) * (W - 2 * padX),
        y: padY + ((k + 1) / (col.length + 1)) * (H - 2 * padY),
      };
    }));
    return pos;
  }

  function arrow(ctx, x1, y1, x2, y2, bend, r) {
    // Quadratic curve from node edge to node edge; bend separates antiparallel edges.
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
    const a1 = Math.atan2(cy - y1, cx - x1), a2 = Math.atan2(y2 - cy, x2 - cx);
    const sx = x1 + Math.cos(a1) * r, sy = y1 + Math.sin(a1) * r;
    const ex = x2 - Math.cos(a2) * (r + 2), ey = y2 - Math.sin(a2) * (r + 2);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
    const h = 9;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - h * Math.cos(a2 - 0.4), ey - h * Math.sin(a2 - 0.4));
    ctx.lineTo(ex - h * Math.cos(a2 + 0.4), ey - h * Math.sin(a2 + 0.4));
    ctx.closePath();
    ctx.fill();
    // Label at t=0.4 along the curve rather than the midpoint, so labels of
    // edges that cross in the middle (e.g. 1→5 and 2→4) do not overlap.
    const t = 0.4, u = 1 - t;
    return { lx: u * u * sx + 2 * u * t * cx + t * t * ex, ly: u * u * sy + 2 * u * t * cy + t * t * ey };
  }

  function draw() {
    const { ctx, W, H } = setupCanvas(canvas);
    if (!W || !H) return;   // view is hidden; onShow redraws
    const P = palette();
    if (!graph) {
      ctx.fillStyle = P.text3;
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Run the solver to draw the network', W / 2, H / 2);
      ctx.textAlign = 'start';
      return;
    }
    const { n, s, t, edges } = graph;
    const pos = layout(n, s, t, edges, W, H);
    const R = 17;
    const flowOf = {};
    (result?.edge_flows || []).forEach(e => { flowOf[`${e.from},${e.to}`] = e; });
    const cut = new Set((result?.min_cut.edges || []).map(e => `${e.from},${e.to}`));
    const sourceSide = new Set(result?.min_cut.source_side || []);
    const pathEdges = new Set();
    if (highlight !== null && result) {
      const p = result.augmenting_paths[highlight].path;
      // A step u→v may use residual capacity of the reverse edge v→u (cancelling flow).
      for (let i = 0; i < p.length - 1; i++) {
        pathEdges.add(`${p[i]},${p[i + 1]}`);
        pathEdges.add(`${p[i + 1]},${p[i]}`);
      }
    }
    const capMax = Math.max(1, ...edges.map(e => e.capacity));
    const seen = new Set();

    edges.forEach(e => {
      const key = `${e.from},${e.to}`;
      if (seen.has(key)) return;   // parallel edges are merged by the server
      seen.add(key);
      const f = flowOf[key];
      const a = pos[e.from], b = pos[e.to];
      const antiparallel = edges.some(o => o.from === e.to && o.to === e.from);
      const onPath = pathEdges.has(key);
      const isCut = cut.has(key);
      const used = f && f.flow > 0;
      const color = onPath ? P.amber : isCut ? P.red : used ? P.accent : P.text3;
      ctx.strokeStyle = ctx.fillStyle = color;
      ctx.globalAlpha = used || onPath || isCut ? 1 : 0.45;
      ctx.lineWidth = onPath ? 4 : used ? 1.5 + 3 * (f.flow / capMax) : 1.2;
      ctx.setLineDash(isCut && !onPath ? [6, 4] : []);
      const { lx, ly } = arrow(ctx, a.x, a.y, b.x, b.y, antiparallel ? 18 : 0, R);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      const label = f ? `${f.flow}/${f.capacity}` : `${e.capacity}`;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      const tw = ctx.measureText(label).width + 8;
      ctx.fillStyle = P.card;
      ctx.fillRect(lx - tw / 2, ly - 8, tw, 16);
      ctx.fillStyle = f?.saturated ? P.red : P.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lx, ly);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    });

    for (let v = 0; v < n; v++) {
      const { x, y } = pos[v];
      ctx.fillStyle = v === s ? P.green : v === t ? P.red : P.surface;
      ctx.strokeStyle = sourceSide.has(v) ? P.green : P.text3;
      ctx.lineWidth = sourceSide.has(v) ? 3 : 1.5;
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = v === s || v === t ? '#fff' : P.text;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(v === s ? 's' : v === t ? 't' : v, x, y);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }
  }

  function renderPaths() {
    const list = $('flow-paths');
    list.innerHTML = '';
    if (!result.augmenting_paths.length) {
      list.innerHTML = '<p class="placeholder">No augmenting path exists — the sink is unreachable.</p>';
      return;
    }
    result.augmenting_paths.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'path-item';
      b.textContent = `#${i + 1}  ${p.path.join(' → ')}   +${p.flow}`;
      b.addEventListener('click', () => {
        replayToken++;
        highlight = highlight === i ? null : i;
        list.querySelectorAll('.path-item').forEach((x, j) => x.classList.toggle('active', j === highlight));
        draw();
      });
      list.appendChild(b);
    });
  }

  async function replay() {
    if (!result?.augmenting_paths.length) return;
    const token = ++replayToken;
    const items = $('flow-paths').querySelectorAll('.path-item');
    for (let i = 0; i < result.augmenting_paths.length; i++) {
      if (token !== replayToken) return;
      highlight = i;
      items.forEach((x, j) => x.classList.toggle('active', j === i));
      draw();
      await sleep(prefersReducedMotion() ? 300 : 1100);
    }
    if (token === replayToken) {
      highlight = null;
      items.forEach(x => x.classList.remove('active'));
      draw();
    }
  }

  async function run() {
    const n = Number($('flow-n').value), s = Number($('flow-s').value), t = Number($('flow-t').value);
    let edges;
    try { edges = parseEdges($('flow-edges').value); } catch (e) { return toast(e.message); }
    if (!Number.isInteger(n) || n < 2 || n > LIMITS.flowNodes) return toast(`Nodes must be between 2 and ${LIMITS.flowNodes}.`);
    if (![s, t].every(v => Number.isInteger(v) && v >= 0 && v < n)) return toast(`Source and sink must be between 0 and ${n - 1}.`);
    if (s === t) return toast('Source and sink must be different.');
    if (!edges.length) return toast('Add at least one edge.');
    if (edges.length > LIMITS.flowEdges) return toast(`At most ${LIMITS.flowEdges} edges are supported.`);
    const badEdge = edges.find(e => e.from < 0 || e.from >= n || e.to < 0 || e.to >= n || e.from === e.to);
    if (badEdge) return toast(`Edge ${badEdge.from} → ${badEdge.to} is invalid: nodes are 0–${n - 1} and self-loops are not allowed.`);
    if (edges.some(e => e.capacity < 0 || e.capacity > LIMITS.flowCapacity)) return toast(`Capacities must be 0–${LIMITS.flowCapacity}.`);

    await withBusy($('flow-solve-btn'), 'Solving…', async () => {
      try {
        result = await postJSON('/api/maxflow', { n, edges, source: s, sink: t });
        graph = { n, s, t, edges };
        highlight = null;
        replayToken++;
        $('flow-value').textContent = result.max_flow;
        $('flow-npaths').textContent = result.augmenting_paths.length;
        $('flow-cut').textContent = result.min_cut.capacity;
        const cutText = result.min_cut.edges.map(e => `${e.from}→${e.to}`).join(', ') || 'none';
        showBanner('flow-banner', `✅ Max flow <strong>${result.max_flow}</strong> = min cut capacity <strong>${result.min_cut.capacity}</strong> (cut edges: ${escapeHTML(cutText)}).`, 'success');
        renderPaths();
        draw();
      } catch (e) {
        showBanner('flow-banner', '❌ ' + escapeHTML(e.message), 'error');
      }
    });
  }

  function loadPreset(name) {
    const p = PRESETS[name];
    $('flow-n').value = p.n;
    $('flow-s').value = p.s;
    $('flow-t').value = p.t;
    $('flow-edges').value = p.edges;
    run();
  }

  $('flow-solve-btn').addEventListener('click', run);
  $('flow-replay-btn').addEventListener('click', replay);
  $('flow-preset').addEventListener('change', e => { if (PRESETS[e.target.value]) loadPreset(e.target.value); });

  registerView('maxflow', {
    run,
    redraw: draw,
    onShow: () => { if (!graph) loadPreset('clrs'); else draw(); },
  });
})();
