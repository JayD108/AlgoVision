"""
hanoi.py — Tower of Hanoi via Recursion
Records every disk move so the frontend can animate them step by step.
"""
from typing import List, Dict, Any


def solve_hanoi(n: int) -> Dict[str, Any]:
    if n < 1 or n > 10:
        raise ValueError("Number of disks must be between 1 and 10.")

    moves: List[Dict[str, Any]] = []

    def hanoi(disk: int, src: str, dst: str, via: str):
        if disk == 0:
            return
        # Move n-1 disks from src to via using dst
        hanoi(disk - 1, src, via, dst)
        # Move the largest disk from src to dst
        moves.append({"disk": disk, "from": src, "to": dst})
        # Move n-1 disks from via to dst using src
        hanoi(disk - 1, via, dst, src)

    hanoi(n, "A", "C", "B")

    total_moves = (2 ** n) - 1  # Mathematical minimum

    return {
        "n_disks":     n,
        "total_moves": total_moves,
        "moves":       moves,
    }
