from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime

class JobModel(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    company = Column(String, index=True, nullable=False)
    location = Column(String, index=True, nullable=False)
    datePosted = Column(String, nullable=True)
    workplaceModel = Column(String, nullable=True)
    employmentType = Column(String, index=True, nullable=True)
    salary = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    extractedSkills = Column(String, nullable=True)  # Stored as comma-separated string
    extractedQualifications = Column(String, nullable=True)  # Stored as comma-separated string
    extractedConstraints = Column(String, nullable=True)  # Stored as comma-separated string
    category = Column(String, index=True, nullable=True)
    visaEligible = Column(Boolean, default=False, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<JobModel(id={self.id}, title={self.title}, company={self.company})>"
