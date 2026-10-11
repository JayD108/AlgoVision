/* Huffman Coding — greedy prefix codes, with the tree drawn as SVG. */
(() => {
  const SPECIAL = { 'SPACE': '␣', ' ': '␣', '\n': '↵', '\t': '⇥', '\r': '␍' };
  const SPECIAL_NAMES = { 'SPACE': '␣ space', '\n': '↵ newline', '\t': '⇥ tab', '\r': '␍ return' };

  async function run() {
    const text = $('huf-text').value;
    if (!text.trim()) return toast('Enter some text to compress.');
    if (text.length > LIMITS.huffmanChars) return toast(`Text is limited to ${LIMITS.huffmanChars} characters.`);

    await withBusy($('huf-compress-btn'), 'Compressing…', async () => {
      try {
        render(await postJSON('/api/huffman', { text }));
      } catch (e) {
        toast('Huffman: ' + e.message);
      }
    });
  }

  function render(d) {
    $('huf-orig-bits').textContent = d.original_bits.toLocaleString();
    $('huf-comp-bits').textContent = d.compressed_bits.toLocaleString();
    $('huf-ratio').textContent     = d.compression_ratio.toFixed(1) + '%';
    $('huf-avg').textContent       = d.avg_bits.toFixed(2);
    $('huf-entropy').textContent   = d.entropy.toFixed(2);
    $('huf-unique').textContent    = d.unique_chars;
    $('huf-stats').hidden = false;

    $('huf-encoded').textContent = d.encoded;
    $('huf-encoded-card').hidden = false;

    const tbody = $('huf-tbody');
    tbody.innerHTML = '';
    d.table.forEach(row => {
      const tr = document.createElement('tr');
      const special = SPECIAL_NAMES[row.char];
      cell(tr, special || row.char, special ? 'muted-cell' : '');
      cell(tr, row.freq);
      cell(tr, row.code, 'code-cell');
      cell(tr, row.bits);
      tbody.appendChild(tr);
    });
    $('huf-table-card').hidden = false;

    drawTree(d.tree, d.unique_chars);
  }

  // Layout: leaves are spaced evenly left-to-right, parents sit centred
  // over their children, depth sets the y position.
  function drawTree(tree, uniqueChars) {
    const host = $('huf-tree');
    host.innerHTML = '';
    $('huf-tree-card').hidden = false;
    if (!tree) {
      host.innerHTML = `<p class="placeholder">The tree has ${uniqueChars} leaves — too many to draw clearly. Try shorter text.</p>`;
      return;
    }

    const XS = 44, YS = 62, R = 16, PAD = 28;
    let leafIndex = 0, maxDepth = 0;
    const nodes = [], edges = [];

    (function layout(node, depth) {
      maxDepth = Math.max(maxDepth, depth);
      let x;
      if (node.char !== null) {
        x = PAD + leafIndex++ * XS;
      } else {
        const l = layout(node.left, depth + 1);
        const r = layout(node.right, depth + 1);
        x = (l.x + r.x) / 2;
        edges.push({ x1: x, y1: PAD + depth * YS, x2: l.x, y2: l.y, bit: '0' });
        edges.push({ x1: x, y1: PAD + depth * YS, x2: r.x, y2: r.y, bit: '1' });
      }
      const placed = { x, y: PAD + depth * YS, node };
      nodes.push(placed);
      return placed;
    })(tree, 0);

    const W = Math.max(PAD * 2 + (leafIndex - 1) * XS, 200);
    const H = PAD * 2 + maxDepth * YS + 16;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Huffman tree');

    const el = (tag, attrs, text) => {
      const e = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
      if (text !== undefined) e.textContent = text;
      svg.appendChild(e);
      return e;
    };

    edges.forEach(e => {
      el('line', { x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2, class: 'ht-edge' });
      el('text', { x: (e.x1 + e.x2) / 2 + (e.bit === '0' ? -7 : 7), y: (e.y1 + e.y2) / 2, class: 'ht-bit' }, e.bit);
    });
    nodes.forEach(({ x, y, node }) => {
      const leaf = node.char !== null;
      el('circle', { cx: x, cy: y, r: R, class: leaf ? 'ht-leaf' : 'ht-internal' });
      el('text', { x, y: y + 4, class: 'ht-freq' }, node.freq);
      if (leaf) el('text', { x, y: y + R + 14, class: 'ht-char' }, SPECIAL[node.char] || node.char);
    });
    host.appendChild(svg);
  }

  function clear() {
    $('huf-text').value = '';
    ['huf-stats', 'huf-encoded-card', 'huf-table-card', 'huf-tree-card'].forEach(id => { $(id).hidden = true; });
    $('huf-text').focus();
  }

  const SAMPLES = [
    'the quick brown fox jumps over the lazy dog',
    'abracadabra alakazam',
    'mississippi river',
    'to be or not to be that is the question',
    'aaaaaaaabbbbccd',
  ];

  $('huf-compress-btn').addEventListener('click', run);
  $('huf-clear-btn').addEventListener('click', clear);
  $('huf-sample-btn').addEventListener('click', () => {
    const current = $('huf-text').value;
    const options = SAMPLES.filter(s => s !== current);
    $('huf-text').value = options[randInt(0, options.length - 1)];
    run();
  });
  $('huf-text').addEventListener('input', () => {
    $('huf-count').textContent = `${$('huf-text').value.length} / ${LIMITS.huffmanChars}`;
  });

  registerView('huffman', { run });
})();
