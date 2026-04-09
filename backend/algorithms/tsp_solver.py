"""
tsp_solver.py — NP-Hard Optimization: Held-Karp TSP
"""
import math
from typing import List, Tuple


def _dist(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])


def solve_tsp(cities: List[Tuple[float, float]]) -> dict:
    n = len(cities)
    if n < 2:
        return {"tour": list(range(n)), "distance": 0.0, "method": "trivial"}
    if n == 2:
        d = _dist(cities[0], cities[1])
        return {"tour": [0, 1, 0], "distance": round(d * 2, 2), "method": "trivial"}

    # Build distance matrix
    dist = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            dist[i][j] = _dist(cities[i], cities[j])

    # Held-Karp — works well up to ~20 cities
    INF = float("inf")
    FULL = (1 << n) - 1

    # dp[mask][i] = min cost to visit nodes in mask, ending at i, starting from 0
    dp = [[INF] * n for _ in range(1 << n)]
    parent = [[-1] * n for _ in range(1 << n)]

    dp[1][0] = 0.0

    for mask in range(1, 1 << n):
        if not (mask & 1):  # must include start node 0
            continue
        for u in range(n):
            if not (mask >> u & 1):
                continue
            if dp[mask][u] == INF:
                continue
            for v in range(n):
                if mask >> v & 1:
                    continue
                nmask = mask | (1 << v)
                new_cost = dp[mask][u] + dist[u][v]
                if new_cost < dp[nmask][v]:
                    dp[nmask][v] = new_cost
                    parent[nmask][v] = u

    # Find best last node
    best = INF
    last = -1
    for u in range(1, n):
        cost = dp[FULL][u] + dist[u][0]
        if cost < best:
            best = cost
            last = u

    # Reconstruct tour
    tour = []
    mask = FULL
    cur = last
    while cur != -1:
        tour.append(cur)
        prev = parent[mask][cur]
        mask ^= (1 << cur)
        cur = prev
    tour.reverse()
    tour.append(tour[0])  # return to start

    return {
        "tour": tour,
        "distance": round(best, 2),
        "method": "held-karp",
        "cities": [{"x": c[0], "y": c[1]} for c in cities],
    }
