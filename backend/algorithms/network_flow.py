"""
network_flow.py — Ford-Fulkerson (BFS / Edmonds-Karp) Max Flow
"""
from collections import deque
from typing import List, Dict


def _bfs(graph: List[List[int]], source: int, sink: int, parent: List[int]) -> bool:
    n = len(graph)
    visited = [False] * n
    visited[source] = True
    q = deque([source])
    while q:
        u = q.popleft()
        for v in range(n):
            if not visited[v] and graph[u][v] > 0:
                visited[v] = True
                parent[v] = u
                if v == sink:
                    return True
                q.append(v)
    return False


def max_flow(capacities: List[List[int]], source: int = 0, sink: int = -1) -> dict:
    n = len(capacities)
    if sink < 0:
        sink = n - 1

    # Deep-copy into residual graph
    graph = [row[:] for row in capacities]
    parent = [-1] * n
    total_flow = 0
    flow_paths = []

    while _bfs(graph, source, sink, parent):
        # Find min capacity along the augmenting path
        path_flow = float("inf")
        v = sink
        path = []
        while v != source:
            u = parent[v]
            path.append(v)
            path_flow = min(path_flow, graph[u][v])
            v = u
        path.append(source)
        path.reverse()

        # Update residual capacities
        v = sink
        while v != source:
            u = parent[v]
            graph[u][v] -= path_flow
            graph[v][u] += path_flow
            v = u

        total_flow += path_flow
        flow_paths.append({"path": path, "flow": int(path_flow)})
        parent = [-1] * n

    # Build edge flow info (original − residual)
    edge_flows = []
    for u in range(n):
        for v in range(n):
            orig = capacities[u][v]
            residual = graph[u][v]
            used = orig - residual
            if orig > 0:
                edge_flows.append({
                    "from": u, "to": v,
                    "capacity": orig, "flow": used,
                    "saturated": used == orig,
                })

    return {
        "max_flow": total_flow,
        "augmenting_paths": flow_paths,
        "edge_flows": edge_flows,
    }
