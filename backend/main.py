"""
main.py — DAA Interactive Dashboard — FastAPI Backend
"""
import os
import sys
from typing import Annotated, List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

sys.path.insert(0, os.path.dirname(__file__))

from algorithms.huffman    import compress as huffman_compress
from algorithms.stock_dp   import max_profit_k_transactions
from algorithms.tsp_solver import solve_tsp, MAX_CITIES
from algorithms.nqueens    import solve_nqueens, verify_placement, MAX_N as NQ_MAX
from algorithms.knapsack   import solve_knapsack
from algorithms.hanoi      import solve_hanoi

VERSION = "4.0.0"

# Every endpoint takes a small JSON body; reject anything bigger up front.
MAX_BODY_BYTES = 64 * 1024

app = FastAPI(title="DAA Interactive Dashboard", version=VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    length = request.headers.get("content-length")
    if length is not None and length.isdigit() and int(length) > MAX_BODY_BYTES:
        return JSONResponse({"detail": "Request body too large."}, status_code=413)
    return await call_next(request)


# ─── Models ───────────────────────────────────────────────────────────────────
# Limits here bound worst-case CPU and memory per request; the frontend
# mirrors them so users see the same limits before submitting.

Price  = Annotated[int, Field(ge=0, le=1_000_000)]
Weight = Annotated[int, Field(ge=0, le=500)]
Value  = Annotated[int, Field(ge=0, le=1_000_000)]

class HuffmanRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10_000)

class StockRequest(BaseModel):
    prices: List[Price] = Field(..., min_length=2, max_length=1_000)
    k: int = Field(..., ge=1, le=100)

class CityPoint(BaseModel):
    x: float = Field(..., ge=-10_000, le=10_000)
    y: float = Field(..., ge=-10_000, le=10_000)

class TSPRequest(BaseModel):
    cities: List[CityPoint] = Field(..., min_length=2, max_length=MAX_CITIES)

class NQueensRequest(BaseModel):
    n: int = Field(..., ge=1, le=NQ_MAX)

class NQueensVerifyRequest(BaseModel):
    placement: List[int] = Field(..., max_length=NQ_MAX)
    n: int = Field(..., ge=1, le=NQ_MAX)

class KnapsackRequest(BaseModel):
    weights:  List[Weight] = Field(..., min_length=1, max_length=20)
    values:   List[Value]  = Field(..., min_length=1, max_length=20)
    capacity: int          = Field(..., ge=1, le=500)

class HanoiRequest(BaseModel):
    n: int = Field(..., ge=1, le=10)


def _run(fn, *args):
    """Turn input errors raised by algorithms into 400s; let real bugs surface as 500s."""
    try:
        return fn(*args)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "DAA Dashboard Backend Running", "version": VERSION}

@app.post("/api/huffman")
def api_huffman(req: HuffmanRequest):
    return _run(huffman_compress, req.text)

@app.post("/api/stock")
def api_stock(req: StockRequest):
    return _run(max_profit_k_transactions, req.prices, req.k)

@app.post("/api/tsp")
def api_tsp(req: TSPRequest):
    return _run(solve_tsp, [(c.x, c.y) for c in req.cities])

@app.post("/api/nqueens")
def api_nqueens(req: NQueensRequest):
    return _run(solve_nqueens, req.n)

@app.post("/api/nqueens/verify")
def api_nqueens_verify(req: NQueensVerifyRequest):
    return _run(verify_placement, req.placement, req.n)

@app.post("/api/knapsack")
def api_knapsack(req: KnapsackRequest):
    return _run(solve_knapsack, req.weights, req.values, req.capacity)

@app.post("/api/hanoi")
def api_hanoi(req: HanoiRequest):
    return _run(solve_hanoi, req.n)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
