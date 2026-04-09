"""
nqueens.py — Backtracking: N-Queens Problem Solver
"""
from typing import List


def _is_safe(placement: List[int], row: int, col: int) -> bool:
    for r, c in enumerate(placement):
        if c == col or abs(c - col) == abs(r - row):
            return False
    return True


def _backtrack(placement: List[int], n: int, solutions: List[List[int]]):
    row = len(placement)
    if row == n:
        solutions.append(placement[:])
        return
    for col in range(n):
        if _is_safe(placement, row, col):
            placement.append(col)
            _backtrack(placement, n, solutions)
            placement.pop()


def to_board(solution: List[int], n: int) -> List[List[str]]:
    return [["Q" if solution[r] == c else "." for c in range(n)] for r in range(n)]


def solve_nqueens(n: int) -> dict:
    if n < 1 or n > 12:
        raise ValueError("N must be between 1 and 12.")
    if n == 2 or n == 3:
        return {"n": n, "total_solutions": 0, "solutions": [], "boards": []}

    solutions: List[List[int]] = []
    _backtrack([], n, solutions)

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
                return {"valid": False, "reason": f"Queens at row {r},col {c} and row {r2},col {c2} attack each other."}
    return {"valid": True, "reason": "Valid solution!", "board": to_board(placement, n)}
