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
            data = json.load(f)
        
        roadmap = RoadmapData(**data)
        
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
