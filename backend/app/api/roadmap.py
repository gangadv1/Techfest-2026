from fastapi import APIRouter, Query
from typing import List, Optional

router = APIRouter()

# Demo data for roadmap graph
DEMO_ROADMAPS = {
    "full-stack": {
        "pathId": "full-stack",
        "pathTitle": "Full-Stack",
        "nodes": [
            {
                "id": "internet",
                "label": "How the Internet Works",
                "level": 0,
                "status": "matched",
                "category": "Fundamentals",
                "estimatedMinutes": 30,
                "prerequisites": [],
                "tasks": [
                    {"id": "t1", "text": "Understand HTTP/HTTPS protocols"},
                    {"id": "t2", "text": "Learn about DNS and domain names"},
                ],
                "resources": [
                    {"type": "youtube", "title": "How the Internet Works", "url": "https://youtube.com/watch?v=x3c1ih2NJEg"},
                ]
            },
            {
                "id": "html",
                "label": "HTML Fundamentals",
                "level": 1,
                "status": "matched",
                "category": "Frontend",
                "estimatedMinutes": 45,
                "prerequisites": ["internet"],
                "tasks": [
                    {"id": "t3", "text": "Learn semantic HTML5 tags"},
                    {"id": "t4", "text": "Practice with forms and inputs"},
                    {"id": "t5", "text": "Build a simple webpage"},
                ],
                "resources": [
                    {"type": "youtube", "title": "HTML Crash Course", "url": "https://youtube.com/watch?v=UB1O30fR-EE"},
                    {"type": "coursera", "title": "HTML, CSS, and Javascript for Web Developers", "url": "https://www.coursera.org/learn/html-css-javascript-for-web-developers"},
                ]
            },
            {
                "id": "css",
                "label": "CSS & Styling",
                "level": 1,
                "status": "matched",
                "category": "Frontend",
                "estimatedMinutes": 50,
                "prerequisites": ["internet"],
                "tasks": [
                    {"id": "t6", "text": "Master Flexbox and Grid layouts"},
                    {"id": "t7", "text": "Learn responsive design principles"},
                    {"id": "t8", "text": "Style a complete webpage"},
                ],
                "resources": [
                    {"type": "youtube", "title": "CSS Complete Guide", "url": "https://youtube.com/watch?v=1Rs2ND1ryYc"},
                ]
            },
            {
                "id": "javascript",
                "label": "JavaScript",
                "level": 2,
                "status": "missing",
                "category": "Frontend",
                "estimatedMinutes": 90,
                "prerequisites": ["html", "css"],
                "tasks": [
                    {"id": "t9", "text": "Learn ES6+ syntax"},
                    {"id": "t10", "text": "Understand async/await and promises"},
                    {"id": "t11", "text": "Build interactive features"},
                ],
                "resources": [
                    {"type": "youtube", "title": "JavaScript Full Course", "url": "https://youtube.com/watch?v=PkZNo7MFNFg"},
                    {"type": "coursera", "title": "JavaScript for Beginners", "url": "https://www.coursera.org/specializations/javascript-beginner"},
                ]
            },
            {
                "id": "react",
                "label": "React",
                "level": 3,
                "status": "next",
                "category": "Frontend",
                "estimatedMinutes": 120,
                "prerequisites": ["javascript"],
                "tasks": [
                    {"id": "t12", "text": "Learn component basics and props"},
                    {"id": "t13", "text": "Master hooks (useState, useEffect)"},
                    {"id": "t14", "text": "Build a todo app with React"},
                ],
                "resources": [
                    {"type": "youtube", "title": "React Course for Beginners", "url": "https://youtube.com/watch?v=bMknfKXIFA8"},
                    {"type": "roadmap", "title": "React Developer Roadmap", "url": "https://roadmap.sh/react"},
                ]
            },
            {
                "id": "nodejs",
                "label": "Node.js",
                "level": 2,
                "status": "missing",
                "category": "Backend",
                "estimatedMinutes": 80,
                "prerequisites": ["javascript"],
                "tasks": [
                    {"id": "t15", "text": "Understand Node.js runtime"},
                    {"id": "t16", "text": "Learn npm and package management"},
                    {"id": "t17", "text": "Build a simple REST API"},
                ],
                "resources": [
                    {"type": "youtube", "title": "Node.js Tutorial", "url": "https://youtube.com/watch?v=TlB_eWDSMt4"},
                ]
            },
            {
                "id": "express",
                "label": "Express.js",
                "level": 3,
                "status": "next",
                "category": "Backend",
                "estimatedMinutes": 60,
                "prerequisites": ["nodejs"],
                "tasks": [
                    {"id": "t18", "text": "Learn routing and middleware"},
                    {"id": "t19", "text": "Handle requests and responses"},
                    {"id": "t20", "text": "Build a CRUD API"},
                ],
                "resources": [
                    {"type": "youtube", "title": "Express.js Crash Course", "url": "https://youtube.com/watch?v=L72fhGm1tfE"},
                ]
            },
            {
                "id": "database",
                "label": "Databases (SQL/NoSQL)",
                "level": 3,
                "status": "next",
                "category": "Backend",
                "estimatedMinutes": 100,
                "prerequisites": ["nodejs"],
                "tasks": [
                    {"id": "t21", "text": "Learn SQL basics (PostgreSQL)"},
                    {"id": "t22", "text": "Understand MongoDB basics"},
                    {"id": "t23", "text": "Design a database schema"},
                ],
                "resources": [
                    {"type": "youtube", "title": "SQL Tutorial", "url": "https://youtube.com/watch?v=HXV3zeQKqGY"},
                    {"type": "coursera", "title": "Introduction to Databases", "url": "https://www.coursera.org/learn/introduction-to-databases"},
                ]
            },
        ],
        "edges": [
            {"source": "internet", "target": "html"},
            {"source": "internet", "target": "css"},
            {"source": "html", "target": "javascript"},
            {"source": "css", "target": "javascript"},
            {"source": "javascript", "target": "react"},
            {"source": "javascript", "target": "nodejs"},
            {"source": "nodejs", "target": "express"},
            {"source": "nodejs", "target": "database"},
        ]
    },
    "data": {
        "pathId": "data",
        "pathTitle": "Data Science",
        "nodes": [
            {
                "id": "python-basics",
                "label": "Python Basics",
                "level": 0,
                "status": "matched",
                "category": "Programming",
                "estimatedMinutes": 60,
                "prerequisites": [],
                "tasks": [
                    {"id": "d1", "text": "Learn Python syntax and data types"},
                    {"id": "d2", "text": "Practice with loops and functions"},
                ],
                "resources": [
                    {"type": "youtube", "title": "Python for Beginners", "url": "https://youtube.com/watch?v=rfscVS0vtbw"},
                ]
            },
            {
                "id": "numpy",
                "label": "NumPy",
                "level": 1,
                "status": "missing",
                "category": "Data Analysis",
                "estimatedMinutes": 45,
                "prerequisites": ["python-basics"],
                "tasks": [
                    {"id": "d3", "text": "Learn array operations"},
                    {"id": "d4", "text": "Practice matrix manipulations"},
                ],
                "resources": [
                    {"type": "youtube", "title": "NumPy Tutorial", "url": "https://youtube.com/watch?v=QUT1VHiLmmI"},
                ]
            },
            {
                "id": "pandas",
                "label": "Pandas",
                "level": 1,
                "status": "missing",
                "category": "Data Analysis",
                "estimatedMinutes": 60,
                "prerequisites": ["python-basics"],
                "tasks": [
                    {"id": "d5", "text": "Learn DataFrame operations"},
                    {"id": "d6", "text": "Data cleaning and preprocessing"},
                ],
                "resources": [
                    {"type": "youtube", "title": "Pandas Tutorial", "url": "https://youtube.com/watch?v=vmEHCJofslg"},
                ]
            },
        ],
        "edges": [
            {"source": "python-basics", "target": "numpy"},
            {"source": "python-basics", "target": "pandas"},
        ]
    }
}

@router.get("/graph")
async def get_roadmap_graph(
    pathId: str = Query("full-stack", description="Path ID like full-stack, data, etc."),
    maxNodes: int = Query(18, description="Maximum number of nodes to return")
):
    """
    Get roadmap graph data for visualization with React Flow.
    Returns nodes with tasks, resources, and edges for connections.
    """
    # Get the roadmap or return a default
    roadmap = DEMO_ROADMAPS.get(pathId, DEMO_ROADMAPS["full-stack"])
    
    # Limit nodes if needed
    nodes = roadmap["nodes"][:maxNodes]
    
    # Filter edges to only include nodes that exist
    node_ids = {n["id"] for n in nodes}
    edges = [e for e in roadmap["edges"] if e["source"] in node_ids and e["target"] in node_ids]
    
    return {
        "pathId": roadmap["pathId"],
        "pathTitle": roadmap["pathTitle"],
        "nodes": nodes,
        "edges": edges
    }
