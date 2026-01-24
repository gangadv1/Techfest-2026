from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.job import Job
from app.services.job_service import JobService

router = APIRouter()
job_service = JobService()

@router.get("", response_model=List[Job])
async def get_jobs(
    location: Optional[List[str]] = Query(None),
    employment_type: Optional[List[str]] = Query(None),
    experience_level: Optional[List[str]] = Query(None),
    sort_by: Optional[str] = Query("newest")
):
    """Get all jobs with optional filters"""
    filters = {
        "location": location,
        "employmentType": employment_type,
        "experienceLevel": experience_level,
        "sortBy": sort_by
    }
    return job_service.get_jobs(filters)

@router.get("/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """Get job by ID"""
    return job_service.get_job_by_id(job_id)
