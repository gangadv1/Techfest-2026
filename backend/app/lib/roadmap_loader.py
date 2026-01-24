import json
import os
from pathlib import Path
from typing import Dict, Optional
from app.models.roadmap import RoadmapData

# Cache for loaded roadmaps
_roadmap_cache: Dict[str, RoadmapData] = {}

def get_data_dir() -> Path:
    """Get the data directory path."""
    return Path(__file__).parent.parent.parent / "data" / "roadmaps"

def load_roadmap(path_id: str) -> Optional[RoadmapData]:
    """
    Load a roadmap JSON file by pathId.
    Returns cached version if already loaded.
    """
    if path_id in _roadmap_cache:
        return _roadmap_cache[path_id]
    
    data_dir = get_data_dir()
    file_path = data_dir / f"{path_id}.json"
    
    if not file_path.exists():
        return None
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            raw = json.load(f)

        # Normalize potentially varying JSON formats to RoadmapData schema
        def _normalize(data: dict) -> dict:
            # Map top-level identifiers
            pathId = data.get("pathId") or data.get("id") or path_id
            pathTitle = data.get("pathTitle") or data.get("title") or (pathId.replace("-", " ").title())

            # Difficulty mapping if numeric
            def _map_difficulty(val):
                if isinstance(val, str):
                    return val
                mapping = {1: "beginner", 2: "intermediate", 3: "advanced"}
                return mapping.get(val, "beginner")

            nodes = []
            for n in data.get("nodes", []):
                nodes.append({
                    "id": n.get("id"),
                    "label": n.get("label") or n.get("title") or n.get("id"),
                    "status": n.get("status") or "next",
                    "category": n.get("category") or "General",
                    "difficulty": _map_difficulty(n.get("difficulty", "beginner")),
                    "estimatedMinutes": n.get("estimatedMinutes", 30),
                    "prerequisites": n.get("prerequisites") or [],
                    "tasks": n.get("tasks") or [],
                    "resources": n.get("resources") or [],
                })

            # Normalize edges if present
            raw_edges = data.get("edges") or []
            edges = []
            for e in raw_edges:
                if isinstance(e, dict):
                    if "source" in e and "target" in e:
                        edges.append({"source": e["source"], "target": e["target"]})
                    elif "from" in e and "to" in e:
                        edges.append({"source": e["from"], "target": e["to"]})

            return {
                "pathId": pathId,
                "pathTitle": pathTitle,
                "nodes": nodes,
                "edges": edges,
            }

        normalized = _normalize(raw)
        roadmap = RoadmapData(**normalized)

        # Generate edges from prerequisites if not present
        if not roadmap.edges:
            edges = []
            for node in roadmap.nodes:
                for prereq_id in node.prerequisites:
                    edges.append({"source": prereq_id, "target": node.id})
            roadmap.edges = edges

        _roadmap_cache[path_id] = roadmap
        return roadmap
    except Exception as e:
        print(f"Error loading roadmap {path_id}: {e}")
        return None

def clear_cache():
    """Clear the roadmap cache."""
    _roadmap_cache.clear()
