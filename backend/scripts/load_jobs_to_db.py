"""
Script to load jobs from CSV file into the database.
Run this script once to migrate your data from CSV to SQL.

Usage:
    python -m scripts.load_jobs_to_db
"""

import os
import sys
import pandas as pd
from pathlib import Path
import uuid

# Add the backend directory to the path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import Base, engine, SessionLocal
from app.models.database_models import JobModel

def load_jobs_from_csv():
    """Load jobs from CSV file into the database"""
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
    
    # Path to CSV file
    csv_path = backend_dir.parent / "Dataset" / "jobs_enriched.csv"
    
    if not csv_path.exists():
        print(f"✗ CSV file not found at {csv_path}")
        return False
    
    print(f"Loading jobs from {csv_path}...")
    
    # Read CSV file
    df = pd.read_csv(csv_path)
    df = df.fillna('')
    
    print(f"Found {len(df)} jobs to load")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # First, clear existing data
        db.query(JobModel).delete()
        db.commit()
        print("✓ Cleared existing data")
        
        loaded_count = 0
        failed_count = 0
        
        for idx, row in df.iterrows():
            try:
                # Helper function to safely convert values to strings
                def safe_str(val):
                    if pd.isna(val) or val == '':
                        return ''
                    return str(val).strip()
                
                # Helper function to safely join list items
                def safe_join(val):
                    if pd.isna(val) or val == '':
                        return ''
                    if isinstance(val, str):
                        return val
                    return ','.join([str(v).strip() for v in val if v])
                
                # Generate unique ID if missing
                job_id = safe_str(row.get('id', ''))
                if not job_id:
                    job_id = f"job_{uuid.uuid4().hex[:12]}"
                
                # Create job model instance
                job = JobModel(
                    id=job_id,
                    title=safe_str(row.get('title', '')),
                    company=safe_str(row.get('company', '')),
                    location=safe_str(row.get('location', '')),
                    datePosted=safe_str(row.get('datePosted', '')),
                    workplaceModel=safe_str(row.get('workplaceModel', '')),
                    employmentType=safe_str(row.get('employmentType', '')),
                    salary=safe_str(row.get('salary', '')),
                    description=safe_str(row.get('description', '')),
                    extractedSkills=safe_join(row.get('extractedSkills', '')),
                    extractedQualifications=safe_join(row.get('extractedQualifications', '')),
                    extractedConstraints=safe_join(row.get('extractedConstraints', '')),
                    category=safe_str(row.get('category', '')),
                    visaEligible=bool(row.get('visaEligible', False)) if row.get('visaEligible', '') != '' else None,
                )
                
                db.add(job)
                loaded_count += 1
                
                # Commit every 100 records
                if (idx + 1) % 100 == 0:
                    db.commit()
                    print(f"  Loaded {idx + 1} jobs...")
            
            except Exception as e:
                failed_count += 1
                print(f"  ✗ Error loading job at row {idx}: {str(e)[:100]}")
                db.rollback()
                continue
        
        # Final commit
        db.commit()
        
        print(f"\n✓ Successfully loaded {loaded_count} jobs into database")
        if failed_count > 0:
            print(f"⚠ Failed to load {failed_count} jobs")
        
        return True
    
    except Exception as e:
        print(f"✗ Error during migration: {str(e)[:200]}")
        db.rollback()
        return False
    
    finally:
        db.close()

if __name__ == "__main__":
    success = load_jobs_from_csv()
    sys.exit(0 if success else 1)
