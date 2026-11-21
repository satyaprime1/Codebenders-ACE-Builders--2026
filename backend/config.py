import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
load_dotenv(PROJECT_ROOT / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "lastmile-tutor-secret-key-2026-telugu-edtech")
    
    # SQLite default, ready for PostgreSQL migration via DATABASE_URL
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'lastmile_tutor.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload folder for textbook/handwritten photo questions
    UPLOAD_FOLDER = BASE_DIR / "uploads"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    
    # AI Engine Configuration
    AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")  # 'mock', 'groq', 'gemini', 'openai'
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Frontend build folder to serve directly via Flask
    FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
