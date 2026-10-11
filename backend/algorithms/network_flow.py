"""
network_flow.py — Ford-Fulkerson with BFS (Edmonds-Karp) Max Flow
"""
from collections import deque
from typing import List, Optional

MAX_NODES = 12


def _bfs(graph: List[List[int]], source: int, sink: int) -> Optional[List[int]]:
    """Shortest augmenting path in the residual graph, as a parent array."""
    n = len(graph)
    parent = [-1] * n
    parent[source] = source
    q = deque([source])
    while q:
        u = q.popleft()
        for v in range(n):
            if parent[v] == -1 and graph[u][v] > 0:
                parent[v] = u
                if v == sink:
                    return parent
                q.append(v)
    return None


def max_flow(n: int, edges: List[dict], source: int = 0, sink: int = -1) -> dict:
    if not (2 <= n <= MAX_NODES):
        raise ValueError(f"Number of nodes must be between 2 and {MAX_NODES}.")
    if sink < 0:
        sink = n - 1
    if not (0 <= source < n and 0 <= sink < n):
        raise ValueError("Source and sink must be valid node indices.")
    if source == sink:
        raise ValueError("Source and sink must be different nodes.")

    capacities = [[0] * n for _ in range(n)]
    for e in edges:
        u, v, cap = e["from"], e["to"], e["capacity"]
        if not (0 <= u < n and 0 <= v < n):
            raise ValueError(f"Edge {u}→{v} refers to a node outside 0..{n - 1}.")
        if u == v:
            raise ValueError(f"Self-loop {u}→{v} is not allowed.")
        if cap < 0:
            raise ValueError("Capacities must be non-negative.")
        capacities[u][v] += cap  # parallel edges add up

    graph = [row[:] for row in capacities]  # residual graph
    total_flow = 0
    flow_paths = []

    while (parent := _bfs(graph, source, sink)) is not None:
        path, path_flow, v = [], float("inf"), sink
        while v != source:
            u = parent[v]
            path.append(v)
            path_flow = min(path_flow, graph[u][v])
            v = u
        path.append(source)
        path.reverse()

        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            graph[u][v] -= path_flow
            graph[v][u] += path_flow

        total_flow += path_flow
        flow_paths.append({"path": path, "flow": int(path_flow)})

    # Net flow on each original edge. With antiparallel edges u→v and v→u,
    # the residual mixes both, so take the positive part of the net transfer.
    edge_flows = []
    for u in range(n):
        for v in range(n):
            orig = capacities[u][v]
            if orig > 0:
                net = capacities[u][v] - graph[u][v]
                used = max(0, min(orig, net))
                edge_flows.append({"from": u, "to": v, "capacity": orig, "flow": used,
                                   "saturated": used == orig})

    # Min cut: nodes still reachable from the source in the final residual graph.
    reachable = {source}
    q = deque([source])
    while q:
        u = q.popleft()
        for v in range(n):
            if v not in reachable and graph[u][v] > 0:
                reachable.add(v)
                q.append(v)
    cut_edges = [{"from": u, "to": v, "capacity": capacities[u][v]}
                 for u in sorted(reachable) for v in range(n)
                 if v not in reachable and capacities[u][v] > 0]

    return {
        "max_flow": total_flow,
        "source": source,
        "sink": sink,
        "augmenting_paths": flow_paths,
        "edge_flows": edge_flows,
        "min_cut": {"source_side": sorted(reachable), "edges": cut_edges,
                    "capacity": sum(e["capacity"] for e in cut_edges)},
    }
