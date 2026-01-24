from pydantic import BaseModel
from typing import List, Optional

class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str
    datePosted: str
    workplaceModel: str
    employmentType: str
    salary: str
    description: str
    extractedSkills: List[str] = []
    extractedQualifications: List[str] = []
    extractedConstraints: List[str] = []
    category: Optional[str] = None
    visaEligible: Optional[bool] = None
