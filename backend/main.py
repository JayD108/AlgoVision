"""
main.py — DAA Interactive Dashboard — FastAPI Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import sys, os

sys.path.insert(0, os.path.dirname(__file__))

from algorithms.huffman   import compress as huffman_compress
from algorithms.stock_dp  import max_profit_k_transactions
from algorithms.tsp_solver import solve_tsp
from algorithms.nqueens   import solve_nqueens, verify_placement
from algorithms.knapsack  import solve_knapsack
from algorithms.hanoi     import solve_hanoi

app = FastAPI(title="DAA Interactive Dashboard", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────────────────────────────

class HuffmanRequest(BaseModel):
    text: str = Field(..., min_length=1)

class StockRequest(BaseModel):
    prices: List[int] = Field(..., min_length=2)
    k: int = Field(..., ge=1, le=100)

class CityPoint(BaseModel):
    x: float
    y: float

class TSPRequest(BaseModel):
    cities: List[CityPoint] = Field(..., min_length=2, max_length=20)

class NQueensRequest(BaseModel):
    n: int = Field(..., ge=1, le=12)

class NQueensVerifyRequest(BaseModel):
    placement: List[int]
    n: int = Field(..., ge=1, le=12)

class KnapsackRequest(BaseModel):
    weights:  List[int] = Field(..., min_length=1, max_length=20)
    values:   List[int] = Field(..., min_length=1, max_length=20)
    capacity: int       = Field(..., ge=1, le=500)

class HanoiRequest(BaseModel):
    n: int = Field(..., ge=1, le=10)

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "DAA Dashboard Backend Running", "version": "3.0.0"}

@app.post("/api/huffman")
def api_huffman(req: HuffmanRequest):
    try:
        return huffman_compress(req.text)
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/stock")
def api_stock(req: StockRequest):
    try:
        return max_profit_k_transactions(req.prices, req.k)
    except Exception as e:
        raise HTTPException(400, str(e))

@app.post("/api/tsp")
def api_tsp(req: TSPRequest):
    try:
        return solve_tsp([(c.x, c.y) for c in req.cities])
    except Exception as e:
        raise HTTPException(400, str(e))

@app.post("/api/nqueens")
def api_nqueens(req: NQueensRequest):
    try:
        return solve_nqueens(req.n)
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/nqueens/verify")
def api_nqueens_verify(req: NQueensVerifyRequest):
    try:
        return verify_placement(req.placement, req.n)
    except Exception as e:
        raise HTTPException(400, str(e))

@app.post("/api/knapsack")
def api_knapsack(req: KnapsackRequest):
    try:
        return solve_knapsack(req.weights, req.values, req.capacity)
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/hanoi")
def api_hanoi(req: HanoiRequest):
    try:
        return solve_hanoi(req.n)
    except ValueError as e:
        raise HTTPException(400, str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
