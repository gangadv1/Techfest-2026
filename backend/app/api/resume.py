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

class GeneralResumeScanRequest(BaseModel):
    resumeText: str
    extractedSkills: list[str] = []
    industry: str = "software"

class GeneralResumeScanResponse(BaseModel):
    metrics: dict
    resumeSkills: list[str]
    missingTopKeywords: list[str]
    strengths: list[str]
    weaknesses: list[str]

@router.post("/scan", response_model=ResumeScanResponse)
async def scan_resume(request: ResumeScanRequest):
    """Analyze resume fit for a specific job"""
    return resume_service.analyze_fit(request.jobId, request.resumeText)

@router.post("/analyze", response_model=GeneralResumeScanResponse)
async def analyze_resume(request: GeneralResumeScanRequest):
    """General resume analysis for a specific industry/role"""
    return resume_service.analyze_resume(request.resumeText, request.extractedSkills, request.industry)
