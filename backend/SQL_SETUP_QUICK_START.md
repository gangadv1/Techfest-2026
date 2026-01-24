# SQL Database Setup - Quick Start

## What I've Done

I've set up a complete SQL database system for your JobFit project. You can now store and query job data in a database instead of loading CSV files into memory.

## 3 Quick Steps to Get Started

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Load Your CSV Data into the Database
```bash
python -m scripts.load_jobs_to_db
```

This will:
- Create a `jobfit.db` SQLite database
- Load all jobs from `Dataset/jobs_enriched.csv`
- Display progress and confirmation

### Step 3: Run Your API
```bash
uvicorn app.main:app --reload
```

Your API will automatically create tables and you can start querying from the database!

## Files Created/Modified

**New Files:**
- `app/core/database.py` - Database configuration
- `app/models/database_models.py` - Job database model
- `scripts/load_jobs_to_db.py` - Migration script to load CSV data

**Modified Files:**
- `requirements.txt` - Added SQLAlchemy and Alembic
- `app/core/config.py` - Added database URL configuration
- `app/services/job_service.py` - Now queries the database instead of CSV
- `app/main.py` - Creates tables on startup

**Documentation:**
- `DATABASE_SETUP.md` - Complete setup guide with troubleshooting

## Key Features

✅ **SQLite by default** (no external database server needed)
✅ **Search functionality** - Added `search_jobs()` method
✅ **Better filtering** - Filters applied at database level
✅ **Persistence** - Data survives app restarts
✅ **Scalable** - Handles large datasets efficiently

## Switch Database Types

To use PostgreSQL or MySQL, just update the `DATABASE_URL` in your `.env` file:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/jobfit_db

# MySQL
DATABASE_URL=mysql+pymysql://user:password@localhost/jobfit_db
```

Done! Your system is now ready to use SQL databases. See `DATABASE_SETUP.md` for full details.
