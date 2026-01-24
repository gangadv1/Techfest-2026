from typing import List, Dict, Optional
from app.models.job import Job
import json

class JobService:
    def __init__(self):
        # Mock data - replace with actual database/CSV loading
        self.jobs = [
            Job(
                id="1",
                title="Senior Software Engineer",
                company="Tech Corp",
                location="Remote",
                datePosted="2026-01-20",
                workplaceModel="Remote",
                employmentType="Full-time",
                salary="$120k - $180k",
                description="We are looking for an experienced software engineer with strong Python and React skills...",
                extractedSkills=["Python", "React", "AWS", "Docker", "REST API"],
                extractedQualifications=["Bachelor's degree in CS", "5+ years experience"],
                extractedConstraints=["Must be authorized to work in US"]
            ),
            Job(
                id="2",
                title="Frontend Developer",
                company="StartupXYZ",
                location="New York",
                datePosted="2026-01-22",
                workplaceModel="Hybrid",
                employmentType="Full-time",
                salary="$90k - $130k",
                description="Join our team to build amazing user interfaces...",
                extractedSkills=["React", "TypeScript", "CSS", "JavaScript"],
                extractedQualifications=["3+ years frontend experience"],
                extractedConstraints=[]
            )
        ]
    
    def get_jobs(self, filters: Dict) -> List[Job]:
        """Get all jobs with optional filtering"""
        filtered_jobs = self.jobs
        
        # Apply filters
        if filters.get("location"):
            filtered_jobs = [j for j in filtered_jobs if j.location in filters["location"]]
        
        if filters.get("employmentType"):
            filtered_jobs = [j for j in filtered_jobs if j.employmentType in filters["employmentType"]]
        
        # Sort
        sort_by = filters.get("sortBy", "newest")
        if sort_by == "newest":
            filtered_jobs = sorted(filtered_jobs, key=lambda x: x.datePosted, reverse=True)
        
        return filtered_jobs
    
    def get_job_by_id(self, job_id: str) -> Optional[Job]:
        """Get a specific job by ID"""
        for job in self.jobs:
            if job.id == job_id:
                return job
        return None
