/* Stock Profit with at most K transactions — DP, drawn on a canvas chart. */
(() => {
  const canvas = $('stock-chart');
  let last = null;   // { prices, transactions } for redraws

  function draw() {
    const { ctx, W, H } = setupCanvas(canvas);
    if (!W || !H) return;   // view is hidden; onShow redraws
    const P = palette();
    if (!last) {
      ctx.fillStyle = P.text3;
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Run the solver to see the price chart', W / 2, H / 2);
      ctx.textAlign = 'start';
      return;
    }
    const { prices, transactions } = last;
    const pad = { top: 20, right: 20, bottom: 30, left: 48 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;
    const min = Math.min(...prices), max = Math.max(...prices);
    const range = (max - min) || 1;
    const n = prices.length;
    const px = i => pad.left + (i / (n - 1)) * cw;
    const py = v => pad.top + (1 - (v - min) / range) * ch;

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const y = pad.top + (g / 4) * ch;
      ctx.strokeStyle = P.grid;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = P.text3;
      ctx.fillText((max - (g / 4) * range).toFixed(0), 6, y + 4);
    }

    // Holding periods. Transactions use 1-based days; px() takes a 0-based index.
    transactions.forEach(t => {
      ctx.fillStyle = P.green + '1f';
      ctx.fillRect(px(t.buy_day - 1), pad.top, px(t.sell_day - 1) - px(t.buy_day - 1), ch);
    });

    const grad = ctx.createLinearGradient(pad.left, 0, W - pad.right, 0);
    grad.addColorStop(0, P.accent);
    grad.addColorStop(1, P.purple);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    prices.forEach((p, i) => (i === 0 ? ctx.moveTo(px(i), py(p)) : ctx.lineTo(px(i), py(p))));
    ctx.stroke();

    transactions.forEach(t => {
      [[t.buy_day, t.buy_price, P.green], [t.sell_day, t.sell_price, P.red]].forEach(([day, price, color]) => {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(px(day - 1), py(price), 5, 0, Math.PI * 2); ctx.fill();
      });
    });

    ctx.fillStyle = P.text3;
    const every = Math.ceil(n / 12);
    prices.forEach((_, i) => {
      if (i % every === 0 || i === n - 1) ctx.fillText(`D${i + 1}`, px(i) - 8, H - pad.bottom + 18);
    });
  }

  async function run() {
    const prices = parseIntList($('stock-prices').value);
    const k = Number($('stock-k').value);
    if (prices.some(p => !Number.isInteger(p) || p < 0)) return toast('Prices must be non-negative whole numbers.');
    if (prices.length < 2) return toast('Enter at least 2 prices.');
    if (prices.length > LIMITS.stockPrices) return toast(`At most ${LIMITS.stockPrices} prices are supported.`);
    if (!Number.isInteger(k) || k < 1 || k > LIMITS.stockK) return toast(`K must be between 1 and ${LIMITS.stockK}.`);

    await withBusy($('stock-solve-btn'), 'Solving…', async () => {
      try {
        const d = await postJSON('/api/stock', { prices, k });
        $('stock-profit').textContent = '$' + d.max_profit;
        $('stock-trades').textContent = d.transactions.length;
        const tbody = $('stock-tbody');
        tbody.innerHTML = '';
        d.transactions.forEach((t, idx) => {
          const tr = document.createElement('tr');
          cell(tr, idx + 1);
          cell(tr, `Day ${t.buy_day}`);
          cell(tr, `Day ${t.sell_day}`);
          cell(tr, `$${t.buy_price}`, 'pos-cell');
          cell(tr, `$${t.sell_price}`, 'neg-cell');
          cell(tr, `+${t.profit}`, 'amber-cell');
          tbody.appendChild(tr);
        });
        if (!d.transactions.length) {
          const tr = document.createElement('tr');
          cell(tr, 'No profitable trade exists — prices never rise.', 'muted-cell').colSpan = 6;
          tbody.appendChild(tr);
        }
        const used = d.transactions.length;
        showBanner('stock-banner', `✅ Max profit with ≤${k} transactions: <strong>$${d.max_profit}</strong> using ${used} trade${used === 1 ? '' : 's'}.`, 'success');
        last = { prices, transactions: d.transactions };
        draw();
      } catch (e) {
        showBanner('stock-banner', '❌ ' + escapeHTML(e.message), 'error');
      }
    });
  }

  $('stock-solve-btn').addEventListener('click', run);
  $('stock-random-btn').addEventListener('click', () => {
    let p = randInt(20, 60);
    const prices = Array.from({ length: randInt(10, 18) }, () => (p = Math.max(1, p + randInt(-12, 12))));
    $('stock-prices').value = prices.join(',');
    run();
  });

  registerView('stock', { run, redraw: draw, onShow: draw });
})();
