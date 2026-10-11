/* N-Queens — enumerate every solution with backtracking and page through them. */
(() => {
  let solutions = [];
  let index = 0;
  let solvedN = 0;   // N the current solutions were computed for

  // conflict: [[r, c], [r2, c2]] pair of attacking queens to highlight
  function renderBoard(placement, n, conflict = null) {
    const host = $('nq-board-container');
    host.innerHTML = '';
    if (!placement) return;
    const size = Math.max(22, Math.min(Math.floor(((host.clientWidth || 400) - (n - 1) * 2) / n), 52));
    const board = document.createElement('div');
    board.className = 'nq-board';
    board.style.gridTemplateColumns = `repeat(${n}, ${size}px)`;
    board.setAttribute('role', 'img');
    board.setAttribute('aria-label', `Board: queens in columns ${placement.join(', ')}`);
    const bad = new Set((conflict || []).map(([r, c]) => `${r},${c}`));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const sq = document.createElement('div');
        sq.className = `nq-cell ${(r + c) % 2 ? 'dark' : 'light'}`;
        sq.style.width = sq.style.height = `${size}px`;
        sq.style.fontSize = `${Math.round(size * 0.55)}px`;
        if (placement[r] === c) {
          sq.textContent = '♛';
          sq.classList.add(bad.has(`${r},${c}`) ? 'queen-bad' : 'queen');
        }
        board.appendChild(sq);
      }
    }
    host.appendChild(board);
  }

  function showSolution(i) {
    if (!solutions.length) return;
    index = (i + solutions.length) % solutions.length;
    renderBoard(solutions[index], solvedN);
    $('nq-viewing').textContent = `${index + 1} / ${solutions.length}`;
    $('nq-placement').textContent = `[${solutions[index].join(', ')}]`;
  }

  async function run() {
    const n = Number($('nq-n').value);
    if (!Number.isInteger(n) || n < 1 || n > LIMITS.nqueensN) return toast(`N must be 1–${LIMITS.nqueensN}.`);
    await withBusy($('nq-solve-btn'), 'Solving…', async () => {
      try {
        const d = await postJSON('/api/nqueens', { n });
        solutions = d.solutions;
        solvedN = n;
        $('nq-size-stat').textContent = `${n}×${n}`;
        $('nq-total').textContent = solutions.length.toLocaleString();
        if (solutions.length) {
          showSolution(0);
          showBanner('nq-banner', `✅ Found <strong>${solutions.length.toLocaleString()}</strong> solutions for N=${n}. Use ← → keys or the buttons to browse.`, 'success');
        } else {
          renderBoard(null, n);
          $('nq-viewing').textContent = 'None';
          $('nq-placement').textContent = '—';
          showBanner('nq-banner', `❌ No solutions exist for N=${n}.`, 'error');
        }
      } catch (e) {
        showBanner('nq-banner', '❌ ' + escapeHTML(e.message), 'error');
      }
    });
  }

  async function verify() {
    const placement = $('nq-custom').value.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    const n = Number($('nq-n').value);
    if (!placement.length) return toast('Enter a placement first.');
    if (placement.some(x => !Number.isInteger(x))) return toast('Placement must be whole numbers separated by spaces.');
    if (!Number.isInteger(n) || n < 1 || n > LIMITS.nqueensN) return toast(`N must be 1–${LIMITS.nqueensN}.`);
    try {
      const d = await postJSON('/api/nqueens/verify', { placement, n });
      if (d.valid) {
        renderBoard(placement, n);
        showBanner('nq-banner', '✅ Valid placement! All queens are safe.', 'success');
      } else {
        // Draw the board when it is the right shape so the conflict is visible.
        if (placement.length === n && placement.every(c => c >= 0 && c < n)) renderBoard(placement, n, d.conflict);
        showBanner('nq-banner', `❌ Invalid: ${escapeHTML(d.reason)}`, 'error');
      }
    } catch (e) {
      showBanner('nq-banner', '❌ ' + escapeHTML(e.message), 'error');
    }
  }

  $('nq-solve-btn').addEventListener('click', run);
  $('nq-verify-btn').addEventListener('click', verify);
  $('nq-prev-btn').addEventListener('click', () => showSolution(index - 1));
  $('nq-next-btn').addEventListener('click', () => showSolution(index + 1));
  $('nq-random-btn').addEventListener('click', () => showSolution(randInt(0, Math.max(0, solutions.length - 1))));
  document.addEventListener('keydown', e => {
    if (currentView !== 'nqueens' || e.target.matches('input, textarea, select')) return;
    if (e.key === 'ArrowLeft') showSolution(index - 1);
    if (e.key === 'ArrowRight') showSolution(index + 1);
  });

  registerView('nqueens', {
    run,
    redraw: () => solutions.length && showSolution(index),
  });
})();
