/* Sudoku — editable 9x9 grid, MRV backtracking on the server, animated fill. */
(() => {
  const PRESETS = {
    easy: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
    // Arto Inkala's "world's hardest Sudoku" (2012)
    inkala: '800000000003600000070090200050007000000045700000100030001000068008500010090000400',
    // "Platinum Blonde" — notoriously slow for naive left-to-right backtracking
    platinum: '000000012000000003002300400001800005060070800000009000008500000900040500470006000',
  };

  const grid = $('sudoku-grid');
  const inputs = [];
  let animToken = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.inputMode = 'numeric';
      inp.maxLength = 1;
      inp.className = 'sudoku-cell';
      inp.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}`);
      if (c % 3 === 2 && c < 8) inp.classList.add('box-right');
      if (r % 3 === 2 && r < 8) inp.classList.add('box-bottom');
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/[^1-9]/g, '');
        inp.classList.remove('solved');
        markConflicts();
      });
      inp.addEventListener('keydown', e => {
        const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
        if (moves[e.key]) {
          e.preventDefault();
          const [dr, dc] = moves[e.key];
          inputs[((r + dr + 9) % 9) * 9 + ((c + dc + 9) % 9)].focus();
        } else if (e.key === 'Backspace' && !inp.value && c > 0) {
          inputs[r * 9 + c - 1].focus();
        }
      });
      grid.appendChild(inp);
      inputs.push(inp);
    }
  }

  const readBoard = () => Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => Number(inputs[r * 9 + c].value) || 0));

  // Highlight duplicate digits in a row, column or box before sending.
  function markConflicts() {
    const b = readBoard();
    let any = false;
    inputs.forEach(i => i.classList.remove('conflict'));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = b[r][c];
        if (!v) continue;
        for (let k = 0; k < 9; k++) {
          const br = Math.floor(r / 3) * 3 + Math.floor(k / 3);
          const bc = Math.floor(c / 3) * 3 + (k % 3);
          if ((k !== c && b[r][k] === v) || (k !== r && b[k][c] === v) || ((br !== r || bc !== c) && b[br][bc] === v)) {
            inputs[r * 9 + c].classList.add('conflict');
            any = true;
          }
        }
      }
    }
    return any;
  }

  function load(str) {
    animToken++;
    inputs.forEach((inp, i) => {
      inp.value = str[i] === '0' ? '' : str[i];
      inp.classList.remove('solved', 'conflict', 'given');
      inp.readOnly = false;
    });
    ['sudoku-givens', 'sudoku-nodes', 'sudoku-backtracks'].forEach(id => { $(id).textContent = '—'; });
    hideBanner('sudoku-banner');
  }

  async function run() {
    if (markConflicts()) return toast('Some given digits conflict (highlighted in red). Fix them first.');
    const board = readBoard();
    await withBusy($('sudoku-solve-btn'), 'Solving…', async () => {
      try {
        const d = await postJSON('/api/sudoku', { board });
        $('sudoku-givens').textContent = d.givens;
        $('sudoku-nodes').textContent = d.nodes.toLocaleString();
        $('sudoku-backtracks').textContent = d.backtracks.toLocaleString();
        inputs.forEach((inp, i) => { if (inp.value) inp.classList.add('given'); });
        showBanner('sudoku-banner', `✅ Solved: filled ${d.fill_order.length} cells after exploring ${d.nodes.toLocaleString()} search nodes with ${d.backtracks.toLocaleString()} backtracks.`, 'success');
        await animate(d);
      } catch (e) {
        showBanner('sudoku-banner', '❌ ' + escapeHTML(e.message), 'error');
      }
    });
  }

  async function animate(d) {
    const token = ++animToken;
    const delay = prefersReducedMotion() ? 0 : Number($('sudoku-speed').value);
    for (const [r, c] of d.fill_order) {
      if (token !== animToken) return;
      const inp = inputs[r * 9 + c];
      inp.value = d.solved_board[r][c];
      inp.classList.add('solved');
      if (delay) await sleep(delay);
    }
  }

  $('sudoku-solve-btn').addEventListener('click', run);
  $('sudoku-clear-btn').addEventListener('click', () => load('0'.repeat(81)));
  $('sudoku-preset').addEventListener('change', e => { if (PRESETS[e.target.value]) load(PRESETS[e.target.value]); });
  $('sudoku-reset-btn').addEventListener('click', () => {
    // Keep the puzzle, remove the solver's digits.
    animToken++;
    inputs.forEach(inp => { if (inp.classList.contains('solved')) inp.value = ''; inp.classList.remove('solved', 'given'); });
  });

  load(PRESETS.easy);
  registerView('sudoku', { run });
})();
