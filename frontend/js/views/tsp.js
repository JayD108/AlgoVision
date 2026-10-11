/* Travelling Salesman — click to place cities, exact or heuristic tour. */
(() => {
  const canvas = $('tsp-canvas');
  let cities = [];
  let tour = null;
  let drawn = 0;          // how many tour edges are visible (for the animation)
  let animToken = 0;

  function resetResult() {
    tour = null;
    animToken++;
    $('tsp-dist').textContent = '—';
    $('tsp-method').textContent = '—';
    hideBanner('tsp-banner');
  }

  function draw() {
    const { ctx, W, H } = setupCanvas(canvas);
    if (!W || !H) return;   // view is hidden; onShow redraws
    const P = palette();

    if (!cities.length) {
      ctx.fillStyle = P.text3;
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click anywhere to place a city', W / 2, H / 2);
      ctx.textAlign = 'start';
    }

    if (tour && drawn > 0) {
      ctx.strokeStyle = P.accent;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i <= drawn; i++) {
        const c = cities[tour[i]];
        if (i === 0) ctx.moveTo(c.x, c.y); else ctx.lineTo(c.x, c.y);
      }
      ctx.stroke();
    }

    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    cities.forEach((c, i) => {
      ctx.fillStyle = i === 0 ? P.text : P.card;
      ctx.strokeStyle = i === 0 ? P.text : P.text3;
      ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = i === 0 ? P.surface : P.text;
      ctx.fillText(i, c.x, c.y);
    });
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    $('tsp-city-count').textContent = `${cities.length}/${LIMITS.tspCities}`;
  }

  async function animateTour() {
    const token = ++animToken;
    const steps = tour.length - 1;
    if (prefersReducedMotion()) { drawn = steps; draw(); return; }
    const delay = Math.max(20, Math.min(120, 1500 / steps));
    for (drawn = 1; drawn <= steps; drawn++) {
      if (token !== animToken) return;
      draw();
      await sleep(delay);
    }
    drawn = steps;
  }

  function addCity(x, y) {
    if (cities.length >= LIMITS.tspCities) { toast(`At most ${LIMITS.tspCities} cities.`, 'info'); return false; }
    cities.push({ x, y });
    return true;
  }

  async function run() {
    if (cities.length < 2) return toast('Place at least 2 cities on the canvas.');
    await withBusy($('tsp-solve-btn'), 'Solving…', async () => {
      try {
        const d = await postJSON('/api/tsp', { cities });
        tour = d.tour;
        $('tsp-dist').textContent   = d.distance.toFixed(1);
        $('tsp-method').textContent = d.optimal ? 'Exact' : 'Heuristic';
        const note = d.optimal
          ? 'guaranteed optimal'
          : `heuristic — ${cities.length} cities is above the exact limit of ${LIMITS.tspExact}, so the tour is near-optimal but not guaranteed`;
        showBanner('tsp-banner', `Tour distance <strong>${d.distance.toFixed(1)}</strong> via ${escapeHTML(d.method)} (${note}).`, 'success');
        animateTour();
      } catch (e) {
        showBanner('tsp-banner', '' + escapeHTML(e.message), 'error');
      }
    });
  }

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    if (addCity(Math.round(e.clientX - rect.left), Math.round(e.clientY - rect.top))) { resetResult(); draw(); }
  });

  $('tsp-parse-btn').addEventListener('click', () => {
    const pts = $('tsp-coord-input').value.split(';').filter(s => s.trim()).map(s => {
      const [x, y] = s.split(',').map(v => Number(v.trim()));
      return { x, y };
    }).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (!pts.length) return toast('No valid coordinates found. Use the format x,y; x,y');
    const remaining = LIMITS.tspCities - cities.length;
    if (pts.length > remaining) toast(`Only ${remaining} more cities fit (max ${LIMITS.tspCities}).`, 'info');
    pts.slice(0, Math.max(0, remaining)).forEach(p => cities.push(p));
    resetResult();
    draw();
  });

  $('tsp-random-btn').addEventListener('click', () => {
    const n = Number($('tsp-random-n').value);
    const W = canvas.clientWidth, H = canvas.clientHeight, m = 24;
    cities = Array.from({ length: n }, () => ({ x: randInt(m, W - m), y: randInt(m, H - m) }));
    resetResult();
    draw();
  });

  $('tsp-clear-btn').addEventListener('click', () => { cities = []; resetResult(); draw(); });
  $('tsp-undo-btn').addEventListener('click', () => { cities.pop(); resetResult(); draw(); });
  $('tsp-solve-btn').addEventListener('click', run);

  registerView('tsp', { run, redraw: draw, onShow: draw });
})();
