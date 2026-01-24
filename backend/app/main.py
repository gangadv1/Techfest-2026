from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import jobs, resume, applications, interview
from app.routes import roadmap, plan, streak
from app.core.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobFit API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(plan.router, prefix="/api/plan", tags=["plan"])
app.include_router(streak.router, prefix="/api/streak", tags=["streak"])

@app.get("/")
async def root():
    return {"message": "JobFit API - Career Platform Backend"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
