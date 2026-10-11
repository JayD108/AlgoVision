# AlgoVision — DAA Interactive Dashboard ⚡

AlgoVision is an interactive dashboard designed to help you visualize, understand, and experiment with classic **Design and Analysis of Algorithms (DAA)**. 

Instead of just looking at static code, this project bridges the gap between algorithmic theory and visual learning. It features a modern, premium UI combined with a robust Python/FastAPI backend to solve algorithm problems in real-time.

---

## 🌟 Features

- **Nine algorithms, nine visualisations:** animated DP tables, a drawn Huffman tree, canvas maps, graphs and boards, all driven by real results from the Python backend.
- **Learn mode:** every algorithm has an in-depth panel covering how it works, time/space complexity and real-world uses.
- **Built for exploring:** random/preset inputs, play / pause / step controls, adjustable animation speed, and live validation that matches the server's limits.
- **Polished UI:** overview page, dark and light themes (follows your OS by default), shareable deep links (`#/tsp`), a mobile slide-out menu, keyboard shortcuts (<kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the current algorithm; ← → browse N-Queens solutions; arrow keys move around the Sudoku grid) and reduced-motion support.
- **Zero UI libraries:** vanilla HTML, CSS and JavaScript — no build step.
- **Safe by default:** every endpoint has input limits sized so no single request can exhaust the server.

---

## 🧮 Implemented Algorithms

| Paradigm | Algorithm | What you can do |
|---|---|---|
| Greedy | **Huffman Coding** | Compress text; see the code table, the Huffman tree, and compression vs. Shannon entropy. |
| Dynamic Programming | **Stock Profit (K transactions)** | Find optimal buy/sell days (LeetCode #188) on a price chart. |
| Dynamic Programming | **0/1 Knapsack** | Watch the DP table fill row by row and the backtracking path light up. |
| NP-Hard | **Travelling Salesman** | Click to place up to 30 cities. Exact Held-Karp bitmask DP up to 15 cities; nearest-neighbour + 2-opt heuristic beyond. |
| Backtracking | **N-Queens** | Enumerate all solutions (bitmask backtracking) and page through them; verify your own placement with conflicts highlighted. |
| Backtracking | **Sudoku** | Solve any puzzle with MRV-ordered backtracking; conflicts are flagged as you type. Includes the "world's hardest" puzzles. |
| Recursion | **Tower of Hanoi** | Animate the 2ⁿ−1 moves with play, pause and single-step. |
| Graphs | **Max Flow (Edmonds-Karp)** | Edit a network, see flow/capacity on every edge, replay augmenting paths, and see the minimum cut. |
| Game Theory | **Tic-Tac-Toe AI** | Play against minimax with alpha-beta pruning; optionally show the AI's score for every move. |

---

## 🏗️ Technology Stack

- **Frontend:** HTML5, Vanilla CSS (Custom modern dark theme), Vanilla JavaScript.
- **Backend:** Python 3, FastAPI, Uvicorn, Pydantic.
- **Design Philosophy:** Built for performance, aesthetics, and educational value.

---

## 🚀 Running Locally

The project includes convenient startup scripts for Windows users.

### Prerequisites
Make sure you have **Python 3.12+** installed and added to your system PATH.

### 1. Using the Start Script
Double-click `start.bat` or run it from a terminal:
```bash
.\start.bat
```
*This script automatically:*
1. Installs necessary backend dependencies (`fastapi`, `uvicorn`, `pydantic`).
2. Boots up the FastAPI server on `http://localhost:8080`.
3. Starts a python local web server for the frontend on `http://localhost:5500`.
4. Opens your default web browser to the dashboard.

### 2. Stopping the Servers
To cleanly shut down the backend and frontend, run the provided PowerShell script:
```powershell
.\stop.ps1
```

---

## 🧪 Running Tests

```bash
pip install -r requirements-dev.txt
pytest          # algorithm correctness (brute-force cross-checks) + API validation
ruff check .    # lint
```

---

## 🚢 Deployment Guide

To put this project on the internet, you need to deploy the frontend and the backend separately.

### Part 1: Deploying the Backend (FastAPI)
You need a hosting provider that supports Python apps. Great free/cheap options include **Render**, **Railway**, or **PythonAnywhere**.

**Using Render (Recommended):**
1. Push your project to a GitHub repository.
2. Sign up at [Render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repo.
4. Set the Root Directory to `backend`.
5. Set the Build Command to: `pip install -r ../requirements.txt` (Make sure your `requirements.txt` includes `fastapi` and `uvicorn`).
6. Set the Start Command to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Render will provide you with a URL (e.g., `https://algovision-api.onrender.com`). *Copy this URL.*

### Part 2: Preparing the Frontend
Before deploying the frontend, you must tell it to talk to your *newly deployed backend* instead of your local machine.

Open `frontend/js/core.js` and set `PROD_API` to your deployed backend URL (no trailing slash):
```javascript
const PROD_API = 'https://algovision-api.onrender.com';
```
When the page is opened from `localhost`, the frontend automatically uses `http://localhost:8080` instead, so local development needs no edits.

**Optional – restrict CORS:** on Render, set the environment variable `ALLOWED_ORIGINS` to your frontend URL (e.g. `https://algovision.vercel.app`). Multiple origins are comma-separated. If unset, all origins are allowed.

### Part 3: Deploying the Frontend
The frontend requires only static hosting (HTML/CSS/JS). Great free options are **Vercel**, **Netlify**, or **GitHub Pages**.

**Using Vercel (Recommended):**
1. Sign up at [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Click **Deploy**. Vercel will give you a live URL where your beautiful web app now lives!

---

## 💡 Developer Notes

```
backend/
  main.py                 FastAPI app: request models (input limits), routes
  algorithms/*.py         one pure module per algorithm
frontend/
  index.html              layout + markup for every view
  styles.css              design tokens (dark/light) and components
  js/info.js              ALGO_INFO: titles, badges, Learn-panel content
  js/core.js              API client, LIMITS, NAV, routing, theme, modal, helpers
  js/views/*.js           one file per view; each calls registerView()
tests/                    pytest: brute-force cross-checks + API validation
```

To add a new algorithm:
1. Write the logic in a new module in `backend/algorithms/` and add tests in `tests/`.
2. Add a Pydantic request model with sensible limits and a route in `backend/main.py`.
3. Add its metadata to `ALGO_INFO` (`js/info.js`), an entry to `NAV` and any limits to `LIMITS` (`js/core.js`).
4. Add a `<section id="view-<id>" class="view" hidden>` to `index.html` and a `js/views/<id>.js` that calls `registerView('<id>', { run, redraw, onShow })`.
