"""
huffman.py — Greedy: Huffman Coding / File Compression
"""
import heapq
import math
from collections import Counter
from dataclasses import dataclass, field
from typing import Optional


@dataclass(order=True)
class Node:
    freq: int
    # Creation order breaks frequency ties, so the tree is deterministic.
    seq: int = field(default=0)
    char: Optional[str] = field(default=None, compare=False)
    left: Optional["Node"] = field(default=None, compare=False)
    right: Optional["Node"] = field(default=None, compare=False)


# The tree is only sent when it is small enough to draw legibly.
MAX_TREE_LEAVES = 64


def build_tree(text: str) -> Node:
    freq = Counter(text)
    heap = [Node(f, i, c) for i, (c, f) in enumerate(sorted(freq.items()))]
    heapq.heapify(heap)
    seq = len(heap)
    while len(heap) > 1:
        a = heapq.heappop(heap)
        b = heapq.heappop(heap)
        heapq.heappush(heap, Node(a.freq + b.freq, seq, left=a, right=b))
        seq += 1
    return heap[0]


def _generate_codes(node: Optional[Node], prefix: str, codes: dict):
    if node is None:
        return
    if node.char is not None:
        codes[node.char] = prefix if prefix else "0"
        return
    _generate_codes(node.left, prefix + "0", codes)
    _generate_codes(node.right, prefix + "1", codes)


def _tree_to_dict(node: Optional[Node]) -> Optional[dict]:
    if node is None:
        return None
    return {
        "freq": node.freq,
        "char": node.char,
        "left": _tree_to_dict(node.left),
        "right": _tree_to_dict(node.right),
    }


def compress(text: str) -> dict:
    if not text:
        raise ValueError("Input text cannot be empty.")

    freq = Counter(text)
    codes = {}

    root = build_tree(text)
    _generate_codes(root, "", codes)  # a lone leaf gets code "0"

    encoded = "".join(codes[c] for c in text)
    original_bits = len(text) * 8
    compressed_bits = len(encoded)
    ratio = round((1 - compressed_bits / original_bits) * 100, 2) if original_bits > 0 else 0
    n = len(text)
    # Shannon entropy: the lower bound on average bits/symbol for any prefix code.
    entropy = -sum((f / n) * math.log2(f / n) for f in freq.values())

    table = [
        {
            "char": c if c != " " else "SPACE",
            "freq": freq[c],
            "code": codes[c],
            "bits": len(codes[c]),
        }
        for c in sorted(codes, key=lambda x: freq[x], reverse=True)
    ]

    return {
        "original_length": len(text),
        "original_bits": original_bits,
        "encoded": encoded[:500] + ("..." if len(encoded) > 500 else ""),
        "encoded_full_length": len(encoded),
        "compressed_bits": compressed_bits,
        "compression_ratio": ratio,
        "avg_bits": round(compressed_bits / n, 3),
        "entropy": round(entropy, 3),
        "unique_chars": len(freq),
        "table": table,
        "tree": _tree_to_dict(root) if len(freq) <= MAX_TREE_LEAVES else None,
    }
