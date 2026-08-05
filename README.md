# 🚀 Vector

> A full-stack career development and upskilling platform that helps students prepare for internships and full-time roles through resume analysis, career roadmaps, interview practice, and personalized learning.

![Dashboard](screenshots/dashboard.png)

---

## Live Demo

🌐 Frontend

https://career-vector.vercel.app

⚙️ Backend API

https://vector-backend-ijym.onrender.com

---

# Overview

Vector was developed during **TechFest 2026** by a team of four students from **Nanyang Technological University, Singapore**.

The platform assists users in preparing for their careers through:

- Resume analysis
- ATS resume scoring
- Job discovery
- Career roadmaps
- Skill gap analysis
- Daily learning plans
- Interview practice
- Progress tracking

---

# Features

## Resume Analysis

- ATS compatibility scoring
- Resume quality assessment
- Industry benchmark comparison
- Strength and weakness analysis

---

## Job Discovery

- Singapore job listings
- Keyword search
- Salary filtering
- Skill-based filtering
- Job detail pages

---

## Skill Gap Analysis

Vector compares the user's current skills against their desired career path and identifies missing competencies.

It then generates:

- Personalized roadmap
- Skill dependency graph
- Learning sequence
- Career readiness insights

---

## Personalized Learning

- 7-day study plans
- Daily learning tasks
- Learning streaks
- Progress tracking

---

## Interview Simulator

- Role-specific interview questions
- Technical & behavioural question bank
- Speech recognition
- Filler word detection
- Speaking duration tracking
- Interview feedback
- Speaking rate analysis

---

# Architecture

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Flow

Responsible for:

- User Interface
- Resume Dashboard
- Roadmap Visualization
- Interview Simulator
- Job Platform

---

## Backend

- FastAPI
- SQLAlchemy
- REST APIs
- Pandas

Responsible for:

- Resume Processing
- Job APIs
- Plan Generation
- Data Processing
- Interview APIs

---

## Database

- SQLite

Stores:

- User data
- Resume analysis
- Roadmaps
- Learning plans

---

## Deployment

Frontend

- Vercel

Backend

- Render

---

# Tech Stack

| Frontend | Backend | Database | Deployment |
|-----------|----------|-----------|------------|
| React | FastAPI | SQLite | Vercel |
| TypeScript | SQLAlchemy | | Render |
| Tailwind CSS | Pandas | | |
| React Flow | REST APIs | | |
| Vite | Python | | |

---

# System Architecture

![Architecture](screenshots/architecture.png)

The application follows a layered architecture:

User

↓

React Frontend

↓

FastAPI REST API

↓

SQLAlchemy ORM

↓

SQLite Database

Business logic powers:

- Resume Scoring
- Career Roadmaps
- Learning Plan Generation
- Interview Evaluation

---

# Screenshots

## Landing Page

![Landing](screenshots/landing.png)

---

## Dashboard

![Dashboard](screenshots/dashboard.png)

---

## Resume Analysis

![Resume](screenshots/resume.png)

---

## Job Discovery

![Jobs](screenshots/jobs.png)

---

## Roadmap

![Roadmap](screenshots/roadmap.png)

---

## Interview Simulator

![Interview](screenshots/interview.png)

---

# Running Locally

Frontend

```bash
npm install
npm run dev
```

Backend

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

# Future Improvements

- AI-generated resume suggestions
- Real-time interview coaching
- Company-specific interview preparation
- Authentication
- Real job API integration
- Personalized job recommendations

---

# Contributors

Developed during TechFest 2026 by a team of four students from Nanyang Technological University, Singapore.

---

# License

Educational and portfolio project.
