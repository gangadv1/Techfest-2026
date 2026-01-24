from typing import List, Set
from app.models.roadmap import RoadmapNode

def select_nodes(
    all_nodes: List[RoadmapNode],
    max_nodes: int,
    user_skills: List[str]
) -> List[RoadmapNode]:
    """
    Select exactly maxNodes nodes intelligently:
    1. Include all prerequisites of selected nodes
    2. Prioritize foundation topics (few/no prerequisites)
    3. Prioritize lower difficulty
    4. Avoid selecting nodes user already has
    """
    # Filter out nodes user already has
    available_nodes = [n for n in all_nodes if n.label not in user_skills]
    
    if len(available_nodes) <= max_nodes:
        return available_nodes
    
    # Create node map for quick lookup
    node_map = {n.id: n for n in all_nodes}
    
    # Sort by: number of prerequisites (asc), difficulty (asc), label
    def sort_key(node: RoadmapNode):
        difficulty_order = {"beginner": 0, "intermediate": 1, "advanced": 2}
        return (
            len(node.prerequisites),
            difficulty_order.get(node.difficulty, 1),
            node.label
        )
    
    candidates = sorted(available_nodes, key=sort_key)
    
    selected_ids: Set[str] = set()
    selected_nodes: List[RoadmapNode] = []
    
    def add_with_prerequisites(node_id: str):
        """Recursively add a node and all its prerequisites."""
        if node_id in selected_ids or node_id not in node_map:
            return
        
        node = node_map[node_id]
        
        # Add prerequisites first
        for prereq_id in node.prerequisites:
            add_with_prerequisites(prereq_id)
        
        # Add this node
        if node_id not in selected_ids:
            selected_ids.add(node_id)
            selected_nodes.append(node)
    
    # Greedily pick candidates until we reach maxNodes
    for candidate in candidates:
        if len(selected_ids) >= max_nodes:
            break
        
        # Check if adding this node (with prerequisites) would exceed limit
        temp_selected = selected_ids.copy()
        
        def count_needed_prereqs(node_id: str) -> int:
            if node_id in temp_selected or node_id not in node_map:
                return 0
            temp_selected.add(node_id)
            count = 1
            for prereq_id in node_map[node_id].prerequisites:
                count += count_needed_prereqs(prereq_id)
            return count
        
        needed = count_needed_prereqs(candidate.id)
        
        if len(selected_ids) + needed <= max_nodes:
            add_with_prerequisites(candidate.id)
    
    return selected_nodes
