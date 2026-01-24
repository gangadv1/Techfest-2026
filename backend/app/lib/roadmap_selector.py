"""Select optimal nodes from roadmap for plan generation."""
from typing import List
from app.models.roadmap import RoadmapNode

def select_nodes_for_plan(
    nodes: List[RoadmapNode],
    max_nodes: int = 10,
    user_skills: List[str] = None
) -> List[RoadmapNode]:
    """
    Select up to max_nodes from the roadmap for plan generation.
    
    Strategy:
    1. Filter out nodes already matched (if status tracking exists)
    2. Build prerequisite graph
    3. Sort by difficulty (beginner first)
    4. Include prerequisites of selected nodes
    5. Return final list up to max_nodes
    """
    user_skills = user_skills or []
    user_skills_lower = [s.lower() for s in user_skills]
    
    # Filter nodes that are not already completed
    available_nodes = [n for n in nodes if n.status != "matched"]
    
    if not available_nodes:
        # If all matched, just return first max_nodes
        return nodes[:max_nodes]
    
    # Sort by difficulty: beginner -> intermediate -> advanced
    difficulty_order = {"beginner": 0, "intermediate": 1, "advanced": 2}
    sorted_nodes = sorted(
        available_nodes,
        key=lambda n: (difficulty_order.get(n.difficulty, 1), n.estimatedMinutes)
    )
    
    # Select initial candidates (prioritize those with fewer prereqs)
    candidates = sorted_nodes[:max_nodes * 2]  # Take more to filter with prereqs
    
    # Build a set of all needed prerequisite IDs
    selected_ids = set()
    needed_prereqs = set()
    
    for node in candidates[:max_nodes]:
        selected_ids.add(node.id)
        for prereq_id in node.prerequisites:
            needed_prereqs.add(prereq_id)
    
    # Add prerequisite nodes if not already selected
    node_map = {n.id: n for n in nodes}
    final_nodes = []
    
    # First add prerequisites
    for prereq_id in needed_prereqs:
        if prereq_id in node_map and prereq_id not in selected_ids:
            final_nodes.append(node_map[prereq_id])
            selected_ids.add(prereq_id)
            if len(final_nodes) >= max_nodes:
                break
    
    # Then add main candidates
    for node in candidates:
        if node.id in selected_ids and node not in final_nodes:
            final_nodes.append(node)
        elif node.id not in selected_ids:
            final_nodes.append(node)
            selected_ids.add(node.id)
        
        if len(final_nodes) >= max_nodes:
            break
    
    return final_nodes[:max_nodes]
