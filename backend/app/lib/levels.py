from typing import Dict, List
from app.models.roadmap import RoadmapNode

def compute_levels(nodes: List[RoadmapNode]) -> Dict[str, int]:
    """
    Compute level for each node:
    level(node) = 0 if no prerequisites
    level(node) = 1 + max(level(prereq) for prereq in prerequisites)
    
    Uses topological sort to handle dependencies.
    """
    node_map = {n.id: n for n in nodes}
    levels: Dict[str, int] = {}
    visited: set = set()
    
    def compute(node_id: str) -> int:
        if node_id in levels:
            return levels[node_id]
        
        if node_id not in node_map:
            return 0  # External dependency
        
        if node_id in visited:
            # Circular dependency - assign level 0
            return 0
        
        visited.add(node_id)
        node = node_map[node_id]
        
        if not node.prerequisites:
            levels[node_id] = 0
        else:
            prereq_levels = [compute(prereq_id) for prereq_id in node.prerequisites]
            levels[node_id] = 1 + max(prereq_levels) if prereq_levels else 0
        
        visited.remove(node_id)
        return levels[node_id]
    
    for node in nodes:
        compute(node.id)
    
    return levels
