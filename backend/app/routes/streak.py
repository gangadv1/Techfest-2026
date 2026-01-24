from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.lib.state_store import checkin, get_user_state, read_state
from app.lib.plan_builder import build_plan
from app.lib.roadmap_loader import load_roadmap
from app.lib.selector import select_nodes
from app.lib.levels import compute_levels
from app.models.roadmap import (
    CheckinRequest,
    StreakResponse,
    DashboardResponse,
    TodayData,
    TodayTask
)

router = APIRouter()

@router.post("/checkin", response_model=StreakResponse)
async def check_in(request: CheckinRequest):
    """
    Check in for today. Updates streak.
    """
    user_state = checkin(request.userId)
    
    return StreakResponse(
        currentStreak=user_state.currentStreak,
        longestStreak=user_state.longestStreak,
        lastCheckin=user_state.lastCheckin,
        totalCheckins=user_state.totalCheckins
    )

@router.get("/dashboard/today", response_model=DashboardResponse)
async def get_today_dashboard(
    userId: str,
    pathId: str,
    maxNodes: int = 10,
    userSkills: str = "",
    minutesPerDay: int = 60
):
    """
    Get today's tasks and streak for dashboard.
    
    Generates a plan and returns tasks for the current day.
    """
    # Get user state for streak
    user_state = get_user_state(userId)
    
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
    
    # Build plan
    plan = build_plan(selected_nodes, node_levels, minutesPerDay)
    
    # Determine which day we're on (use current day of week, 1-7 for Mon-Sun)
    current_day_of_week = datetime.now().isoweekday()  # Monday = 1, Sunday = 7
    
    # Get tasks for today
    today_plan = None
    for day in plan.days:
        if day.dayNumber == current_day_of_week:
            today_plan = day
            break
    
    # If no match, use first day
    if not today_plan and plan.days:
        today_plan = plan.days[0]
    
    today_tasks = []
    if today_plan:
        for item in today_plan.items:
            today_tasks.append(TodayTask(
                nodeId=item.nodeId,
                nodeLabel=item.nodeLabel,
                taskId=item.taskId,
                taskText=item.taskText,
                estimatedMinutes=item.estimatedMinutes
            ))
    
    return DashboardResponse(
        streak=StreakResponse(
            currentStreak=user_state.currentStreak,
            longestStreak=user_state.longestStreak,
            lastCheckin=user_state.lastCheckin,
            totalCheckins=user_state.totalCheckins
        ),
        today=TodayData(
            dayNumber=today_plan.dayNumber if today_plan else 1,
            tasks=today_tasks,
            totalMinutes=today_plan.totalMinutes if today_plan else 0
        )
    )
