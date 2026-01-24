from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "JobFit API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]
    
    # Groq API
    GROQ_API_KEY: str = ""
    
    # Database
    database_url: str = "sqlite:///./jobfit.db"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
