from typing import List, Dict, Optional
from app.models.job import Job
from app.models.database_models import JobModel
from app.core.database import SessionLocal
import json

class JobService:
    def __init__(self):
        """Initialize job service with database connection"""
        self.db = SessionLocal()
    
    def _db_job_to_pydantic(self, db_job: JobModel) -> Job:
        """Convert database JobModel to Pydantic Job"""
        def safe_split(val):
            if not val:
                return []
            return [s.strip() for s in str(val).split(',') if s.strip()]
        
        return Job(
            id=db_job.id,
            title=db_job.title,
            company=db_job.company,
            location=db_job.location,
            datePosted=db_job.datePosted or '',
            workplaceModel=db_job.workplaceModel or '',
            employmentType=db_job.employmentType or '',
            salary=db_job.salary or '',
            description=db_job.description or '',
            extractedSkills=safe_split(db_job.extractedSkills),
            extractedQualifications=safe_split(db_job.extractedQualifications),
            extractedConstraints=safe_split(db_job.extractedConstraints),
            category=db_job.category,
            visaEligible=db_job.visaEligible
        )
    
    def get_jobs(self, filters: Dict) -> List[Job]:
        """Get all jobs with optional filtering"""
        try:
            query = self.db.query(JobModel)
            
            # Apply filters
            if filters.get("location") and filters["location"]:
                query = query.filter(JobModel.location.in_(filters["location"]))
            
            if filters.get("employmentType") and filters["employmentType"]:
                query = query.filter(JobModel.employmentType.in_(filters["employmentType"]))
            
            if filters.get("category") and filters["category"]:
                query = query.filter(JobModel.category.in_(filters["category"]))
            
            # Sort
            sort_by = filters.get("sortBy", "newest")
            if sort_by == "newest":
                query = query.order_by(JobModel.datePosted.desc())
            elif sort_by == "oldest":
                query = query.order_by(JobModel.datePosted.asc())
            elif sort_by == "company":
                query = query.order_by(JobModel.company.asc())
            
            # Execute query and convert results
            db_jobs = query.all()
            return [self._db_job_to_pydantic(job) for job in db_jobs]
        
        except Exception as e:
            print(f"Error fetching jobs: {e}")
            return []
    
    def get_job_by_id(self, job_id: str) -> Optional[Job]:
        """Get a specific job by ID"""
        try:
            db_job = self.db.query(JobModel).filter(JobModel.id == job_id).first()
            if db_job:
                return self._db_job_to_pydantic(db_job)
            return None
        except Exception as e:
            print(f"Error fetching job {job_id}: {e}")
            return None
    
    def search_jobs(self, keyword: str) -> List[Job]:
        """Search jobs by keyword in title, description, or skills"""
        try:
            search_term = f"%{keyword}%"
            query = self.db.query(JobModel).filter(
                (JobModel.title.ilike(search_term)) |
                (JobModel.description.ilike(search_term)) |
                (JobModel.extractedSkills.ilike(search_term))
            )
            db_jobs = query.all()
            return [self._db_job_to_pydantic(job) for job in db_jobs]
        except Exception as e:
            print(f"Error searching jobs: {e}")
            return []
