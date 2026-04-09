"""
knapsack.py — 0/1 Knapsack via Dynamic Programming
"""
from typing import List, Dict, Any


def solve_knapsack(weights: List[int], values: List[int], capacity: int) -> Dict[str, Any]:
    n = len(weights)
    if n == 0:
        raise ValueError("Provide at least one item.")
    if capacity <= 0:
        raise ValueError("Capacity must be positive.")
    if n != len(values):
        raise ValueError("Weights and values lists must have equal length.")

    # Build DP table  dp[i][w] = max value using first i items with capacity w
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        w_i = weights[i - 1]
        v_i = values[i - 1]
        for w in range(capacity + 1):
            # Don't take item i
            dp[i][w] = dp[i - 1][w]
            # Take item i if it fits
            if w_i <= w:
                take = dp[i - 1][w - w_i] + v_i
                if take > dp[i][w]:
                    dp[i][w] = take

    # Backtrack to find selected items
    selected = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            selected.append(i - 1)  # 0-indexed
            w -= weights[i - 1]
    selected.reverse()

    total_value  = dp[n][capacity]
    total_weight = sum(weights[i] for i in selected)

    # Build a compact representation of the DP table for the frontend
    # We only send the last two rows at each step to keep payload small
    # Instead we send the full table (capped at capacity=50 for display)
    display_cap = min(capacity, 50)
    table_rows = []
    for i in range(n + 1):
        table_rows.append(dp[i][:display_cap + 1])

    return {
        "max_value":     total_value,
        "total_weight":  total_weight,
        "capacity":      capacity,
        "n_items":       n,
        "selected":      selected,
        "dp_table":      table_rows,
        "display_cap":   display_cap,
        "items": [
            {"index": i, "weight": weights[i], "value": values[i], "selected": i in selected}
            for i in range(n)
        ],
    }
