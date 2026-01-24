# Database Migration Guide

This guide explains how to migrate your job data from CSV to a SQL database.

## Setup Instructions

### 1. Install Dependencies

First, install the new database dependencies:

```bash
pip install -r requirements.txt
```

This installs:
- `sqlalchemy>=2.0.0` - ORM for database operations
- `alembic>=1.13.0` - Database migrations (optional, for advanced use)

### 2. Configure Database URL (Optional)

By default, the system uses SQLite, which creates a `jobfit.db` file locally.

If you want to use a different database, update the `.env` file:

```env
DATABASE_URL=sqlite:///./jobfit.db
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/jobfit_db
# Or for MySQL:
# DATABASE_URL=mysql+pymysql://user:password@localhost/jobfit_db
```

If using PostgreSQL or MySQL, also add the appropriate driver to `requirements.txt`:
- PostgreSQL: `psycopg2-binary>=2.9.0`
- MySQL: `PyMySQL>=1.1.0`

### 3. Load Your CSV Data into the Database

Run the migration script to load data from your CSV file:

```bash
cd backend
python -m scripts.load_jobs_to_db
```

You should see output like:
```
✓ Database tables created successfully
Loading jobs from ../Dataset/jobs_enriched.csv...
Found 1000 jobs to load
  Loaded 100 jobs...
  Loaded 200 jobs...
  ...
✓ Successfully loaded 1000 jobs
```

### 4. Start Your API

Your FastAPI backend will automatically create tables when it starts:

```bash
uvicorn app.main:app --reload
```

## What Changed

### Code Changes

1. **Database Models** ([app/models/database_models.py](app/models/database_models.py))
   - New `JobModel` SQLAlchemy model for the jobs table
   - Includes timestamps for tracking when jobs are created/updated

2. **Database Configuration** ([app/core/database.py](app/core/database.py))
   - Database engine setup
   - Session management
   - Dependency injection for database access

3. **Job Service** ([app/services/job_service.py](app/services/job_service.py))
   - Updated to query the database instead of loading CSV into memory
   - Added `search_jobs()` method for keyword searching
   - More efficient filtering at the database level

4. **Main App** ([app/main.py](app/main.py))
   - Creates database tables on startup

### Benefits

✓ **Scalability** - Handle large datasets without loading everything into memory
✓ **Performance** - Query filtering happens at the database level
✓ **Real-time Data** - No need to restart the API to see new jobs
✓ **Better Querying** - Full-text search, complex filters, and sorting
✓ **Data Persistence** - Changes persist across restarts
✓ **Analytics** - Easier to track and analyze job data over time

## Usage Examples

### Get All Jobs
```
GET /api/jobs
```

### Filter by Location
```
GET /api/jobs?location=New York&location=San Francisco
```

### Filter by Employment Type
```
GET /api/jobs?employment_type=Full-time&employment_type=Contract
```

### Sort by Date
```
GET /api/jobs?sort_by=newest
```

### Get Specific Job
```
GET /api/jobs/{job_id}
```

## Troubleshooting

### Database file not created
- Make sure the `backend` folder is writable
- Check that SQLAlchemy is installed: `pip install sqlalchemy`

### CSV file not found
- Ensure the path `Dataset/jobs_enriched.csv` exists relative to the backend folder
- Run the script from the backend directory

### Port already in use
- Change the port: `uvicorn app.main:app --port 8001`

## Switching Back to CSV (if needed)

If you want to revert to CSV loading:
1. Keep a backup of the migration script
2. You can always regenerate the database by deleting `jobfit.db` and running the migration again

## Next Steps

- Add more database features like pagination
- Add database indexes for performance
- Implement automatic backups
- Add admin endpoints for managing job data
