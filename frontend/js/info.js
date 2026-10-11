/* AlgoVision — algorithm metadata for the topbar, overview cards and info modal.
   Strings may contain trusted HTML (they are authored here, never user input). */

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
    title:  'TSP Solver',
    sub:    '— Exact Held-Karp DP, 2-opt heuristic for large inputs',
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
      projectContext: `Click on the canvas to place cities (or input coordinates). The backend runs Held-Karp exact DP for up to 15 cities, and for 16–30 cities a nearest-neighbour tour improved by 2-opt (fast and usually optimal or close to it, but not guaranteed). The solution is drawn as an animated route on the canvas with city labels and distance display.`,
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

  sudoku: {
    title:  'Sudoku Solver',
    sub:    '— Backtracking with constraint heuristics',
    badge:  'Backtrack',
    badgeClass: 'tag-bt',
    emoji:  '🔢',
    info: {
      definition: `Sudoku asks you to fill a 9×9 grid so every row, column and 3×3 box contains the digits 1–9 exactly once. It is a classic <strong>constraint satisfaction problem</strong>; generalised to n²×n² grids it is <strong>NP-complete</strong>.`,
      paradigm: `<strong>Backtracking</strong> with the <strong>Minimum Remaining Values (MRV)</strong> heuristic: instead of filling cells left-to-right, always fill the empty cell with the <em>fewest legal digits</em>. Dead ends are found earlier, so the search tree is dramatically smaller — puzzles that take naive backtracking minutes are solved in milliseconds.`,
      steps: [
        'Check that the given digits do not already conflict.',
        'Track which digits are used in each row, column and box as bitmasks.',
        'Pick the empty cell with the fewest candidate digits (MRV).',
        'Try each candidate: place it, update the bitmasks, and recurse.',
        'If a cell has no candidates, undo the last choice (<strong>backtrack</strong>) and try the next one.',
        'When no empty cells remain, the grid is solved.',
      ],
      complexity: { time: 'O(9^m) worst case', space: 'O(m) recursion' },
      realWorld: [
        { icon: '📅', name: 'Scheduling', desc: 'Timetabling and rostering are constraint problems solved with the same propagate-and-backtrack ideas.' },
        { icon: '🧩', name: 'SAT / CSP Solvers', desc: 'MRV is the "fail-first" heuristic used throughout industrial constraint solvers.' },
        { icon: '🔌', name: 'Hardware Verification', desc: 'Chip designs are checked with SAT solvers built on backtracking search with smart variable ordering.' },
        { icon: '🗺️', name: 'Map Colouring', desc: 'Register allocation and frequency assignment are graph-colouring problems solved the same way.' },
      ],
      projectContext: `Type a puzzle or load a preset. The backend validates the givens, solves with MRV backtracking and returns the order in which cells were committed plus how many search nodes and backtracks it needed. The frontend animates the solution filling in.`,
    }
  },

  tictactoe: {
    title:  'Tic-Tac-Toe AI',
    sub:    '— Minimax with alpha-beta pruning',
    badge:  'Game Theory',
    badgeClass: 'tag-game',
    emoji:  '⭕',
    info: {
      definition: `Tic-Tac-Toe is a two-player, zero-sum game with perfect information. <strong>Minimax</strong> finds the optimal move by assuming both players play perfectly: the AI maximises its score while the opponent minimises it. With perfect play from both sides, the game is always a draw.`,
      paradigm: `<strong>Game-tree search</strong>. Minimax explores every possible continuation. <strong>Alpha-beta pruning</strong> skips branches that cannot change the result: once a move is proven worse than an alternative already found, the rest of its subtree is ignored.`,
      steps: [
        'Generate every legal move for the player to move.',
        'Recursively evaluate each resulting position, alternating max (AI) and min (opponent) levels.',
        'Score terminal positions: win = +10 − depth, loss = depth − 10, draw = 0 (prefers faster wins, slower losses).',
        'Track α (best score the maximiser can guarantee) and β (best for the minimiser).',
        'Prune: when β ≤ α, stop exploring that node — the opponent would never allow it.',
        'Play the root move with the highest score.',
      ],
      complexity: { time: 'O(b^d), ~O(b^(d/2)) pruned', space: 'O(d)' },
      realWorld: [
        { icon: '♟️', name: 'Chess Engines', desc: 'Alpha-beta search with move ordering powered chess engines from Deep Blue to Stockfish.' },
        { icon: '🎮', name: 'Game AI', desc: 'Turn-based strategy and board games use minimax variants for computer opponents.' },
        { icon: '📉', name: 'Robust Decisions', desc: 'Minimax decision rules minimise worst-case loss in economics and operations research.' },
        { icon: '🛡️', name: 'Adversarial Planning', desc: 'Security games model attacker/defender interactions as minimax problems.' },
      ],
      projectContext: `Play against the AI. After each of your moves the backend runs minimax with alpha-beta pruning, returns its move, the exact score of every option, and how many positions it searched and pruned. Turn on "Show AI evaluation" to see the scores on the board.`,
    }
  },

  maxflow: {
    title:  'Max Flow',
    sub:    '— Ford-Fulkerson / Edmonds-Karp',
    badge:  'Graph',
    badgeClass: 'tag-graph',
    emoji:  '🌊',
    info: {
      definition: `Given a directed network where each edge has a capacity, the <strong>maximum flow problem</strong> asks how much can be sent from a source <code class="inline">s</code> to a sink <code class="inline">t</code> without exceeding any capacity, while flow into every other node equals flow out. The <strong>max-flow min-cut theorem</strong> says this equals the smallest total capacity of edges whose removal disconnects s from t.`,
      paradigm: `<strong>Iterative improvement on a residual graph</strong>. Ford-Fulkerson repeatedly finds a path with spare capacity and pushes flow along it. <strong>Edmonds-Karp</strong> always picks the <em>shortest</em> such path using BFS, which guarantees polynomial running time.`,
      steps: [
        'Start with zero flow. The residual graph equals the original capacities.',
        'BFS from s to t in the residual graph to find the shortest augmenting path.',
        'The bottleneck (smallest residual capacity on the path) is how much flow can be added.',
        'Push that flow: decrease forward residual capacities, increase reverse ones (so later paths can "undo" flow).',
        'Repeat until no augmenting path exists.',
        'The nodes still reachable from s form the source side of a <strong>minimum cut</strong>.',
      ],
      complexity: { time: 'O(V · E²)', space: 'O(V²)' },
      realWorld: [
        { icon: '🚚', name: 'Logistics', desc: 'Maximum throughput of road, rail and pipeline networks.' },
        { icon: '🌐', name: 'Network Bandwidth', desc: 'Capacity planning and routing in computer networks.' },
        { icon: '🧑‍🤝‍🧑', name: 'Bipartite Matching', desc: 'Assigning jobs to workers or students to schools reduces to max flow.' },
        { icon: '🖼️', name: 'Image Segmentation', desc: 'Graph-cut algorithms separate foreground from background using min cuts.' },
      ],
      projectContext: `Describe a network as an edge list (or pick a preset). The backend runs Edmonds-Karp and returns each augmenting path, the final flow on every edge, and the minimum cut. The canvas shows flow/capacity on each edge, highlights saturated and cut edges, and lets you replay the augmenting paths.`,
    }
  },
};
