"""HTTP-level tests: status codes, validation limits, and response shapes."""
import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app, raise_server_exceptions=False)


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["version"] == main.VERSION


@pytest.mark.parametrize("path,body", [
    ("/api/huffman", {"text": "hello world"}),
    ("/api/stock", {"prices": [3, 5, 0, 7], "k": 2}),
    ("/api/tsp", {"cities": [{"x": 0, "y": 0}, {"x": 3, "y": 4}, {"x": 6, "y": 0}]}),
    ("/api/nqueens", {"n": 6}),
    ("/api/nqueens/verify", {"placement": [1, 3, 0, 2], "n": 4}),
    ("/api/knapsack", {"weights": [1, 2], "values": [3, 4], "capacity": 3}),
    ("/api/hanoi", {"n": 3}),
])
def test_happy_paths(path, body):
    r = client.post(path, json=body)
    assert r.status_code == 200, r.text


@pytest.mark.parametrize("path,body", [
    ("/api/huffman", {"text": ""}),
    ("/api/huffman", {"text": "a" * 10_001}),
    ("/api/stock", {"prices": [1], "k": 1}),
    ("/api/stock", {"prices": [1, -2], "k": 1}),
    ("/api/stock", {"prices": [1] * 1001, "k": 1}),
    ("/api/stock", {"prices": [1, 2], "k": 101}),
    ("/api/tsp", {"cities": [{"x": i, "y": i} for i in range(31)]}),
    ("/api/nqueens", {"n": 13}),
    ("/api/knapsack", {"weights": [-3], "values": [5], "capacity": 5}),
    ("/api/knapsack", {"weights": [1], "values": [5], "capacity": 501}),
    ("/api/hanoi", {"n": 11}),
])
def test_validation_rejects_out_of_range(path, body):
    r = client.post(path, json=body)
    assert r.status_code == 422, r.text
    assert isinstance(r.json()["detail"], list)


def test_algorithm_value_error_maps_to_400():
    r = client.post("/api/knapsack", json={"weights": [1, 2], "values": [5], "capacity": 5})
    assert r.status_code == 400
    assert "equal length" in r.json()["detail"]


def test_oversized_body_rejected():
    payload = b'{"text":"' + b"a" * (main.MAX_BODY_BYTES + 1) + b'"}'
    r = client.post("/api/huffman", content=payload, headers={"content-type": "application/json"})
    assert r.status_code == 413


def test_cors_preflight_allows_post():
    r = client.options("/api/hanoi", headers={
        "Origin": "https://example.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert r.status_code == 200
    assert "POST" in r.headers["access-control-allow-methods"]


def test_new_endpoints():
    r = client.post("/api/sudoku", json={"board": [[0] * 9 for _ in range(9)]})
    assert r.status_code == 200 and len(r.json()["fill_order"]) == 81
    r = client.post("/api/tictactoe", json={"board": [["X", "", ""], ["", "", ""], ["", "", ""]], "ai": "O"})
    assert r.status_code == 200 and r.json()["board"][1][1] == "O"
    r = client.post("/api/maxflow", json={"n": 3, "edges": [{"from": 0, "to": 1, "capacity": 4},
                                                            {"from": 1, "to": 2, "capacity": 3}], "sink": 2})
    assert r.status_code == 200 and r.json()["max_flow"] == 3


@pytest.mark.parametrize("path,body,code", [
    ("/api/sudoku", {"board": [[0] * 9 for _ in range(8)]}, 422),
    ("/api/sudoku", {"board": [[10] + [0] * 8] + [[0] * 9 for _ in range(8)]}, 422),
    ("/api/sudoku", {"board": [[5, 5] + [0] * 7] + [[0] * 9 for _ in range(8)]}, 400),
    ("/api/tictactoe", {"board": [["Z", "", ""], ["", "", ""], ["", "", ""]]}, 422),
    ("/api/tictactoe", {"board": [["X", "X", ""], ["", "", ""], ["", "", ""]]}, 400),
    ("/api/maxflow", {"n": 13, "edges": [{"from": 0, "to": 1, "capacity": 1}], "sink": 1}, 422),
    ("/api/maxflow", {"n": 3, "edges": [{"from": 0, "to": 1, "capacity": -1}], "sink": 2}, 422),
    ("/api/maxflow", {"n": 3, "edges": [{"from": 0, "to": 1, "capacity": 1}], "sink": 0}, 400),
])
def test_new_endpoint_validation(path, body, code):
    assert client.post(path, json=body).status_code == code
