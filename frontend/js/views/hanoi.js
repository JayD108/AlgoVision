/* Tower of Hanoi — recursive move list animated with play/pause/step. */
(() => {
  const canvas = $('hanoi-canvas');
  let moves = [];
  let step = 0;
  let n = 4;
  let pegs = { A: [4, 3, 2, 1], B: [], C: [] };
  let timer = null;
  let lastMove = null;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    const { ctx, W, H } = setupCanvas(canvas);
    if (!W || !H) return;   // view is hidden; onShow redraws
    const P = palette();
    const baseY = H - 34;
    const maxDiskW = W / 3 - 24;
    const diskH = Math.min(24, (baseY - 60) / (n + 1));

    ctx.fillStyle = P.grid;
    ctx.fillRect(16, baseY, W - 32, 4);

    ['A', 'B', 'C'].forEach((peg, idx) => {
      const cx = (W / 3) * idx + W / 6;
      ctx.fillStyle = P.grid;
      ctx.fillRect(cx - 1.5, 50, 3, baseY - 50);
      ctx.font = '500 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = lastMove && lastMove.to === peg ? P.text : P.text3;
      ctx.fillText(`Peg ${peg}`, cx, baseY + 22);

      pegs[peg].forEach((disk, level) => {
        const w = maxDiskW * (0.3 + 0.7 * (disk / n));
        const y = baseY - diskH * (level + 1);
        // One accent colour, darker for larger disks; the last-moved disk is solid.
        const moved = lastMove && lastMove.disk === disk;
        ctx.fillStyle = P.accent;
        ctx.globalAlpha = moved ? 1 : 0.25 + 0.5 * (disk / n);
        roundRect(ctx, cx - w / 2, y, w, diskH - 3, Math.min(5, diskH / 2));
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = moved ? '#fff' : P.text;
        ctx.font = `500 ${Math.max(9, Math.round(diskH * 0.45))}px "JetBrains Mono", monospace`;
        ctx.textBaseline = 'middle';
        ctx.fillText(disk, cx, y + diskH / 2 - 1);
        ctx.textBaseline = 'alphabetic';
      });
    });
    ctx.textAlign = 'start';
  }

  function resetPegs() {
    pegs = { A: Array.from({ length: n }, (_, i) => n - i), B: [], C: [] };
    step = 0;
    lastMove = null;
  }

  function updateStatus() {
    $('hanoi-current').textContent = moves.length ? `${step}/${moves.length}` : '—';
    $('hanoi-progress').style.width = moves.length ? `${(100 * step) / moves.length}%` : '0%';
    $('hanoi-play-btn').disabled = !moves.length || step >= moves.length;
    $('hanoi-step-btn').disabled = !moves.length || step >= moves.length || !!timer;
    $('hanoi-play-btn').textContent = timer ? 'Pause' : (step ? 'Resume' : 'Play');
  }

  function applyNext() {
    if (step >= moves.length) return pause();
    const move = moves[step];
    pegs[move.to].push(pegs[move.from].pop());
    lastMove = move;
    step++;

    const log = $('hanoi-log');
    log.querySelector('.hanoi-current-move')?.classList.remove('hanoi-current-move');
    const entry = document.createElement('div');
    entry.className = 'hanoi-log-entry hanoi-current-move';
    entry.textContent = `Move ${step}: disk ${move.disk}  ${move.from} → ${move.to}`;
    log.prepend(entry);

    draw();

    if (step >= moves.length) {
      pause();
      showBanner('hanoi-banner', `Done! Moved ${n} disks in exactly ${moves.length} moves (2ⁿ−1).`, 'success');
    }
    updateStatus();
  }

  function play() {
    if (timer || step >= moves.length) return;
    timer = setInterval(applyNext, Number($('hanoi-speed').value));
    updateStatus();
  }

  function pause() {
    clearInterval(timer);
    timer = null;
    updateStatus();
  }

  async function run() {
    const val = Number($('hanoi-n').value);
    if (!Number.isInteger(val) || val < 1 || val > LIMITS.hanoiN) return toast(`N must be 1–${LIMITS.hanoiN}.`);
    pause();
    await withBusy($('hanoi-solve-btn'), 'Solving…', async () => {
      try {
        const d = await postJSON('/api/hanoi', { n: val });
        moves = d.moves;
        n = val;
        resetPegs();
        $('hanoi-disks-stat').textContent = n;
        $('hanoi-total').textContent = d.total_moves;
        $('hanoi-log').innerHTML = '';
        showBanner('hanoi-banner', `${d.total_moves} moves for ${n} disks (2ⁿ−1 = ${d.total_moves}).`, 'info');
        draw();
        updateStatus();
        play();
      } catch (e) {
        showBanner('hanoi-banner', '' + escapeHTML(e.message), 'error');
      }
    });
  }

  function reset() {
    pause();
    resetPegs();
    $('hanoi-log').innerHTML = '';
    hideBanner('hanoi-banner');
    draw();
    updateStatus();
  }

  $('hanoi-solve-btn').addEventListener('click', run);
  $('hanoi-play-btn').addEventListener('click', () => (timer ? pause() : play()));
  $('hanoi-step-btn').addEventListener('click', () => { if (step < moves.length) applyNext(); });
  $('hanoi-reset-btn').addEventListener('click', reset);
  $('hanoi-speed').addEventListener('change', () => { if (timer) { pause(); play(); } });
  $('hanoi-n').addEventListener('change', () => {
    const val = Number($('hanoi-n').value);
    if (Number.isInteger(val) && val >= 1 && val <= LIMITS.hanoiN && !timer) {
      n = val; moves = []; resetPegs();
      $('hanoi-log').innerHTML = '';
      draw(); updateStatus();
    }
  });

  registerView('hanoi', { run, redraw: draw, onShow: () => { draw(); updateStatus(); } });
})();
