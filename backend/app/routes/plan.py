from fastapi import APIRouter, HTTPException
from app.lib.roadmap_loader import load_roadmap
from app.lib.roadmap_selector import select_nodes_for_plan
from app.lib.plan_generator import generate_plan_with_groq
from app.models.roadmap import PlanGenerateRequest, PlanGenerateResponse

router = APIRouter()

@router.post("/generate", response_model=PlanGenerateResponse)
async def generate_plan(request: PlanGenerateRequest):
    """
    Generate a personalized daily learning plan using Groq AI.
    
    Takes pathId, hoursPerDay, daysPerWeek, days and uses AI to create
    a realistic, actionable daily plan with specific tasks.
    """
    try:
        # Load roadmap
        roadmap = load_roadmap(request.pathId)
        if not roadmap:
            raise HTTPException(status_code=404, detail=f"Roadmap '{request.pathId}' not found")
        
        # Select optimal nodes for planning
        selected_nodes = select_nodes_for_plan(
            roadmap.nodes,
            max_nodes=request.maxNodes,
            user_skills=[]
        )
        
        if not selected_nodes:
            raise HTTPException(status_code=400, detail="No nodes available for plan generation")
        
        # Generate plan using Groq AI
        plan_result = await generate_plan_with_groq(
            nodes=selected_nodes,
            hours_per_day=request.hoursPerDay,
            days_per_week=request.daysPerWeek,
            days=request.days,
            user_id=request.userId,
            path_id=request.pathId,
        )
        
        if not plan_result:
            raise HTTPException(status_code=500, detail="Failed to generate plan with AI - check server logs for details")
        
        return PlanGenerateResponse(**plan_result)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in generate_plan endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
