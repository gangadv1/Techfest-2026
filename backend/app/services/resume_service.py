from typing import Dict, List, Optional
import re
from app.services.job_service import JobService

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
        
        # Industry-specific skill profiles (matching frontend INDUSTRY_PROFILES)
        self.industry_profiles = {
            'software': ['git', 'react', 'node.js', 'sql', 'docker', 'aws', 'typescript'],
            'fullstack': ['react', 'node.js', 'express', 'sql', 'mongodb', 'typescript', 'git', 'aws'],
            'ml': ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'sql', 'jupyter'],
            'productmanager': ['product strategy', 'user research', 'analytics', 'roadmap planning', 'agile', 'sql', 'figma'],
            'uiux': ['figma', 'wireframing', 'prototyping', 'user research', 'interaction design', 'css', 'usability testing'],
            'cybersecurity': ['network security', 'encryption', 'penetration testing', 'security protocols', 'firewalls', 'linux', 'python'],
            'devops': ['docker', 'kubernetes', 'aws', 'ci/cd', 'terraform', 'linux', 'git', 'monitoring'],
            'data': ['sql', 'python', 'excel', 'power bi', 'statistics', 'dashboards'],
            'finance': ['excel', 'valuation', 'accounting', 'financial modeling', 'powerpoint']
        }
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using keyword matching"""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.skills_dictionary:
            if skill.lower() in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))
    
    def analyze_resume(self, resume_text: str, extracted_skills: List[str], industry: str = 'software') -> Dict:
        """General resume analysis for dashboard metrics based on industry"""
        # Get profile skills for the industry
        profile_skills = self.industry_profiles.get(industry, self.industry_profiles['software'])
        
        # Analyze content quality
        word_count = len(resume_text.split())
        has_sections = bool(re.search(r'(experience|education|projects|skills)', resume_text, re.IGNORECASE))
        bullet_count = len(re.findall(r'\n[-*•]', resume_text))
        action_verbs = re.findall(r'(led|built|designed|implemented|optimized|managed|created|developed)', resume_text, re.IGNORECASE)
        action_verb_count = len(action_verbs)
        
        # Calculate metrics (same as frontend logic but on backend)
        content_score = min(40, round((min(word_count, 800) / 800) * 20 + (10 if has_sections else 0) + min(bullet_count, 10)))
        ats_score = min(20, round((10 if has_sections else 5) + min(bullet_count, 10)))
        
        # Match extracted skills against profile skills (case-insensitive)
        extracted_lower = [s.lower() for s in extracted_skills]
        matched_skills = [s for s in profile_skills if any(skill.lower().find(s.lower()) >= 0 for skill in extracted_lower)]
        job_opt_score = min(25, round((len(matched_skills) / max(len(profile_skills), 1)) * 25))
        
        writing_score = min(10, round(min(action_verb_count, 10)))
        
        # Strengths and weaknesses
        strengths = []
        if has_sections:
            strengths.append('Clear section structure')
        if bullet_count >= 5:
            strengths.append('Good use of bullet points')
        if len(matched_skills) >= 3:
            strengths.append('Relevant skills highlighted')
        
        weaknesses = []
        if not has_sections:
            weaknesses.append('Missing standard sections')
        missing_count = len(profile_skills) - len(matched_skills)
        if missing_count > 0:
            weaknesses.append(f'Missing {missing_count} key technologies')
        if word_count < 200:
            weaknesses.append('Too short; add more detail')
        
        # Calculate missing keywords
        missing_keywords = [s for s in profile_skills if s not in matched_skills]
        
        return {
            'metrics': {
                'content': {
                    'score': content_score,
                    'max': 40,
                    'label': 'good' if has_sections else 'needs work'
                },
                'ats': {
                    'score': ats_score,
                    'max': 20,
                    'label': 'excellent' if bullet_count >= 5 else 'good'
                },
                'jobOpt': {
                    'score': job_opt_score,
                    'max': 25,
                    'label': 'good' if len(matched_skills) >= 4 else 'needs work'
                },
                'writing': {
                    'score': writing_score,
                    'max': 10,
                    'label': 'excellent' if action_verb_count >= 5 else 'good'
                },
                'ready': False
            },
            'resumeSkills': extracted_skills,
            'missingTopKeywords': missing_keywords,
            'strengths': strengths if strengths else ['Resume structure looks good'],
            'weaknesses': weaknesses if weaknesses else ['All looks good!']
        }
    
    def analyze_fit(self, job_id: str, resume_text: str) -> Dict:
        """Analyze how well a resume fits a job using job database when available"""
        job_service = JobService()
        job = job_service.get_job_by_id(job_id)
        # Prefer extracted skills from job; fall back to keywords mined from description
        if job and job.extractedSkills:
            job_skills = [s.strip() for s in job.extractedSkills if s.strip()]
        elif job and job.description:
            # naive extraction from description based on known dictionary
            desc_skills = self.extract_skills(job.description)
            job_skills = desc_skills if desc_skills else ["Python", "React", "AWS", "Docker", "REST API"]
        else:
            # If job missing, use a minimal default
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
