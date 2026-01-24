from pydantic import BaseModel
from typing import List, Optional, Literal

# Resource models
class Resource(BaseModel):
    type: str  # youtube, coursera, reference
    title: str
    url: str
    note: Optional[str] = None

class TaskTemplate(BaseModel):
    id: str
    text: str
    estimatedMinutes: Optional[int] = 30

# Roadmap node models
class RoadmapNode(BaseModel):
    id: str
    label: str
    status: str = "next"
    category: str = "General"
    difficulty: str = "beginner"  # beginner, intermediate, advanced
    estimatedMinutes: int = 30
    prerequisites: List[str] = []
    tasks: List[TaskTemplate] = []
    resources: List[Resource] = []

class RoadmapEdge(BaseModel):
    source: str
    target: str

class RoadmapData(BaseModel):
    pathId: str
    pathTitle: str
    nodes: List[RoadmapNode]
    edges: List[RoadmapEdge] = []

# Graph response models
class GraphNode(BaseModel):
    id: str
    label: str
    level: int
    status: str
    category: str
    difficulty: str
    estimatedMinutes: int
    prerequisites: List[str]
    tasks: List[TaskTemplate]
    resources: List[Resource]
    status: Literal["matched", "missing", "next"] = "missing"

class GraphResponse(BaseModel):
    pathId: str
    pathTitle: str
    nodes: List[GraphNode]
    edges: List[RoadmapEdge]

# Plan models
class PlanGenerateRequest(BaseModel):
    userId: str = "demo"
    pathId: str
    hoursPerDay: float = 1.0
    daysPerWeek: int = 5
    days: int = 7
    maxNodes: int = 10
    targetGoal: Optional[str] = None

class PlanResource(BaseModel):
    type: str  # youtube, article, course, roadmap
    title: str
    url: str

class PlanTaskItem(BaseModel):
    nodeId: str
    nodeTitle: str
    taskId: str
    taskText: str
    minutes: int
    resources: List[PlanResource] = []

class DayPlan(BaseModel):
    day: int
    title: str
    totalMinutes: int
    items: List[PlanTaskItem]

class PlanEstimate(BaseModel):
    minutesPerDay: int
    daysPerWeek: int
    totalDaysGenerated: int
    totalMinutesPlanned: int

class PlanGenerateResponse(BaseModel):
    userId: str
    pathId: str
    estimate: PlanEstimate
    plan: List[DayPlan]

# Backward compatibility models for old streak/plan_builder code
class OldPlanItem(BaseModel):
    nodeId: str
    nodeLabel: str = ""
    title: str = ""
    taskId: str
    taskText: str = ""
    text: str = ""
    estimatedMinutes: int = 30
    minutes: int = 30

class OldDayPlan(BaseModel):
    dayNumber: int = 1
    day: int = 1
    totalMinutes: int
    items: List[OldPlanItem] = []

class OldWeeklyPlan(BaseModel):
    userId: str = "demo"
    pathId: str = ""
    days: List[OldDayPlan] = []

# Aliases
PlanItem = OldPlanItem
WeeklyPlan = OldWeeklyPlan

# Streak models
class CheckinRequest(BaseModel):
    userId: str = "demo"
    date: str  # YYYY-MM-DD

class StreakResponse(BaseModel):
    userId: str
    streak: int
    lastCheckInDate: str

class UserState(BaseModel):
    streak: int = 0
    lastCheckInDate: Optional[str] = None
    completedTaskIds: List[str] = []

class StateData(BaseModel):
    users: dict[str, UserState] = {}

# Dashboard models
class TodayTask(BaseModel):
    nodeId: str
    title: str
    taskId: str
    text: str
    completed: bool

class TodayData(BaseModel):
    date: str
    tasks: List[TodayTask]

class DashboardResponse(BaseModel):
    streak: int
    today: TodayData
    progress: dict  # {"completed": int, "total": int}
