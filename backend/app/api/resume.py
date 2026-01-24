from fastapi import APIRouter
from pydantic import BaseModel
from app.services.resume_service import ResumeService

router = APIRouter()
resume_service = ResumeService()

class ResumeScanRequest(BaseModel):
    jobId: str
    resumeText: str

class ResumeScanResponse(BaseModel):
    fitScore: int
    matchedSkills: list[str]
    missingSkills: list[str]
    recommendations: list[str]

@router.post("/scan", response_model=ResumeScanResponse)
async def scan_resume(request: ResumeScanRequest):
    """Analyze resume fit for a specific job"""
    return resume_service.analyze_fit(request.jobId, request.resumeText)
