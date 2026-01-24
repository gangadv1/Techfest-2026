from fastapi import APIRouter, Query, HTTPException
from typing import List
from app.lib.roadmap_loader import load_roadmap
from app.lib.selector import select_nodes
from app.lib.levels import compute_levels
from app.models.roadmap import GraphResponse, GraphNode, RoadmapEdge

router = APIRouter()

@router.get("/graph", response_model=GraphResponse)
async def get_roadmap_graph(
    pathId: str = Query(..., description="The path ID (e.g., 'backend', 'frontend')"),
    maxNodes: int = Query(10, description="Maximum number of nodes to return"),
    userSkills: str = Query("", description="Comma-separated list of skills user already has")
):
    """
    Get the roadmap graph for visualization.
    
    Loads roadmap from JSON file, selects nodes intelligently,
    computes levels, and returns graph data.
    """
    # Load roadmap
    roadmap = load_roadmap(pathId)
    if not roadmap:
        raise HTTPException(status_code=404, detail=f"Roadmap '{pathId}' not found")
    
    # Parse user skills
    user_skill_list = [s.strip() for s in userSkills.split(",") if s.strip()] if userSkills else []
    
    # Select nodes
    selected_nodes = select_nodes(roadmap.nodes, maxNodes, user_skill_list)
    
    # Compute levels
    node_levels = compute_levels(selected_nodes)
    
    # Build graph nodes
    selected_ids = {n.id for n in selected_nodes}
    graph_nodes: List[GraphNode] = []
    
    for node in selected_nodes:
        graph_nodes.append(GraphNode(
            id=node.id,
            label=node.label,
            level=node_levels[node.id],
            status=node.status,
            category=node.category,
            difficulty=node.difficulty,
            estimatedMinutes=node.estimatedMinutes,
            prerequisites=node.prerequisites,
            tasks=node.tasks,
            resources=node.resources
        ))
    
    # Build edges (only between selected nodes)
    edges: List[RoadmapEdge] = []
    for node in selected_nodes:
        for prereq_id in node.prerequisites:
            if prereq_id in selected_ids:
                edges.append(RoadmapEdge(source=prereq_id, target=node.id))
    
    return GraphResponse(
        pathId=roadmap.pathId,
        pathTitle=roadmap.pathTitle,
        nodes=graph_nodes,
        edges=edges
    )
