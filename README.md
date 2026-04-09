# AlgoVision — DAA Interactive Dashboard ⚡

AlgoVision is an interactive dashboard designed to help you visualize, understand, and experiment with classic **Design and Analysis of Algorithms (DAA)**. 

Instead of just looking at static code, this project bridges the gap between algorithmic theory and visual learning. It features a modern, premium UI combined with a robust Python/FastAPI backend to solve algorithm problems in real-time.

---

## 🌟 Features

- **Rich Visualizations:** See algorithms come to life with animated state changes, dynamic graphs, and custom-built canvases.
- **Interactive Modals:** Every algorithm features an in-depth "Info" panel explaining exactly how it works, its time/space complexity, and real-world software engineering applications.
- **Zero External UI Libraries:** The frontend is built with purely vanilla HTML, CSS, and JS (No React, no Tailwind). 
- **High-Performance Backend:** Python's FastAPI backend efficiently runs the data structures and algorithms, returning JSON payloads that drive the frontend UI.

---

## 🧮 Implemented Algorithms

The platform classifies problems into common algorithmic paradigms:

### 1. Greedy approach
* **Huffman Coding:** A lossless data compression algorithm. Type text and watch the backend construct the Huffman tree, generate optimal prefix codes, and calculate the exact space saved versus standard ASCII.

### 2. Dynamic Programming (DP)
* **Stock Profit (`K` Transactions):** An advanced DP algorithm (LeetCode #188). Given a list of stock prices and a constrained number of total trades, it maps out the absolute optimal buy/sell days to maximize profit.
* **0/1 Knapsack:** The quintessential DP resource allocation problem. Provide item weights/values and watch the bounded DP table animate row-by-row to find the optimal combination of items.

### 3. NP-Hard & Optimization
* **TSP Solver (Held-Karp):** The Travelling Salesman Problem. Click on a canvas to drop cities, and the backend utilizes precise bitmask Dynamic Programming to compute the shortest complete tour.

### 4. Backtracking
* **N-Queens:** Solve the classic puzzle of placing N non-attacking queens on an N×N board. The app recursively finds all valid solutions and allows you to page through them visually.

### 5. Recursion
* **Tower of Hanoi:** A visualization of the elegant divide-and-conquer recursion problem. Configure the number of disks and animation speed to watch the recursion tree unfold physically.

---

## 🏗️ Technology Stack

- **Frontend:** HTML5, Vanilla CSS (Custom modern dark theme), Vanilla JavaScript.
- **Backend:** Python 3, FastAPI, Uvicorn, Pydantic.
- **Design Philosophy:** Built for performance, aesthetics, and educational value.

---

## 🚀 Running Locally

The project includes convenient startup scripts for Windows users.

### Prerequisites
Make sure you have **Python 3.8+** installed and added to your system PATH.

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

Open `frontend/app.js` and change the very first line:
```javascript
// Change this:
const API = 'http://localhost:8080';

// To your deployed backend URL (NO trailing slash):
const API = 'https://algovision-api.onrender.com';
```

### Part 3: Deploying the Frontend
The frontend requires only static hosting (HTML/CSS/JS). Great free options are **Vercel**, **Netlify**, or **GitHub Pages**.

**Using Vercel (Recommended):**
1. Sign up at [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Click **Deploy**. Vercel will give you a live URL where your beautiful web app now lives!

---

## 💡 Developer Notes
The `backend/algorithms/` folder is designed to be easily extensible. To add a new algorithm:
1. Write the logic in a new python file in `backend/algorithms/`.
2. Map it to an endpoint in `backend/main.py`.
3. Register the UI logic and `ALGO_INFO` metadata in `frontend/app.js`.
