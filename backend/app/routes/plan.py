from fastapi import APIRouter, HTTPException
from app.lib.roadmap_loader import load_roadmap
from app.lib.selector import select_nodes
from app.lib.levels import compute_levels
from app.lib.plan_builder import build_plan
from app.models.roadmap import PlanGenerateRequest, WeeklyPlan

router = APIRouter()

@router.post("/generate", response_model=WeeklyPlan)
async def generate_plan(request: PlanGenerateRequest):
    """
    Generate a 7-day learning plan.
    
    Takes pathId, maxNodes, userSkills, minutesPerDay
    and creates a weekly plan distributing tasks.
    """
    # Load roadmap
    roadmap = load_roadmap(request.pathId)
    if not roadmap:
        raise HTTPException(status_code=404, detail=f"Roadmap '{request.pathId}' not found")
    
    # Parse user skills
    user_skill_list = request.userSkills or []
    
    # Select nodes
    selected_nodes = select_nodes(roadmap.nodes, request.maxNodes, user_skill_list)
    
    if not selected_nodes:
        raise HTTPException(status_code=400, detail="No nodes selected for plan generation")
    
    # Compute levels
    node_levels = compute_levels(selected_nodes)
    
    # Build plan
    plan = build_plan(selected_nodes, node_levels, request.minutesPerDay)
    
    return plan
