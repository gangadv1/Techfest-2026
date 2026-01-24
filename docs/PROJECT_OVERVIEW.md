# PROJECT_OVERVIEW.md

## Product Summary
JobFit is a web platform that helps job seekers in Singapore instantly analyze their resume, match with relevant jobs, and receive a personalized upskilling roadmap—all in one place.

## Problem
- 75% of resumes are rejected before reaching a human due to poor ATS optimization and skill mismatch.
- Job seekers waste hours searching for resources and applying to jobs they’re not ready for.
- There’s no single tool that connects resume analysis, job matching, and actionable upskilling.

## Solution
- Upload your resume (PDF) and get an instant skill analysis.
- See which jobs you’re a fit for, and where your gaps are.
- Get a personalized learning roadmap and daily plan to close those gaps.
- Community forums and streak tracking to keep you motivated.

## Key Features
### Job Postings
- Browse/search jobs with Singapore-specific filters. **Status: Done**
- See required skills and instant fit score. **Status: Done**
- Analyze My Fit: Compare your resume skills to job requirements. **Status: Done**

### Applicant Info & Upskilling
- Resume upload and parsing (PDF). **Status: Done**
- Resume scoring (content, ATS, job optimization, writing). **Status: Done**
- Personalized skill gap graph and roadmap. **Status: Done**
- Daily streak plan and progress tracking. **Status: Done**

### Forums/Community
- Community Q&A and discussion boards. **Status: Mocked**
- Social features (likes, posts). **Status: Mocked**

## Tech Stack (Detected from repo)
- **Frontend:** React 18 (Vite, TailwindCSS, React Router, React Flow)  
  _Found in frontend/package.json, vite.config.ts, tailwind.config.js_
- **Backend:** FastAPI (Python), SQLAlchemy, Alembic, Pandas  
  _Found in backend/requirements.txt, app/main.py_
- **AI/LLM:** No direct LLM API detected; resume scoring and plan generation are rule-based/local.  
  _No groq/gemini/openai client found_
- **Data/Storage:** Likely SQLite or Postgres (SQLAlchemy ORM, Alembic migrations)  
  _Found in backend/requirements.txt_
- **Dev Tooling:** Vite, Next.js (for jobforge/), TypeScript, ESLint, TailwindCSS  
  _Found in frontend/jobforge package.json, vite.config.ts, next.config.ts_

## Architecture
- Landing → Onboarding Questionnaire → Resume Upload → Resume Scoring → Dashboard (score breakdown, strengths/weaknesses) → Roadmap Graph (skill gap nodes) → Generate Plan (daily tasks, streak)

## X-Factor
- Resume-to-roadmap: Personalized upskilling plan based on your actual resume and target job.
- Skill gap graph + daily streak: Visual, actionable, and gamified upskilling.
- Singapore-first: Localized job filters and data.
