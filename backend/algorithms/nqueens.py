"""
nqueens.py — Backtracking: N-Queens Problem Solver
"""
from functools import lru_cache
from typing import List, Tuple

MAX_N = 12


@lru_cache(maxsize=None)
def _all_solutions(n: int) -> Tuple[Tuple[int, ...], ...]:
    """
    Bitmask backtracking. Each set bit in cols/d1/d2 marks a column or diagonal
    already attacked, so finding safe squares is O(1) instead of O(row).
    Solutions come out in the same lexicographic order as the naive version.
    Results are cached: there are only MAX_N possible inputs.
    """
    full = (1 << n) - 1
    placement = [0] * n
    solutions: List[Tuple[int, ...]] = []

    def backtrack(row: int, cols: int, d1: int, d2: int):
        if row == n:
            solutions.append(tuple(placement))
            return
        free = full & ~(cols | d1 | d2)
        while free:
            bit = free & -free          # lowest free column
            free ^= bit
            placement[row] = bit.bit_length() - 1
            backtrack(row + 1, cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1)

    backtrack(0, 0, 0, 0)
    return tuple(solutions)


def to_board(solution: List[int], n: int) -> List[List[str]]:
    return [["Q" if solution[r] == c else "." for c in range(n)] for r in range(n)]


def solve_nqueens(n: int) -> dict:
    if n < 1 or n > MAX_N:
        raise ValueError(f"N must be between 1 and {MAX_N}.")

    solutions = [list(s) for s in _all_solutions(n)]
    return {
        "n": n,
        "total_solutions": len(solutions),
        "solutions": solutions,          # list of column-index arrays (one per row)
        "boards": [to_board(s, n) for s in solutions[:8]],  # 2D char boards for first 8
    }


def verify_placement(placement: List[int], n: int) -> dict:
    """Verify if a custom column-index placement is a valid N-Queens solution."""
    if len(placement) != n:
        return {"valid": False, "reason": f"Expected {n} values, got {len(placement)}."}
    for i in range(n):
        if not (0 <= placement[i] < n):
            return {"valid": False, "reason": f"Column index out of range at row {i}: {placement[i]}"}
    for r in range(n):
        for r2 in range(r + 1, n):
            c, c2 = placement[r], placement[r2]
            if c == c2 or abs(c - c2) == abs(r - r2):
                return {"valid": False, "reason": f"Queens at row {r},col {c} and row {r2},col {c2} attack each other.",
                        "conflict": [[r, c], [r2, c2]]}
    return {"valid": True, "reason": "Valid solution!", "board": to_board(placement, n)}
