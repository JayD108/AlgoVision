"""Tests for Sudoku, Tic-Tac-Toe minimax, max flow, and Huffman tree output."""
import itertools
import random

import pytest

from algorithms.huffman import MAX_TREE_LEAVES, compress
from algorithms.minimax import _is_full, _winner, best_move
from algorithms.network_flow import max_flow
from algorithms.sudoku import solve

EASY = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0], [6, 0, 0, 1, 9, 5, 0, 0, 0], [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3], [4, 0, 0, 8, 0, 3, 0, 0, 1], [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0], [0, 0, 0, 4, 1, 9, 0, 0, 5], [0, 0, 0, 0, 8, 0, 0, 7, 9],
]
# "Platinum Blonde" — one of the hardest known puzzles for naive backtracking.
HARD = [
    [0, 0, 0, 0, 0, 0, 0, 1, 2], [0, 0, 0, 0, 0, 0, 0, 0, 3], [0, 0, 2, 3, 0, 0, 4, 0, 0],
    [0, 0, 1, 8, 0, 0, 0, 0, 5], [0, 6, 0, 0, 7, 0, 8, 0, 0], [0, 0, 0, 0, 0, 9, 0, 0, 0],
    [0, 0, 8, 5, 0, 0, 0, 0, 0], [9, 0, 0, 0, 4, 0, 5, 0, 0], [4, 7, 0, 0, 0, 6, 0, 0, 0],
]


def _is_valid_solution(grid, givens):
    full = set(range(1, 10))
    for i in range(9):
        assert set(grid[i]) == full
        assert {grid[r][i] for r in range(9)} == full
        br, bc = (i // 3) * 3, (i % 3) * 3
        assert {grid[r][c] for r in range(br, br + 3) for c in range(bc, bc + 3)} == full
    for r, c in itertools.product(range(9), range(9)):
        if givens[r][c]:
            assert grid[r][c] == givens[r][c]


@pytest.mark.parametrize("puzzle", [EASY, HARD, [[0] * 9 for _ in range(9)]])
def test_sudoku_solves(puzzle):
    r = solve(puzzle)
    _is_valid_solution(r["solved_board"], puzzle)
    empties = sum(v == 0 for row in puzzle for v in row)
    assert len(r["fill_order"]) == empties
    assert len({tuple(p) for p in r["fill_order"]}) == empties


def test_sudoku_does_not_mutate_input():
    copy = [row[:] for row in EASY]
    solve(EASY)
    assert EASY == copy


@pytest.mark.parametrize("mutate,msg", [
    (lambda b: b[0].__setitem__(2, 5), "row 1"),          # 5 already in row 1
    (lambda b: b[2].__setitem__(0, 5), "column 1"),       # 5 already in column 1
    (lambda b: b[2].__setitem__(0, 3), "box 1"),          # 3 already in box 1 only
])
def test_sudoku_rejects_conflicting_givens(mutate, msg):
    b = [row[:] for row in EASY]
    mutate(b)
    with pytest.raises(ValueError, match=msg):
        solve(b)


def test_sudoku_unsolvable():
    b = [[0] * 9 for _ in range(9)]
    b[0][:8] = [1, 2, 3, 4, 5, 6, 7, 8]
    b[1][8] = 9   # cell (0,8) can only be 9, but 9 is in its column
    with pytest.raises(ValueError):
        solve(b)


# ── Tic-Tac-Toe ──────────────────────────────────────────────────────────────

E = ""


def test_ai_takes_immediate_win():
    board = [["O", "O", E], ["X", "X", E], ["X", E, E]]
    r = best_move(board, "O")
    assert (r["row"], r["col"]) == (0, 2) and r["winner"] == "O"
    assert r["line"] == [[0, 0], [0, 1], [0, 2]]


def test_ai_blocks_threat():
    board = [["X", "X", E], [E, "O", E], [E, E, E]]
    r = best_move(board, "O")
    assert (r["row"], r["col"]) == (0, 2)


def test_ai_as_x_on_empty_board_never_loses():
    r = best_move([[E] * 3 for _ in range(3)], "X")
    assert max(s["score"] for s in r["scores"]) == 0  # perfect play is a draw
    assert len(r["scores"]) == 9


def _play_out(ai, rng):
    """Random opponent vs AI; returns the winner (or None for a draw)."""
    board = [[E] * 3 for _ in range(3)]
    turn = "X"
    while _winner(board) is None and not _is_full(board):
        if turn == ai:
            board = best_move(board, ai)["board"]
        else:
            r, c = rng.choice([(r, c) for r in range(3) for c in range(3) if not board[r][c]])
            board[r][c] = turn
        turn = "O" if turn == "X" else "X"
    return _winner(board)


@pytest.mark.parametrize("ai", ["X", "O"])
def test_ai_never_loses_to_random_play(ai):
    rng = random.Random(7)
    human = "O" if ai == "X" else "X"
    for _ in range(25):
        assert _play_out(ai, rng) != human


@pytest.mark.parametrize("board,ai", [
    ([["X", "X", E], [E] * 3, [E] * 3], "O"),   # X moved twice in a row
    ([["X", E, E], [E] * 3, [E] * 3], "X"),     # it is O's turn, not X's
    ([["Q", E, E], [E] * 3, [E] * 3], "O"),
])
def test_ai_rejects_invalid_positions(board, ai):
    with pytest.raises(ValueError):
        best_move(board, ai)


# ── Max flow ─────────────────────────────────────────────────────────────────

CLRS = [  # CLRS Figure 26.1, max flow 23
    (0, 1, 16), (0, 2, 13), (1, 3, 12), (2, 1, 4), (2, 4, 14), (3, 2, 9), (3, 5, 20), (4, 3, 7), (4, 5, 4),
]


def _edges(triples):
    return [{"from": u, "to": v, "capacity": c} for u, v, c in triples]


def _check_flow(res, n, triples):
    flow = {(e["from"], e["to"]): e["flow"] for e in res["edge_flows"]}
    for e in res["edge_flows"]:
        assert 0 <= e["flow"] <= e["capacity"]
    for v in range(n):
        if v in (res["source"], res["sink"]):
            continue
        inflow = sum(f for (a, b), f in flow.items() if b == v)
        outflow = sum(f for (a, b), f in flow.items() if a == v)
        assert inflow == outflow
    out_of_source = sum(f for (a, b), f in flow.items() if a == res["source"]) - \
        sum(f for (a, b), f in flow.items() if b == res["source"])
    assert out_of_source == res["max_flow"]
    # Max-flow min-cut theorem
    assert res["min_cut"]["capacity"] == res["max_flow"]


def test_maxflow_clrs():
    r = max_flow(6, _edges(CLRS), 0, 5)
    assert r["max_flow"] == 23
    _check_flow(r, 6, CLRS)


def test_maxflow_random_graphs_satisfy_min_cut():
    rng = random.Random(5)
    for _ in range(100):
        n = rng.randint(2, 8)
        triples = [(u, v, rng.randint(0, 15)) for u in range(n) for v in range(n)
                   if u != v and rng.random() < 0.4]
        if not triples:
            continue
        _check_flow(max_flow(n, _edges(triples), 0, n - 1), n, triples)


def test_maxflow_disconnected_is_zero():
    r = max_flow(3, _edges([(1, 2, 5)]), 0, 2)
    assert r["max_flow"] == 0 and r["augmenting_paths"] == []


@pytest.mark.parametrize("n,triples,s,t", [(3, [(0, 3, 1)], 0, 2), (3, [(0, 0, 1)], 0, 2), (3, [(0, 1, 1)], 1, 1)])
def test_maxflow_rejects_bad_graphs(n, triples, s, t):
    with pytest.raises(ValueError):
        max_flow(n, _edges(triples), s, t)


# ── Huffman tree ─────────────────────────────────────────────────────────────

def _leaves(node, depth=0):
    if node["char"] is not None:
        return [(node["char"], depth)]
    return _leaves(node["left"], depth + 1) + _leaves(node["right"], depth + 1)


def test_huffman_tree_matches_codes():
    text = "abracadabra alakazam"
    r = compress(text)
    leaves = dict(_leaves(r["tree"]))
    for row in r["table"]:
        ch = " " if row["char"] == "SPACE" else row["char"]
        assert leaves[ch] == row["bits"]
    assert r["tree"]["freq"] == len(text)
    assert r["entropy"] <= r["avg_bits"] < r["entropy"] + 1   # Shannon bound


def test_huffman_is_deterministic():
    text = "aabbccddeeff"   # many frequency ties
    assert compress(text)["table"] == compress(text)["table"]


def test_huffman_tree_omitted_when_too_large():
    text = "".join(chr(0x4E00 + i) for i in range(MAX_TREE_LEAVES + 1))
    assert compress(text)["tree"] is None
