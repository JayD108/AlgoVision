"""
stock_dp.py — Dynamic Programming: Max Profit with at most K Transactions
"""
from typing import List


def max_profit_k_transactions(prices: List[int], k: int) -> dict:
    n = len(prices)
    if n < 2 or k <= 0:
        return {"max_profit": 0, "transactions": []}

    # If k >= n//2 we can make unlimited transactions
    if k >= n // 2:
        profit = 0
        txns = []
        i = 1
        while i < n:
            if prices[i] > prices[i - 1]:
                buy = i - 1
                while i < n and prices[i] >= prices[i - 1]:
                    i += 1
                sell = i - 1
                profit += prices[sell] - prices[buy]
                txns.append({"buy_day": buy + 1, "sell_day": sell + 1,
                              "buy_price": prices[buy], "sell_price": prices[sell],
                              "profit": prices[sell] - prices[buy]})
            else:
                i += 1
        return {"max_profit": profit, "transactions": txns}

    # General DP: dp[t][d] = max profit using at most t transactions up to day d
    INF = float("-inf")
    # dp[t][d]
    dp = [[0] * n for _ in range(k + 1)]

    for t in range(1, k + 1):
        max_so_far = INF
        for d in range(1, n):
            max_so_far = max(max_so_far, dp[t - 1][d - 1] - prices[d - 1])
            dp[t][d] = max(dp[t][d - 1], prices[d] + max_so_far)

    max_p = dp[k][n - 1]

    # Reconstruct transactions by backtracking
    transactions = _reconstruct(prices, dp, k, n)

    return {"max_profit": max_p, "transactions": transactions}


def _reconstruct(prices, dp, k, n):
    transactions = []
    d = n - 1
    t = k
    while t > 0 and d > 0:
        if dp[t][d] == dp[t][d - 1]:
            d -= 1
            continue
        # Find sell at d, find best buy
        sell = d
        best_buy = -1
        best_val = float("-inf")
        for b in range(sell):
            val = dp[t - 1][b] - prices[b]
            if val > best_val:
                best_val = val
                best_buy = b
        if best_buy >= 0:
            transactions.append({
                "buy_day": best_buy + 1,
                "sell_day": sell + 1,
                "buy_price": prices[best_buy],
                "sell_price": prices[sell],
                "profit": prices[sell] - prices[best_buy],
            })
        t -= 1
        d = best_buy - 1 if best_buy > 0 else 0

    transactions.reverse()
    return transactions
