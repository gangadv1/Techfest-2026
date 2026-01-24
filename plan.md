# plan.md — JobFit + Upskill + Forums (TechFest MVP)

## 0) Goal
Build a career platform with 3 main sections:
1) Job postings (from CSV, centralized + filter + sort + details)
2) Applicant info + upskilling (questionnaire → resume scan → job fit → roadmap)
3) Forums & discussions (simple posts/comments)

**Primary demo flow:**
Landing → Questionnaire → Jobs (pre-filtered) → Job detail (requirements) → Resume scan (fit + missing skills) → Roadmap (7-day plan) → Apply link + Track status

---

## 1) Tech stack (fast + demo-ready)
**Frontend:** Next.js (App Router) + TypeScript  
**UI:** TailwindCSS + shadcn/ui  
**State:** URL search params for filters + local state  
**Data:** CSV parsed into normalized JSON (seed)  
**Storage:** SQLite + Prisma (local) OR Supabase Postgres (if deploying)  
**AI (resume scanning):**
- MVP: rule-based skill extraction (skills_dictionary.json)
- Optional “AI text”: local Ollama OR hosted LLM (only for explanation, not required)

**Deployment:** Vercel (frontend + API routes)

---

## 2) Pages / routes
- `/` Landing page (match screenshot style)
- `/onboarding` Questionnaire (1 question at a time)
- `/jobs` Job listing (card/table) + filters + sort
- `/jobs/[id]` Job detail + requirements + actions (Analyze fit / Track / Apply)
- `/tracker` Application tracking (status dropdown or simple kanban)
- `/roadmap` Personalized roadmap (7-day plan + “Next best action”)
- `/dashboard` Stats (3 tabs) — optional if time
- `/forums` + `/forums/[id]` Basic forum — optional if time

---

## 3) Data model (minimum)
### 3.1 Job (from CSV)
Fields (based on dataset):
- id (generated)
- title
- company
- location
- datePosted (ISO)
- workplaceModel (remote/hybrid/onsite)
- employmentType (intern/fulltime/contract)
- salary (string or min/max)
- description (text)
Derived fields:
- category (simple mapping)
- visaEligible (boolean if can infer, else "unknown")
- extractedSkills: string[]
- extractedQualifications: string[]
- extractedConstraints: string[]

### 3.2 User (demo can be “single user”)
- preferences: { roles[], locations[], employmentTypes[], experienceLevel, salaryRange, visaEligible }
- skills: string[] (from questionnaire + resume scan)
- resumeText: string (optional)

### 3.3 Application
- id
- jobId
- status: Saved | Applied | Interview | Offer | Rejected
- stage: Initial | Technical | Behavioral (optional)
- notes
- updatedAt

---

## 4) Core features (acceptance criteria)
### 4.1 Centralized Data (CSV)
- Parse CSV into jobs
- Normalize fields
- (Optional) simulate “multiple sources” by merging 2 CSVs or adding a `source` column

✅ Acceptance:
- Jobs load from data source, display on `/jobs`
- Each job has a detail page

### 4.2 Job listing page (card table)
✅ Acceptance:
- Card/table list with title, company, location, type, posted date, salary
- Click opens job detail

### 4.3 Filtering + sorting
Filters required:
- location
- role/category
- employment type
- experience level
- salary range
- visa/work eligibility
Sort required:
- newest
- highest salary
- relevance (simple keyword match)

✅ Acceptance:
- Multi-filter works together
- Filter values reflected in URL query params
- Clear filters button works

### 4.4 Transparent requirements
- Show extracted skills/quals/constraints on job detail page
- Extraction method: keyword dictionary + regex patterns (fast & stable)

✅ Acceptance:
- Requirements visible on every job (even if “unknown/none found”)

### 4.5 Application tracking
- Save job
- Change status (manual)
- Optional: stage tracking

✅ Acceptance:
- Status persists (DB or localStorage)
- Tracker page shows jobs grouped by status

---

## 5) Resume scanning (MVP spec)
### 5.1 Inputs
- jobId (selected job)
- resume text (paste) OR upload PDF (extract text)

### 5.2 Outputs
- fitScore (0–100)
- matchedSkills[]
- missingSkills[] (ordered: importance + difficulty)
- recommendations: top 3–6 skills
- optional: “How to improve your resume for this job” bullet tips (template-based)

### 5.3 Algorithm (no model needed)
- jobSkills = extractSkills(job.description)
- resumeSkills = extractSkills(resumeText)
- matched = intersection(jobSkills, resumeSkills)
- missing = jobSkills - resumeSkills
- fitScore = round(100 * matchedCount / max(jobSkillsCount,1))

**Ordering missing skills**
- difficulty from `skills_map.json` (easy/med/hard)
- importance: if skill appears in title/first 30% of description → boost

✅ Acceptance:
- One click “Analyze my fit” produces score + lists within 1s

---

## 6) Roadmap (what “career map” means)
### 6.1 Roadmap format
- 7-day plan (or 14-day toggle)
- One task per day, 20–30 min each
- Each day includes:
  - micro-lesson (short text you write)
  - mini exercise
  - quick quiz (3–5 MCQ)
  - “Mark complete”
- “Next best action” always pinned at top

### 6.2 Roadmap sources
- Use your internal `skills_map.json` + templates
- Link out to roadmap.sh as “extra resources”
- Do NOT dump 10 links; show 1 primary, rest collapsed

✅ Acceptance:
- Roadmap generated from missing skills
- Progress tracked (localStorage or DB)

---

## 7) Landing page (match screenshot style)
Reference screenshot: big centered brand name, tagline, supporting sentence, two CTA buttons, floating stat cards around, logos row below.

### 7.1 Layout blocks
1) Hero container (full height)
2) Center stack:
   - Big brand name (e.g., "forge" style)
   - Tagline: bold, short (“Never Be Filtered by a Black Box Again” style)
   - Subtext (1–2 lines)
   - CTA row: primary + secondary
3) Floating stat cards (8–10) positioned around hero
4) “Trusted by” logos row at bottom
5) Footer

### 7.2 Stat card content (customize to your product)
Examples:
- “70% of applicants don’t pass ATS”
- “X% never receive feedback”
- “Save 3 hours/week on job search”
(Keep them short; make numbers big + bold.)

### 7.3 CTA behavior
- Primary button: “Get matched” → `/onboarding`
- Secondary button: “Explore jobs” → `/jobs`

✅ Acceptance:
- Looks similar to screenshot: clean whitespace, floating cards, centered hero, 2 CTAs

---

## 8) File structure (Next.js)
- `app/page.tsx` (Landing)
- `app/onboarding/page.tsx`
- `app/jobs/page.tsx`
- `app/jobs/[id]/page.tsx`
- `app/tracker/page.tsx`
- `app/roadmap/page.tsx`
- `lib/csv/importJobs.ts`
- `lib/skills/extractSkills.ts`
- `lib/skills/skills_dictionary.json`
- `lib/skills/skills_map.json`
- `components/StatCard.tsx`
- `components/JobCard.tsx`
- `components/Filters.tsx`
- `components/RequirementPills.tsx`

---

## 9) API routes (if using DB / server actions)
- `/api/jobs` GET (filters)
- `/api/jobs/[id]` GET
- `/api/resume/scan` POST { jobId, resumeText }
- `/api/applications` CRUD (optional)

---

## 10) Build plan (2 days)
### Day 1 (Required end-to-end)
1) Setup Next.js + Tailwind + shadcn
2) CSV import → jobs list + job detail
3) Filters + sort + URL params
4) Requirements extraction (skills/quals/constraints)
5) Application tracking (localStorage first)

### Day 2 (Standout)
1) Questionnaire → prefilter jobs
2) Resume scan endpoint + fit UI
3) Roadmap generation + Next best action + progress
4) Landing page polish to match screenshot
5) (If time) minimal forums or dashboard

---

## 11) Demo script (90 seconds)
1) Landing page → click “Get matched”
2) Questionnaire sets preferences
3) Jobs list shows filtered jobs
4) Open job → show requirements
5) Paste resume → “Fit 68%” + missing skills
6) Generate 7-day plan → show next action + progress
7) Click Apply → redirect + Track status
