"""Unit tests for the pure algorithm modules, checked against brute force where feasible."""
import functools
import itertools
import math
import random

import pytest

from algorithms.hanoi import solve_hanoi
from algorithms.huffman import compress
from algorithms.knapsack import solve_knapsack
from algorithms.nqueens import solve_nqueens, verify_placement
from algorithms.stock_dp import max_profit_k_transactions
from algorithms.tsp_solver import EXACT_LIMIT, MAX_CITIES, solve_tsp

RNG = random.Random(1234)


# ── Huffman ──────────────────────────────────────────────────────────────────

def _decode(encoded: str, table: list) -> str:
    inverse = {row["code"]: (" " if row["char"] == "SPACE" else row["char"]) for row in table}
    out, buf = [], ""
    for bit in encoded:
        buf += bit
        if buf in inverse:
            out.append(inverse[buf])
            buf = ""
    assert buf == ""
    return "".join(out)


@pytest.mark.parametrize("text", ["a", "aaaa", "ab", "the quick brown fox jumps over the lazy dog", "aaabbc\n\t!"])
def test_huffman_roundtrip_and_prefix_free(text):
    r = compress(text)
    codes = [row["code"] for row in r["table"]]
    for a, b in itertools.permutations(codes, 2):
        assert not b.startswith(a)
    assert _decode(r["encoded"], r["table"]) == text
    assert r["compressed_bits"] == sum(row["freq"] * row["bits"] for row in r["table"])


def test_huffman_is_optimal_against_textbook_example():
    # Frequencies a:45 b:13 c:12 d:16 e:9 f:5 → optimal cost 224 bits (CLRS 16.3)
    text = "a" * 45 + "b" * 13 + "c" * 12 + "d" * 16 + "e" * 9 + "f" * 5
    assert compress(text)["compressed_bits"] == 224


def test_huffman_rejects_empty():
    with pytest.raises(ValueError):
        compress("")


# ── Stock DP ─────────────────────────────────────────────────────────────────

def _brute_stock(prices, k):
    n = len(prices)

    @functools.lru_cache(None)
    def f(i, t, holding):
        if i == n:
            return 0
        best = f(i + 1, t, holding)
        if holding:
            best = max(best, prices[i] + f(i + 1, t, False))
        elif t > 0:
            best = max(best, -prices[i] + f(i + 1, t - 1, True))
        return best

    return f(0, k, False)


def test_stock_matches_brute_force():
    for _ in range(500):
        n = RNG.randint(2, 10)
        k = RNG.randint(1, 5)
        prices = [RNG.randint(0, 30) for _ in range(n)]
        r = max_profit_k_transactions(prices, k)
        assert r["max_profit"] == _brute_stock(tuple(prices), k)
        txns = r["transactions"]
        assert len(txns) <= k
        assert sum(t["profit"] for t in txns) == r["max_profit"]
        # 1-based days, non-overlapping, chronologically ordered
        last_sell = 0
        for t in txns:
            assert 1 <= t["buy_day"] < t["sell_day"] <= n
            assert t["buy_day"] > last_sell
            assert prices[t["buy_day"] - 1] == t["buy_price"]
            assert prices[t["sell_day"] - 1] == t["sell_price"]
            last_sell = t["sell_day"]


def test_stock_falling_prices_has_no_trades():
    assert max_profit_k_transactions([9, 7, 5, 3], 2) == {"max_profit": 0, "transactions": []}


# ── Knapsack ─────────────────────────────────────────────────────────────────

def test_knapsack_matches_brute_force():
    for _ in range(200):
        n = RNG.randint(1, 8)
        weights = [RNG.randint(0, 12) for _ in range(n)]
        values = [RNG.randint(0, 20) for _ in range(n)]
        cap = RNG.randint(1, 30)
        best = max(
            sum(values[i] for i in combo)
            for r in range(n + 1)
            for combo in itertools.combinations(range(n), r)
            if sum(weights[i] for i in combo) <= cap
        )
        res = solve_knapsack(weights, values, cap)
        assert res["max_value"] == best
        assert sum(values[i] for i in res["selected"]) == best
        assert res["total_weight"] <= cap
        assert len(res["dp_table"]) == n + 1
        assert len(res["dp_table"][0]) == min(cap, 50) + 1


@pytest.mark.parametrize("weights,values,cap", [([-1], [5], 5), ([1], [-5], 5), ([1, 2], [3], 5), ([], [], 5)])
def test_knapsack_rejects_bad_input(weights, values, cap):
    with pytest.raises(ValueError):
        solve_knapsack(weights, values, cap)


# ── TSP ──────────────────────────────────────────────────────────────────────

def _brute_tsp(pts):
    n = len(pts)
    best = math.inf
    for perm in itertools.permutations(range(1, n)):
        tour = (0,) + perm + (0,)
        best = min(best, sum(math.dist(pts[tour[i]], pts[tour[i + 1]]) for i in range(n)))
    return best


def _check_tour(tour, n):
    assert tour[0] == tour[-1] == 0
    assert sorted(tour[:-1]) == list(range(n))


def test_tsp_exact_matches_brute_force():
    for n in range(3, 8):
        pts = [(RNG.uniform(0, 800), RNG.uniform(0, 400)) for _ in range(n)]
        r = solve_tsp(pts)
        assert r["method"] == "held-karp" and r["optimal"]
        _check_tour(r["tour"], n)
        assert r["distance"] == pytest.approx(_brute_tsp(pts), abs=0.01)


def test_tsp_heuristic_for_large_inputs():
    n = MAX_CITIES
    pts = [(RNG.uniform(0, 800), RNG.uniform(0, 400)) for _ in range(n)]
    r = solve_tsp(pts)
    assert not r["optimal"]
    _check_tour(r["tour"], n)
    length = sum(math.dist(pts[r["tour"][i]], pts[r["tour"][i + 1]]) for i in range(n))
    assert r["distance"] == pytest.approx(length, abs=0.01)


def test_tsp_switches_method_at_limit():
    pts = [(RNG.uniform(0, 800), RNG.uniform(0, 400)) for _ in range(EXACT_LIMIT + 1)]
    assert solve_tsp(pts[:EXACT_LIMIT])["optimal"]
    assert not solve_tsp(pts)["optimal"]


def test_tsp_rejects_too_many_cities():
    with pytest.raises(ValueError):
        solve_tsp([(i, i) for i in range(MAX_CITIES + 1)])


# ── N-Queens ─────────────────────────────────────────────────────────────────

KNOWN_COUNTS = [1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2680, 14200]


@pytest.mark.parametrize("n", range(1, 13))
def test_nqueens_counts_and_validity(n):
    r = solve_nqueens(n)
    assert r["total_solutions"] == KNOWN_COUNTS[n - 1]
    assert len(set(map(tuple, r["solutions"]))) == len(r["solutions"])
    for s in r["solutions"][:50]:
        assert verify_placement(s, n)["valid"]


def test_nqueens_verify_reports_conflicts():
    assert not verify_placement([0, 1, 2, 3], 4)["valid"]
    assert not verify_placement([0, 2], 4)["valid"]
    assert not verify_placement([0, 9, 1, 3], 4)["valid"]
    assert verify_placement([1, 3, 0, 2], 4)["valid"]


# ── Hanoi ────────────────────────────────────────────────────────────────────

@pytest.mark.parametrize("n", [1, 3, 7, 10])
def test_hanoi_moves_are_legal_and_minimal(n):
    r = solve_hanoi(n)
    assert len(r["moves"]) == r["total_moves"] == 2 ** n - 1
    pegs = {"A": list(range(n, 0, -1)), "B": [], "C": []}
    for m in r["moves"]:
        disk = pegs[m["from"]].pop()
        assert disk == m["disk"]
        assert not pegs[m["to"]] or pegs[m["to"]][-1] > disk
        pegs[m["to"]].append(disk)
    assert pegs["C"] == list(range(n, 0, -1))
