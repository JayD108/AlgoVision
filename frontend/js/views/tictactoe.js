/* Tic-Tac-Toe vs a minimax AI with alpha-beta pruning. */
(() => {
  const boardEl = $('ttt-board');
  const cells = [];
  let board, human, ai, busy = false, over = false, lastScores = [];
  const score = (() => {
    try { return JSON.parse(storageGet('algovision-ttt') || '') || { win: 0, loss: 0, draw: 0 }; } catch { return { win: 0, loss: 0, draw: 0 }; }
  })();

  for (let i = 0; i < 9; i++) {
    const b = document.createElement('button');
    b.className = 'ttt-cell';
    b.type = 'button';
    b.setAttribute('aria-label', `Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}`);
    b.addEventListener('click', () => humanMove(Math.floor(i / 3), i % 3));
    boardEl.appendChild(b);
    cells.push(b);
  }

  function render(line = null) {
    const showEval = $('ttt-eval').checked;
    const scoreAt = {};
    lastScores.forEach(s => { scoreAt[`${s.row},${s.col}`] = s.score; });
    const win = new Set((line || []).map(([r, c]) => `${r},${c}`));
    cells.forEach((b, i) => {
      const r = Math.floor(i / 3), c = i % 3, v = board[r][c];
      b.className = `ttt-cell ${v ? 'mark-' + v.toLowerCase() : ''} ${win.has(`${r},${c}`) ? 'win' : ''}`;
      b.disabled = !!v || over || busy;
      b.innerHTML = '';
      if (v) {
        b.textContent = v;
      } else if (showEval && scoreAt[`${r},${c}`] !== undefined) {
        const s = scoreAt[`${r},${c}`];
        const span = document.createElement('span');
        span.className = `ttt-score ${s > 0 ? 'good' : s < 0 ? 'bad' : ''}`;
        span.textContent = s > 0 ? `+${s}` : s;
        span.title = 'AI score for playing here (its perspective): positive = AI wins, 0 = draw, negative = AI loses';
        b.appendChild(span);
      }
    });
    $('ttt-wins').textContent = score.win;
    $('ttt-losses').textContent = score.loss;
    $('ttt-draws').textContent = score.draw;
  }

  function finish(winner, line) {
    over = true;
    if (winner === human) { score.win++; showBanner('ttt-banner', 'You won! (That should not be possible against perfect play…)', 'success'); }
    else if (winner === ai) { score.loss++; showBanner('ttt-banner', 'The AI wins. Minimax never misses a forced win.', 'error'); }
    else { score.draw++; showBanner('ttt-banner', 'Draw — the best possible result against perfect play.', 'info'); }
    storageSet('algovision-ttt', JSON.stringify(score));
    render(line);
  }

  async function aiMove() {
    busy = true;
    render();
    $('ttt-status').textContent = 'AI is thinking…';
    try {
      const d = await postJSON('/api/tictactoe', { board, ai });
      board = d.board;
      lastScores = d.scores;
      $('ttt-nodes').textContent = d.nodes.toLocaleString();
      $('ttt-pruned').textContent = d.pruned.toLocaleString();
      busy = false;
      if (d.game_over) return finish(d.winner, d.line);
      $('ttt-status').textContent = `Your turn (${human}).`;
      render();
    } catch (e) {
      busy = false;
      $('ttt-status').textContent = 'Error — start a new game.';
      showBanner('ttt-banner', '' + escapeHTML(e.message), 'error');
      render();
    }
  }

  function localWinner() {
    const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const f = board.flat();
    for (const l of L) if (f[l[0]] && f[l[0]] === f[l[1]] && f[l[1]] === f[l[2]]) return { w: f[l[0]], line: l.map(i => [Math.floor(i / 3), i % 3]) };
    return f.every(Boolean) ? { w: null, line: null } : null;
  }

  function humanMove(r, c) {
    if (busy || over || board[r][c]) return;
    board[r][c] = human;
    lastScores = [];
    const end = localWinner();
    if (end) return finish(end.w, end.line);
    aiMove();
  }

  function newGame() {
    human = $('ttt-side').value;
    ai = human === 'X' ? 'O' : 'X';
    board = [['', '', ''], ['', '', ''], ['', '', '']];
    over = false;
    lastScores = [];
    hideBanner('ttt-banner');
    $('ttt-nodes').textContent = '—';
    $('ttt-pruned').textContent = '—';
    $('ttt-status').textContent = human === 'X' ? 'Your turn (X moves first).' : 'AI plays X and moves first.';
    render();
    if (ai === 'X') aiMove();
  }

  $('ttt-new-btn').addEventListener('click', newGame);
  $('ttt-side').addEventListener('change', newGame);
  $('ttt-eval').addEventListener('change', () => render(over ? localWinner()?.line : null));
  $('ttt-reset-score').addEventListener('click', () => {
    score.win = score.loss = score.draw = 0;
    storageSet('algovision-ttt', JSON.stringify(score));
    render(over ? localWinner()?.line : null);
  });

  newGame();
  registerView('tictactoe', { run: newGame });
})();
