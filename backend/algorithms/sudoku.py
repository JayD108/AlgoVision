"""
sudoku.py — Backtracking: 9x9 Sudoku Solver
"""
from typing import List
import copy


def _is_valid(board: List[List[int]], row: int, col: int, num: int) -> bool:
    # Row check
    if num in board[row]:
        return False
    # Column check
    if num in [board[r][col] for r in range(9)]:
        return False
    # 3x3 box check
    br, bc = (row // 3) * 3, (col // 3) * 3
    for r in range(br, br + 3):
        for c in range(bc, bc + 3):
            if board[r][c] == num:
                return False
    return True


def _solve(board: List[List[int]]) -> bool:
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                for num in range(1, 10):
                    if _is_valid(board, row, col, num):
                        board[row][col] = num
                        if _solve(board):
                            return True
                        board[row][col] = 0
                return False  # No valid number found — backtrack
    return True  # All cells filled


def solve(board: List[List[int]]) -> dict:
    if len(board) != 9 or any(len(row) != 9 for row in board):
        raise ValueError("Board must be a 9x9 grid.")
    for row in board:
        for val in row:
            if not (0 <= val <= 9):
                raise ValueError(f"Invalid cell value: {val}. Must be 0-9.")

    working = copy.deepcopy(board)
    solved = _solve(working)
    if not solved:
        raise ValueError("This Sudoku puzzle has no valid solution.")

    return {"solved_board": working}
