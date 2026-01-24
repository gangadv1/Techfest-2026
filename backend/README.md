# JobFit Backend (FastAPI)

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/{id}` - Get specific job
- `POST /api/resume/scan` - Analyze resume fit
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Create application
