"""
minimax.py — Game Theory: Tic-Tac-Toe with Minimax + Alpha-Beta Pruning
"""
from typing import List, Optional, Tuple


Board = List[List[str]]  # 3x3 grid of "", "X", "O"


def _winner(board: Board) -> Optional[str]:
    lines = (
        [board[r] for r in range(3)] +                          # rows
        [[board[r][c] for r in range(3)] for c in range(3)] +  # cols
        [[board[i][i] for i in range(3)]] +                     # diag
        [[board[i][2 - i] for i in range(3)]],                  # anti-diag
    )
    for group in lines[0]:
        if group[0] != "" and group[0] == group[1] == group[2]:
            return group[0]
    return None


def _is_full(board: Board) -> bool:
    return all(board[r][c] != "" for r in range(3) for c in range(3))


def _minimax(board: Board, is_maximizing: bool, alpha: float, beta: float) -> int:
    w = _winner(board)
    if w == "O":
        return 10
    if w == "X":
        return -10
    if _is_full(board):
        return 0

    if is_maximizing:  # AI is O
        best = -1000
        for r in range(3):
            for c in range(3):
                if board[r][c] == "":
                    board[r][c] = "O"
                    val = _minimax(board, False, alpha, beta)
                    board[r][c] = ""
                    best = max(best, val)
                    alpha = max(alpha, best)
                    if beta <= alpha:
                        return best
        return best
    else:  # Human is X
        best = 1000
        for r in range(3):
            for c in range(3):
                if board[r][c] == "":
                    board[r][c] = "X"
                    val = _minimax(board, True, alpha, beta)
                    board[r][c] = ""
                    best = min(best, val)
                    beta = min(beta, best)
                    if beta <= alpha:
                        return best
        return best


def best_move(board: Board) -> dict:
    """Return the best move for AI (O) given the current board state."""
    w = _winner(board)
    if w:
        return {"winner": w, "row": -1, "col": -1, "game_over": True}

    best_val = -1000
    best_r, best_c = -1, -1

    for r in range(3):
        for c in range(3):
            if board[r][c] == "":
                board[r][c] = "O"
                move_val = _minimax(board, False, -1000, 1000)
                board[r][c] = ""
                if move_val > best_val:
                    best_val = move_val
                    best_r, best_c = r, c

    if best_r == -1:
        return {"winner": None, "row": -1, "col": -1, "game_over": True, "draw": True}

    # Apply the move to return updated board
    board[best_r][best_c] = "O"
    winner_after = _winner(board)
    full_after = _is_full(board)

    return {
        "row": best_r,
        "col": best_c,
        "board": board,
        "winner": winner_after,
        "game_over": bool(winner_after) or full_after,
        "draw": full_after and not winner_after,
    }
