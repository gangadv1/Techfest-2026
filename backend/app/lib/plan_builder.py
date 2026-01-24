from typing import List
from app.models.roadmap import RoadmapNode, DayPlan, PlanItem, WeeklyPlan

def build_plan(
    nodes: List[RoadmapNode],
    node_levels: dict,
    minutes_per_day: int = 60
) -> WeeklyPlan:
    """
    Generate a 7-day plan by distributing tasks across days.
    
    Strategy:
    1. Sort nodes by level (foundation first)
    2. For each node, distribute its tasks across days
    3. Respect minutesPerDay limit
    4. Fill days in sequence
    """
    # Sort nodes by level then label
    sorted_nodes = sorted(nodes, key=lambda n: (node_levels.get(n.id, 0), n.label))
    
    # Initialize 7 days
    days: List[DayPlan] = [
        DayPlan(dayNumber=i+1, items=[], totalMinutes=0)
        for i in range(7)
    ]
    
    current_day_idx = 0
    
    for node in sorted_nodes:
        for task in node.tasks:
            task_minutes = task.estimatedMinutes or 30
            
            # Find a day that can fit this task
            attempts = 0
            while attempts < 7:
                day = days[current_day_idx]
                
                if day.totalMinutes + task_minutes <= minutes_per_day:
                    # Add task to this day
                    plan_item = PlanItem(
                        nodeId=node.id,
                        nodeLabel=node.label,
                        taskId=task.id,
                        taskText=task.text,
                        estimatedMinutes=task_minutes
                    )
                    day.items.append(plan_item)
                    day.totalMinutes += task_minutes
                    break
                else:
                    # Move to next day
                    current_day_idx = (current_day_idx + 1) % 7
                    attempts += 1
            
            # If we couldn't fit it in any day, add to current day anyway
            if attempts >= 7:
                plan_item = PlanItem(
                    nodeId=node.id,
                    nodeLabel=node.label,
                    taskId=task.id,
                    taskText=task.text,
                    estimatedMinutes=task_minutes
                )
                days[current_day_idx].items.append(plan_item)
                days[current_day_idx].totalMinutes += task_minutes
    
    return WeeklyPlan(days=days)
