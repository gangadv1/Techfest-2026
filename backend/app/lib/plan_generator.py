"""Generate learning plan using Groq AI."""
import json
from typing import List, Dict, Any, Optional
from app.models.roadmap import RoadmapNode
from app.lib.groq_client import call_groq_json

def build_groq_prompt(
    nodes: List[RoadmapNode],
    hours_per_day: float,
    days_per_week: int,
    days: int,
) -> tuple[str, str]:
    """
    Build system and user prompts for Groq to generate a learning plan.
    """
    minutes_per_day = int(hours_per_day * 60)
    
    # Build node summaries for Groq
    node_summaries = []
    for node in nodes:
        resources_str = ""
        if node.resources:
            top_resources = node.resources[:3]
            resources_str = ", ".join([f"{r.type}: {r.title}" for r in top_resources])
        
        prereqs_str = ", ".join(node.prerequisites) if node.prerequisites else "None"
        
        node_summaries.append({
            "id": node.id,
            "title": node.label,
            "difficulty": node.difficulty,
            "estimatedMinutes": node.estimatedMinutes,
            "prerequisites": prereqs_str,
            "resources": resources_str,
            "category": node.category,
        })
    
    system_prompt = """You are an expert career coach and curriculum designer. 
Your task is to generate a realistic, actionable daily learning plan.

Requirements:
1. Output STRICT JSON only (no markdown, no explanations)
2. Each task must be specific and actionable (e.g., "Watch X video and write 5 key notes")
3. Each task should include 1-2 resources from the provided node resources
4. Daily total minutes must NOT exceed the user's daily limit
5. Tasks should be small (15-40 minutes each)
6. Follow prerequisite order when possible
7. Make it feel achievable and NOT overwhelming

Output JSON schema:
{
  "plan": [
    {
      "day": 1,
      "title": "Foundation Setup",
      "totalMinutes": 60,
      "items": [
        {
          "nodeId": "node-id-from-list",
          "nodeTitle": "Node Title",
          "taskId": "unique-task-id",
          "taskText": "Specific actionable task description",
          "minutes": 25,
          "resources": [
            {"type": "youtube|article|course", "title": "Resource Title", "url": "https://..."}
          ]
        }
      ]
    }
  ]
}"""

    user_prompt = f"""Generate a {days}-day learning plan with these constraints:

User Commitment:
- {hours_per_day} hours per day ({minutes_per_day} minutes)
- {days_per_week} days per week
- Total of {days} days to generate

Available Roadmap Nodes:
{json.dumps(node_summaries, indent=2)}

Rules:
- Each day's total minutes must be <= {minutes_per_day}
- Each task must reference a nodeId from the list above
- Each task should be 15-40 minutes
- Include at least 1 resource per task (extract from node resources or suggest relevant ones)
- Make tasks specific (e.g., "Watch intro video + take 5 notes on HTTP basics")
- Follow prerequisites: if a node has prereqs, plan those first

Return ONLY the JSON (no markdown blocks, no extra text)."""

    return system_prompt, user_prompt


async def generate_plan_with_groq(
    nodes: List[RoadmapNode],
    hours_per_day: float,
    days_per_week: int,
    days: int = 7,
    user_id: str = "demo",
    path_id: str = "full-stack",
) -> Optional[Dict[str, Any]]:
    """
    Generate a learning plan using Groq AI.
    
    Returns a structured plan dict or None on error.
    """
    try:
        system_prompt, user_prompt = build_groq_prompt(nodes, hours_per_day, days_per_week, days)
        
        # Call Groq API
        groq_response = await call_groq_json(system_prompt, user_prompt)
        
        if not groq_response or "plan" not in groq_response:
            # Retry with stricter prompt
            print("First attempt failed, retrying with stricter prompt...")
            user_prompt += "\n\nIMPORTANT: Return ONLY valid JSON starting with { and ending with }. No markdown."
            groq_response = await call_groq_json(system_prompt, user_prompt)
            
            if not groq_response or "plan" not in groq_response:
                print(f"Error: Groq returned invalid response: {groq_response}")
                return None
        
        # Validate and clean the plan
        plan_days = groq_response.get("plan", [])
        minutes_per_day = int(hours_per_day * 60)
        
        # Validate each day
        valid_node_ids = {n.id for n in nodes}
        cleaned_plan = []
        
        for day_data in plan_days:
            if not isinstance(day_data, dict):
                continue
            
            day_items = day_data.get("items", [])
            valid_items = []
            day_total = 0
            
            for item in day_items:
                # Validate nodeId
                if item.get("nodeId") not in valid_node_ids:
                    continue
                
                # Check if adding this item exceeds limit
                item_minutes = item.get("minutes", 30)
                if day_total + item_minutes > minutes_per_day:
                    # Try to fit a smaller task
                    if day_total < minutes_per_day * 0.8:  # 80% filled is okay
                        item["minutes"] = minutes_per_day - day_total
                        valid_items.append(item)
                        day_total += item["minutes"]
                    break
                
                valid_items.append(item)
                day_total += item_minutes
            
            if valid_items:
                cleaned_plan.append({
                    "day": day_data.get("day", len(cleaned_plan) + 1),
                    "title": day_data.get("title", f"Day {len(cleaned_plan) + 1}"),
                    "totalMinutes": day_total,
                    "items": valid_items,
                })
        
        # Build final response
        total_minutes = sum(d["totalMinutes"] for d in cleaned_plan)
        
        return {
            "userId": user_id,
            "pathId": path_id,
            "estimate": {
                "minutesPerDay": minutes_per_day,
                "daysPerWeek": days_per_week,
                "totalDaysGenerated": len(cleaned_plan),
                "totalMinutesPlanned": total_minutes,
            },
            "plan": cleaned_plan,
        }
    except Exception as e:
        print(f"Error in generate_plan_with_groq: {e}")
        import traceback
        traceback.print_exc()
        return None
