from typing import List, Dict, Optional
from app.models.job import Job
import json
import pandas as pd
import os

class JobService:
    def __init__(self):
       
         # Load jobs from CSV/Excel file
        self.jobs = self._load_jobs_from_file()
    
    def _load_jobs_from_file(self) -> List[Job]:
        """Load jobs from Excel/CSV file"""
        csv_path = os.path.join(os.path.dirname(__file__), '../../..', 'Dataset', 'jobs_enriched.csv')
        
        if not os.path.exists(csv_path):
            return []
        
        df = pd.read_csv(csv_path)
        # Replace NaN values with empty strings
        df = df.fillna('')
        jobs = []
        
        for _, row in df.iterrows():
            try:
                # Helper function to safely convert values to strings
                def safe_str(val):
                    if pd.isna(val) or val == '':
                        return ''
                    return str(val).strip()
                
                # Helper function to safely split skills
                def safe_split(val):
                    if pd.isna(val) or val == '':
                        return []
                    return [s.strip() for s in str(val).split(',') if s.strip()]
                
                job = Job(
                    id=safe_str(row.get('id', '')),
                    title=safe_str(row.get('title', '')),
                    company=safe_str(row.get('company', '')),
                    location=safe_str(row.get('location', '')),
                    datePosted=safe_str(row.get('datePosted', '')),
                    workplaceModel=safe_str(row.get('workplaceModel', '')),
                    employmentType=safe_str(row.get('employmentType', '')),
                    salary=safe_str(row.get('salary', '')),
                    description=safe_str(row.get('description', '')),
                    extractedSkills=safe_split(row.get('extractedSkills', '')),
                    extractedQualifications=safe_split(row.get('extractedQualifications', '')),
                    extractedConstraints=safe_split(row.get('extractedConstraints', ''))
                )
                jobs.append(job)
            except Exception as e:
                print(f"Error parsing job row: {e}")
                continue
        
        return jobs
    
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
