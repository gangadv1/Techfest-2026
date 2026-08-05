# 🚀 Vector

> A full-stack career development and upskilling platform that helps students prepare for internships and full-time roles through resume analysis, career roadmaps, interview practice, and personalized learning.

---

# Live Demo

**Frontend**

[https://career-vector.vercel.app](https://career-vector.vercel.app)

**Backend API**

[https://vector-backend-ijym.onrender.com](https://vector-backend-ijym.onrender.com)

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

## Job Discovery

- Browse Singapore-based job opportunities
- Keyword search
- Advanced filtering
- Salary filtering
- Skill-based filtering
- Job detail pages

## Skill Gap Analysis

Vector compares a user's current skills against their desired career path and identifies missing competencies.

It then generates:

- Personalized learning roadmap
- Skill dependency graph
- Learning sequence
- Career readiness insights

## Personalized Learning

- 7-day study plans
- Daily learning tasks
- Learning streak tracking
- Progress monitoring

## Interview Simulator

- Role-specific interview questions
- Technical and behavioural question bank
- Speech recognition
- Filler word detection
- Speaking duration tracking
- Speaking rate analysis
- Personalized interview feedback

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

- Dashboard
- Resume Analysis
- Job Discovery
- Interview Simulator
- Career Roadmaps

---

## Backend

- FastAPI
- SQLAlchemy
- REST APIs
- Pandas

Responsible for:

- Resume Processing
- Job APIs
- Learning Plan Generation
- Interview Evaluation
- Data Processing

---

## Application Logic

- Resume Scoring
- Skill Gap Analysis
- Career Roadmap Generation
- Personalized Learning Plans
- Interview Question Selection
- Performance Evaluation

---

## Database

- SQLite

Stores:

- Resume data
- Job information
- Learning plans
- User progress

---

## Deployment

Frontend

- Vercel

Backend

- Render

---

# Tech Stack

| Frontend | Backend | Database | Deployment |
|-----------|----------|----------|------------|
| React | FastAPI | SQLite | Vercel |
| TypeScript | SQLAlchemy | | Render |
| Tailwind CSS | Pandas | | |
| React Router | REST APIs | | |
| React Flow | Python | | |
| Vite | | | |

---

# System Architecture

The application follows a layered architecture:

```
User
   │
   ▼
React Frontend
   │
   ▼
FastAPI REST API
   │
   ▼
SQLAlchemy ORM
   │
   ▼
SQLite Database
```

Business logic powers:

- Resume Scoring
- Skill Gap Analysis
- Career Roadmaps
- Learning Plan Generation
- Interview Evaluation

---

# Running Locally

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

# Future Improvements

- AI-powered resume rewriting
- Company-specific interview preparation
- Authentication and user accounts
- Real job API integration
- Personalized job recommendations
- Learning analytics dashboard

---

# Contributors

Developed during **TechFest 2026** by a team of four students from **Nanyang Technological University, Singapore**.

---

# License

This project was developed for educational and portfolio purposes.
