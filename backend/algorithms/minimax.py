"""
minimax.py — Game Theory: Tic-Tac-Toe with Minimax + Alpha-Beta Pruning

X always moves first. The AI may play either side. Scores are from the AI's
point of view: +10 for a win, -10 for a loss, adjusted by depth so the AI
prefers faster wins and slower losses.
"""
from typing import List, Optional, Tuple

Board = List[List[str]]  # 3x3 grid of "", "X", "O"

LINES: Tuple[Tuple[Tuple[int, int], ...], ...] = tuple(
    [tuple((r, c) for c in range(3)) for r in range(3)] +       # rows
    [tuple((r, c) for r in range(3)) for c in range(3)] +       # cols
    [((0, 0), (1, 1), (2, 2)), ((0, 2), (1, 1), (2, 0))]        # diagonals
)


def winning_line(board: Board) -> Optional[List[List[int]]]:
    for line in LINES:
        (r0, c0), (r1, c1), (r2, c2) = line
        if board[r0][c0] and board[r0][c0] == board[r1][c1] == board[r2][c2]:
            return [list(p) for p in line]
    return None


def _winner(board: Board) -> Optional[str]:
    line = winning_line(board)
    return board[line[0][0]][line[0][1]] if line else None


def _is_full(board: Board) -> bool:
    return all(board[r][c] != "" for r in range(3) for c in range(3))


def _validate(board: Board, ai: str) -> str:
    if ai not in ("X", "O"):
        raise ValueError("AI must play 'X' or 'O'.")
    if len(board) != 3 or any(len(row) != 3 for row in board):
        raise ValueError("Board must be 3x3.")
    flat = [v for row in board for v in row]
    if any(v not in ("", "X", "O") for v in flat):
        raise ValueError("Cells must be '', 'X' or 'O'.")
    x, o = flat.count("X"), flat.count("O")
    if x not in (o, o + 1):
        raise ValueError("Invalid position: X moves first and players alternate.")
    return "X" if x == o else "O"


def _minimax(board: Board, to_move: str, ai: str, depth: int,
             alpha: float, beta: float, stats: dict) -> int:
    stats["nodes"] += 1
    w = _winner(board)
    if w:
        return (10 - depth) if w == ai else (depth - 10)
    if _is_full(board):
        return 0

    other = "O" if to_move == "X" else "X"
    maximizing = to_move == ai
    best = -1000 if maximizing else 1000
    for r in range(3):
        for c in range(3):
            if board[r][c]:
                continue
            board[r][c] = to_move
            val = _minimax(board, other, ai, depth + 1, alpha, beta, stats)
            board[r][c] = ""
            if maximizing:
                best = max(best, val)
                alpha = max(alpha, best)
            else:
                best = min(best, val)
                beta = min(beta, best)
            if beta <= alpha:
                stats["pruned"] += 1
                return best
    return best


def best_move(board: Board, ai: str = "O") -> dict:
    """Return the AI's best move, plus the exact score of every legal move."""
    board = [row[:] for row in board]
    to_move = _validate(board, ai)

    w = _winner(board)
    if w or _is_full(board):
        return {"row": -1, "col": -1, "board": board, "winner": w, "line": winning_line(board),
                "game_over": True, "draw": not w, "scores": [], "nodes": 0, "pruned": 0}
    if to_move != ai:
        raise ValueError(f"It is {to_move}'s turn, not the AI's.")

    other = "O" if ai == "X" else "X"
    stats = {"nodes": 0, "pruned": 0}
    scores = []
    best_val, best_r, best_c = -1000, -1, -1
    for r in range(3):
        for c in range(3):
            if board[r][c]:
                continue
            board[r][c] = ai
            # Full window per root move so every displayed score is exact.
            val = _minimax(board, other, ai, 1, -1000, 1000, stats)
            board[r][c] = ""
            scores.append({"row": r, "col": c, "score": val})
            if val > best_val:
                best_val, best_r, best_c = val, r, c

    board[best_r][best_c] = ai
    winner_after = _winner(board)
    full_after = _is_full(board)

    return {
        "row": best_r,
        "col": best_c,
        "board": board,
        "winner": winner_after,
        "line": winning_line(board),
        "game_over": bool(winner_after) or full_after,
        "draw": full_after and not winner_after,
        "scores": scores,
        "nodes": stats["nodes"],
        "pruned": stats["pruned"],
    }
