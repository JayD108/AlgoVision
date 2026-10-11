"""
tsp_solver.py — NP-Hard Optimization: Travelling Salesman Problem

Small inputs are solved exactly with Held-Karp bitmask DP (O(2^n · n^2)).
Larger inputs fall back to a nearest-neighbour tour improved by 2-opt,
which runs in polynomial time but is not guaranteed optimal.
"""
import math
from typing import List, Tuple

# Held-Karp at n=15 takes ~0.3s and ~40MB in CPython; every extra city
# roughly doubles memory and more than doubles time, so stop here.
EXACT_LIMIT = 15
MAX_CITIES = 30

Point = Tuple[float, float]


def _dist(a: Point, b: Point) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])


def _tour_length(tour: List[int], dist: List[List[float]]) -> float:
    return sum(dist[tour[i]][tour[i + 1]] for i in range(len(tour) - 1))


def _held_karp(n: int, dist: List[List[float]]) -> Tuple[List[int], float]:
    INF = float("inf")
    FULL = (1 << n) - 1

    # dp[mask][i] = min cost to visit nodes in mask, ending at i, starting from 0
    dp = [[INF] * n for _ in range(1 << n)]
    parent = [[-1] * n for _ in range(1 << n)]
    dp[1][0] = 0.0

    for mask in range(1, 1 << n):
        if not (mask & 1):  # must include start node 0
            continue
        row = dp[mask]
        for u in range(n):
            cost_u = row[u]
            if cost_u == INF or not (mask >> u & 1):
                continue
            du = dist[u]
            for v in range(n):
                if mask >> v & 1:
                    continue
                nmask = mask | (1 << v)
                new_cost = cost_u + du[v]
                if new_cost < dp[nmask][v]:
                    dp[nmask][v] = new_cost
                    parent[nmask][v] = u

    best, last = INF, -1
    for u in range(1, n):
        cost = dp[FULL][u] + dist[u][0]
        if cost < best:
            best, last = cost, u

    tour = []
    mask, cur = FULL, last
    while cur != -1:
        tour.append(cur)
        prev = parent[mask][cur]
        mask ^= (1 << cur)
        cur = prev
    tour.reverse()
    tour.append(tour[0])
    return tour, best


def _nearest_neighbour(n: int, dist: List[List[float]], start: int) -> List[int]:
    unvisited = set(range(n))
    unvisited.remove(start)
    tour = [start]
    while unvisited:
        last = tour[-1]
        nxt = min(unvisited, key=lambda v: dist[last][v])
        unvisited.remove(nxt)
        tour.append(nxt)
    tour.append(start)
    return tour


def _two_opt(tour: List[int], dist: List[List[float]]) -> List[int]:
    """Reverse segments while doing so shortens the tour (first-improvement)."""
    n = len(tour) - 1
    improved = True
    while improved:
        improved = False
        for i in range(1, n - 1):
            for j in range(i + 1, n):
                a, b = tour[i - 1], tour[i]
                c, d = tour[j], tour[j + 1]
                if dist[a][c] + dist[b][d] < dist[a][b] + dist[c][d] - 1e-9:
                    tour[i:j + 1] = reversed(tour[i:j + 1])
                    improved = True
    return tour


def _heuristic(n: int, dist: List[List[float]]) -> Tuple[List[int], float]:
    best_tour, best_len = None, float("inf")
    for start in range(n):
        tour = _two_opt(_nearest_neighbour(n, dist, start), dist)
        length = _tour_length(tour, dist)
        if length < best_len:
            best_tour, best_len = tour, length
    # Rotate so the tour starts (and ends) at city 0, like the exact solver.
    k = best_tour.index(0)
    body = best_tour[:-1]
    body = body[k:] + body[:k]
    return body + [0], best_len


def solve_tsp(cities: List[Point]) -> dict:
    n = len(cities)
    if n > MAX_CITIES:
        raise ValueError(f"At most {MAX_CITIES} cities are supported.")
    out_cities = [{"x": c[0], "y": c[1]} for c in cities]
    if n < 2:
        return {"tour": list(range(n)), "distance": 0.0, "method": "trivial",
                "optimal": True, "cities": out_cities}
    if n == 2:
        d = _dist(cities[0], cities[1])
        return {"tour": [0, 1, 0], "distance": round(d * 2, 2), "method": "trivial",
                "optimal": True, "cities": out_cities}

    dist = [[_dist(cities[i], cities[j]) for j in range(n)] for i in range(n)]

    if n <= EXACT_LIMIT:
        tour, best = _held_karp(n, dist)
        method, optimal = "held-karp", True
    else:
        tour, best = _heuristic(n, dist)
        method, optimal = "nearest-neighbour + 2-opt", False

    return {
        "tour": tour,
        "distance": round(best, 2),
        "method": method,
        "optimal": optimal,
        "cities": out_cities,
    }
