# Roadmap Backend - Complete Implementation

## Overview
Built a comprehensive FastAPI backend system for learning roadmap visualization, plan generation, and streak tracking.

## Architecture

### Models (`app/models/roadmap.py`)
Pydantic models for the entire system:
- **Roadmap Data Models**: `Resource`, `TaskTemplate`, `RoadmapNode`, `RoadmapEdge`, `RoadmapData`
- **Graph API Models**: `GraphNode`, `GraphResponse`
- **Plan Models**: `PlanGenerateRequest`, `PlanItem`, `DayPlan`, `WeeklyPlan`
- **Streak Models**: `CheckinRequest`, `StreakResponse`, `UserState`, `StateData`
- **Dashboard Models**: `TodayTask`, `TodayData`, `DashboardResponse`

### Library Utilities (`app/lib/`)

#### `roadmap_loader.py`
- Loads roadmap JSON files from `backend/data/roadmaps/{pathId}.json`
- Caches loaded roadmaps in memory
- Auto-generates edges from prerequisites if not present
- **Key Function**: `load_roadmap(path_id: str) -> Optional[RoadmapData]`

#### `selector.py`
- Intelligently selects exactly `maxNodes` nodes from roadmap
- Prioritizes:
  1. Foundation topics (fewer prerequisites)
  2. Lower difficulty levels
  3. Alphabetical order
- Ensures all prerequisites of selected nodes are included
- Filters out skills user already has
- **Key Function**: `select_nodes(all_nodes, max_nodes, user_skills) -> List[RoadmapNode]`

#### `levels.py`
- Computes hierarchical level for each node based on prerequisite depth
- Formula: `level(node) = 0` if no prerequisites, else `1 + max(level(prereq))`
- Uses topological sort to handle dependencies
- Handles circular dependencies gracefully
- **Key Function**: `compute_levels(nodes) -> Dict[str, int]`

#### `plan_builder.py`
- Generates 7-day learning plan distributing tasks across days
- Respects `minutesPerDay` limit for each day
- Sorts nodes by level (foundation first) before distributing
- Tries to fit tasks optimally across days
- **Key Function**: `build_plan(nodes, node_levels, minutes_per_day) -> WeeklyPlan`

#### `state_store.py`
- Manages user state persistence in `backend/data/state.json`
- Implements file locking (cross-platform: Windows msvcrt, Unix fcntl)
- Tracks streak logic:
  - Increment if checked in yesterday
  - Reset if gap > 1 day
  - No change if already checked in today
- **Key Functions**: 
  - `get_user_state(user_id) -> UserState`
  - `checkin(user_id) -> UserState`
  - `read_state()`, `write_state()`

### API Routes

#### `routes/roadmap.py` - `/api/roadmap/graph`
GET endpoint for roadmap graph visualization.

**Query Parameters**:
- `pathId` (required): Roadmap identifier (e.g., "full-stack", "data")
- `maxNodes` (optional, default 10): Maximum nodes to return
- `userSkills` (optional): Comma-separated list of skills to exclude

**Response**: `GraphResponse` with nodes and edges

**Process**:
1. Load roadmap from JSON file
2. Select nodes intelligently
3. Compute levels for visualization
4. Build graph nodes with all metadata
5. Generate edges between selected nodes

#### `routes/plan.py` - `/api/plan/generate`
POST endpoint for generating weekly learning plans.

**Request Body**: `PlanGenerateRequest`
```json
{
  "pathId": "full-stack",
  "maxNodes": 10,
  "userSkills": ["Python", "HTML"],
  "minutesPerDay": 60
}
```

**Response**: `WeeklyPlan` with 7 days of tasks

**Process**:
1. Load and select nodes
2. Compute levels
3. Build 7-day plan distributing tasks

#### `routes/streak.py` - Streak & Dashboard Endpoints

**POST `/api/streak/checkin`**
- Records daily check-in for a user
- Updates streak logic
- Returns current and longest streak

**GET `/api/streak/dashboard/today`**
- Returns streak info + today's tasks
- Generates plan on-the-fly
- Determines current day (1-7 for Mon-Sun)
- Returns tasks for today from the plan

## Data Files

### Roadmap JSON Structure
Located in `backend/data/roadmaps/{pathId}.json`

Example: `full-stack.json`
```json
{
  "pathId": "full-stack",
  "pathTitle": "Full-Stack Development",
  "nodes": [
    {
      "id": "internet",
      "label": "How the Internet Works",
      "status": "next",
      "category": "Fundamentals",
      "difficulty": "beginner",
      "estimatedMinutes": 60,
      "prerequisites": [],
      "tasks": [
        {
          "id": "t1",
          "text": "Understand HTTP/HTTPS protocols",
          "estimatedMinutes": 20
        }
      ],
      "resources": [
        {
          "type": "youtube",
          "title": "How the Internet Works",
          "url": "https://youtube.com/..."
        }
      ]
    }
  ],
  "edges": []
}
```

**Sample Roadmaps Created**:
- `full-stack.json` - 12 nodes covering web development
- `data.json` - 8 nodes covering data science and analytics

### State JSON Structure
Located in `backend/data/state.json`

```json
{
  "users": {
    "user123": {
      "userId": "user123",
      "currentStreak": 5,
      "longestStreak": 10,
      "lastCheckin": "2024-01-15",
      "totalCheckins": 42
    }
  }
}
```

## Key Features

### 1. Intelligent Node Selection
- **Priority System**: Foundation topics (low prerequisite count) selected first
- **Difficulty Awareness**: Prefers beginner → intermediate → advanced progression
- **Prerequisite Inclusion**: Automatically includes all prerequisites of selected nodes
- **Skill Filtering**: Excludes nodes for skills user already has
- **Exact Count**: Returns exactly `maxNodes` nodes (or fewer if roadmap is small)

### 2. Hierarchical Level Computation
- **Graph-Based**: Uses prerequisite relationships to compute depth
- **Topological Sort**: Handles complex dependency graphs
- **Cycle Handling**: Gracefully handles circular dependencies
- **Visualization Ready**: Levels directly usable for graph layout

### 3. Weekly Plan Generation
- **7-Day Distribution**: Spreads tasks across the week
- **Time-Aware**: Respects daily time budgets (minutesPerDay)
- **Foundation-First**: Sorts by level before distributing
- **Optimal Packing**: Tries to fit tasks efficiently within daily limits

### 4. Gamified Streak System
- **Daily Check-Ins**: Users can check in once per day
- **Streak Logic**: 
  - Yesterday check-in → increment
  - Gap > 1 day → reset to 1
  - Same day → no change
- **Persistent State**: File-based storage with locking
- **Cross-Platform**: Works on Windows (msvcrt) and Unix (fcntl)

### 5. Dashboard Integration
- **Today's Focus**: Shows tasks for current day of week
- **Streak Display**: Current and longest streaks
- **On-Demand Generation**: Generates plan dynamically based on user progress

## API Usage Examples

### Get Roadmap Graph
```bash
GET /api/roadmap/graph?pathId=full-stack&maxNodes=10&userSkills=HTML,CSS
```

Returns 10 nodes (excluding HTML/CSS) with their levels, tasks, resources, and edges.

### Generate Learning Plan
```bash
POST /api/plan/generate
Content-Type: application/json

{
  "pathId": "data",
  "maxNodes": 8,
  "userSkills": ["Python"],
  "minutesPerDay": 90
}
```

Returns 7-day plan with tasks distributed across the week.

### Check In for Streak
```bash
POST /api/streak/checkin
Content-Type: application/json

{
  "userId": "user123"
}
```

Returns updated streak information.

### Get Dashboard
```bash
GET /api/streak/dashboard/today?userId=user123&pathId=full-stack&maxNodes=10&minutesPerDay=60
```

Returns today's tasks + streak info for dashboard display.

## File Structure
```
backend/
├── app/
│   ├── lib/
│   │   ├── __init__.py
│   │   ├── roadmap_loader.py    # JSON loading & caching
│   │   ├── selector.py          # Intelligent node selection
│   │   ├── levels.py            # Level computation algorithm
│   │   ├── plan_builder.py      # 7-day plan generator
│   │   └── state_store.py       # Streak state persistence
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── roadmap.py           # Graph endpoint
│   │   ├── plan.py              # Plan generation
│   │   └── streak.py            # Streak & dashboard
│   ├── models/
│   │   ├── __init__.py
│   │   └── roadmap.py           # All Pydantic models
│   └── main.py                  # FastAPI app with routers
└── data/
    ├── roadmaps/
    │   ├── full-stack.json      # 12-node full-stack roadmap
    │   └── data.json            # 8-node data science roadmap
    └── state.json               # User streak state
```

## Integration with Frontend

The frontend React Flow graph page (`RoadmapGraph.tsx`) connects to:
- **GET /api/roadmap/graph** - Fetches nodes and edges for visualization
- Passes `pathId` from URL params and `maxNodes` query
- Can pass `userSkills` from localStorage

Future dashboard integration can use:
- **POST /api/streak/checkin** - When user completes daily tasks
- **GET /api/streak/dashboard/today** - For dashboard display

## Next Steps

1. **Frontend Integration**: 
   - Update Dashboard.tsx to use new plan/streak endpoints
   - Add check-in button after task completion
   - Display streak counter

2. **Enhanced Features**:
   - User skill auto-detection from completed tasks
   - Progress tracking per node
   - Recommendation engine for next skills

3. **Data Expansion**:
   - Add more roadmap JSON files (backend.json, ml.json, etc.)
   - Richer task content and resources
   - Video timestamps, practice problems

4. **Performance**:
   - Redis caching for hot roadmaps
   - Database migration from JSON files
   - Batch operations for multiple users
