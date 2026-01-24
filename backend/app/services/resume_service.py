from typing import Dict, List
import re

class ResumeService:
    def __init__(self):
        # Common tech skills dictionary
        self.skills_dictionary = [
            "python", "javascript", "typescript", "react", "vue", "angular",
            "node.js", "express", "django", "flask", "fastapi",
            "aws", "azure", "gcp", "docker", "kubernetes",
            "sql", "postgresql", "mongodb", "redis",
            "git", "ci/cd", "rest api", "graphql"
        ]
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using keyword matching"""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.skills_dictionary:
            if skill.lower() in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))
    
    def analyze_fit(self, job_id: str, resume_text: str) -> Dict:
        """Analyze how well a resume fits a job"""
        # For demo purposes, using mock job data
        # In production, fetch actual job from database
        job_skills = ["Python", "React", "AWS", "Docker", "REST API"]
        
        resume_skills = self.extract_skills(resume_text)
        
        # Calculate matches
        matched_skills = list(set(job_skills) & set(resume_skills))
        missing_skills = list(set(job_skills) - set(resume_skills))
        
        # Calculate fit score
        if len(job_skills) > 0:
            fit_score = int((len(matched_skills) / len(job_skills)) * 100)
        else:
            fit_score = 0
        
        # Generate recommendations
        recommendations = missing_skills[:3]  # Top 3 missing skills
        
        return {
            "fitScore": fit_score,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "recommendations": recommendations
        }
