from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class Application(BaseModel):
    id: str
    jobId: str
    status: str
    notes: str = ""

# In-memory storage for demo
applications_db: List[Application] = []

@router.get("", response_model=List[Application])
async def get_applications():
    """Get all applications"""
    return applications_db

@router.post("", response_model=Application)
async def create_application(application: Application):
    """Create a new application"""
    applications_db.append(application)
    return application

@router.put("/{app_id}", response_model=Application)
async def update_application(app_id: str, application: Application):
    """Update application status"""
    for idx, app in enumerate(applications_db):
        if app.id == app_id:
            applications_db[idx] = application
            return application
    return application

@router.delete("/{app_id}")
async def delete_application(app_id: str):
    """Delete an application"""
    global applications_db
    applications_db = [app for app in applications_db if app.id != app_id]
    return {"message": "Application deleted"}
