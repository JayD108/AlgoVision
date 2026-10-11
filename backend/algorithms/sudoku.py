"""
sudoku.py — Backtracking: 9x9 Sudoku Solver

Backtracking with the "minimum remaining values" heuristic: always fill the
empty cell with the fewest legal digits next. Row/column/box usage is kept
in bitmasks so checking a digit is O(1).
"""
from typing import List, Tuple

# MRV solves typical puzzles in well under 10k nodes; the cap keeps a
# pathological or unsolvable input from tying up the server.
MAX_NODES = 200_000


def _box(r: int, c: int) -> int:
    return (r // 3) * 3 + c // 3


def _validate(board: List[List[int]]):
    if len(board) != 9 or any(len(row) != 9 for row in board):
        raise ValueError("Board must be a 9x9 grid.")
    for r in range(9):
        for c in range(9):
            if not (0 <= board[r][c] <= 9):
                raise ValueError(f"Invalid cell value {board[r][c]} at row {r + 1}, column {c + 1}. Must be 0-9.")
    seen = set()
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if not v:
                continue
            for key, label in (((0, r, v), f"row {r + 1}"), ((1, c, v), f"column {c + 1}"),
                               ((2, _box(r, c), v), f"box {_box(r, c) + 1}")):
                if key in seen:
                    raise ValueError(f"The given digits conflict: {v} appears twice in {label}.")
                seen.add(key)


def solve(board: List[List[int]]) -> dict:
    _validate(board)

    grid = [row[:] for row in board]
    rows, cols, boxes = [0] * 9, [0] * 9, [0] * 9
    empties: List[Tuple[int, int]] = []
    for r in range(9):
        for c in range(9):
            v = grid[r][c]
            if v:
                bit = 1 << v
                rows[r] |= bit
                cols[c] |= bit
                boxes[_box(r, c)] |= bit
            else:
                empties.append((r, c))

    stats = {"nodes": 0, "backtracks": 0}
    fill_order: List[List[int]] = []
    ALL = 0b1111111110  # bits 1..9

    def candidates(r: int, c: int) -> int:
        return ALL & ~(rows[r] | cols[c] | boxes[_box(r, c)])

    def search() -> bool:
        if not empties:
            return True
        stats["nodes"] += 1
        if stats["nodes"] > MAX_NODES:
            raise ValueError("Search limit reached — this puzzle is too hard or has no solution.")

        # Pick the most constrained empty cell.
        best_i, best_mask, best_count = -1, 0, 10
        for i, (r, c) in enumerate(empties):
            mask = candidates(r, c)
            count = bin(mask).count("1")
            if count < best_count:
                best_i, best_mask, best_count = i, mask, count
                if count <= 1:
                    break
        if best_count == 0:
            stats["backtracks"] += 1
            return False

        r, c = empties.pop(best_i)
        b = _box(r, c)
        mask = best_mask
        while mask:
            bit = mask & -mask
            mask ^= bit
            grid[r][c] = bit.bit_length() - 1
            rows[r] |= bit
            cols[c] |= bit
            boxes[b] |= bit
            fill_order.append([r, c])
            if search():
                return True
            fill_order.pop()
            rows[r] ^= bit
            cols[c] ^= bit
            boxes[b] ^= bit
        grid[r][c] = 0
        empties.insert(best_i, (r, c))
        stats["backtracks"] += 1
        return False

    if not search():
        raise ValueError("This Sudoku puzzle has no valid solution.")

    return {
        "solved_board": grid,
        "fill_order": fill_order,   # cells in the order the solver committed them
        "nodes": stats["nodes"],
        "backtracks": stats["backtracks"],
        "givens": 81 - len(fill_order),
    }
