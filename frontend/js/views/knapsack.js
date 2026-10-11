/* 0/1 Knapsack — DP table animated row by row, then the backtrack path. */
(() => {
  let animId = 0;

  async function run() {
    const weights  = parseIntList($('ks-weights').value);
    const values   = parseIntList($('ks-values').value);
    const capacity = Number($('ks-capacity').value);

    const bad = x => !Number.isInteger(x) || x < 0;
    if (weights.some(bad) || values.some(bad)) return toast('Weights and values must be non-negative whole numbers.');
    if (weights.length === 0 || weights.length !== values.length) return toast('Weights and values must have the same count.');
    if (weights.length > LIMITS.ksItems) return toast(`At most ${LIMITS.ksItems} items are supported.`);
    if (weights.some(w => w > LIMITS.ksCapacity)) return toast(`Each weight must be at most ${LIMITS.ksCapacity}.`);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > LIMITS.ksCapacity) {
      return toast(`Capacity must be between 1 and ${LIMITS.ksCapacity}.`);
    }

    await withBusy($('ks-solve-btn'), 'Solving…', async () => {
      try {
        const d = await postJSON('/api/knapsack', { weights, values, capacity });
        $('ks-value').textContent  = d.max_value;
        $('ks-weight').textContent = `${d.total_weight}/${capacity}`;
        $('ks-count').textContent  = `${d.selected.length}/${d.n_items}`;
        $('ks-stats').hidden = false;

        const tbody = $('ks-tbody');
        tbody.innerHTML = '';
        d.items.forEach(item => {
          const tr = document.createElement('tr');
          if (item.selected) tr.className = 'row-selected';
          cell(tr, `Item ${item.index + 1}`);
          cell(tr, item.weight);
          cell(tr, item.value);
          cell(tr, item.weight ? (item.value / item.weight).toFixed(2) : '∞');
          cell(tr, item.selected ? 'Taken' : 'Skipped', item.selected ? 'pos-cell strong' : 'muted-cell');
          tbody.appendChild(tr);
        });
        $('ks-items-card').hidden = false;
        animateTable(d);
      } catch (e) {
        toast('Knapsack: ' + e.message);
      }
    });
  }

  function animateTable(d) {
    const container = $('ks-table-container');
    const table = document.createElement('table');
    table.className = 'ks-dp-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    const corner = document.createElement('th');
    corner.textContent = 'Item \\ Cap';
    hr.appendChild(corner);
    for (let w = 0; w <= d.display_cap; w++) {
      const th = document.createElement('th');
      th.textContent = w;
      if (w === d.capacity) th.className = 'ks-cap-col';
      hr.appendChild(th);
    }
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const rows = [];
    for (let i = 0; i <= d.n_items; i++) {
      const tr = document.createElement('tr');
      cell(tr, i === 0 ? 'None' : `Item ${i} (w=${d.items[i - 1].weight}, v=${d.items[i - 1].value})`, 'ks-row-label');
      const cells = [];
      for (let w = 0; w <= d.display_cap; w++) cells.push(cell(tr, '·'));
      tbody.appendChild(tr);
      rows.push(cells);
    }
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
    $('ks-table-note').textContent = d.capacity > d.display_cap
      ? `Showing capacities 0–${d.display_cap} of ${d.capacity}. Chosen items are marked in the row labels.`
      : 'Purple cells improved on the row above (item taken). Green cells trace the backtracking path.';

    const delay = prefersReducedMotion() ? 0 : Number($('ks-speed').value);
    const id = ++animId;   // a newer solve cancels this animation
    let i = 0;
    (function fillNextRow() {
      if (id !== animId || i > d.n_items) return;
      const rowData = d.dp_table[i];
      for (let w = 0; w < rowData.length; w++) {
        rows[i][w].textContent = rowData[w];
        if (i > 0 && rowData[w] !== d.dp_table[i - 1][w]) rows[i][w].classList.add('ks-highlighted');
      }
      if (i === d.n_items) markSelection(d, rows);
      i++;
      if (delay) setTimeout(fillNextRow, delay); else fillNextRow();
    })();
  }

  // The backtrack starts at column = capacity, so it can only be traced when
  // that column is on screen; otherwise mark the chosen items' row labels.
  function markSelection(d, rows) {
    if (d.capacity <= d.display_cap) {
      let w = d.capacity;
      for (let ri = d.n_items; ri >= 1; ri--) {
        if (d.dp_table[ri][w] !== d.dp_table[ri - 1][w]) {
          rows[ri][w].classList.add('ks-selected');
          w -= d.items[ri - 1].weight;
        }
      }
    } else {
      d.selected.forEach(idx => rows[idx + 1][0].previousSibling.classList.add('ks-selected'));
    }
  }

  $('ks-solve-btn').addEventListener('click', run);
  $('ks-random-btn').addEventListener('click', () => {
    const n = randInt(4, 7);
    const w = Array.from({ length: n }, () => randInt(1, 10));
    $('ks-weights').value = w.join(',');
    $('ks-values').value = w.map(x => x + randInt(-1, 8)).map(v => Math.max(1, v)).join(',');
    $('ks-capacity').value = Math.max(5, Math.round(w.reduce((a, b) => a + b, 0) * 0.5));
    run();
  });

  registerView('knapsack', { run });
})();
