from os import getenv
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = getenv("SECRET_KEY")
    DEBUG = getenv("DEBUG", "False")

    DATABASE_URL = getenv("DATABASE_URL")
    DB_USER = getenv("DB_USER")
    DB_PASSWORD = getenv("DB_PASSWORD")
    DB_HOST = getenv("DB_HOST", "localhost")
    DB_PORT = getenv("DB_PORT", "5432")
    DB_NAME = getenv("DB_NAME")
    FAST2SMS_API_KEY = getenv("FAST2SMS_API_KEY")

    # Supabase Configuration
    SUPABASE_URL = getenv("SUPABASE_URL")
    SUPABASE_KEY = getenv("SUPABASE_KEY")
    SUPABASE_SERVICE_KEY = getenv("SUPABASE_SERVICE_KEY")
    SUPABASE_JWT_SECRET = getenv("SUPABASE_JWT_SECRET")

    # Optional: Supabase Managed Postgres
    SUPABASE_DB_HOST = getenv("SUPABASE_DB_HOST")
    SUPABASE_DB_PORT = getenv("SUPABASE_DB_PORT", "5432")
    SUPABASE_DB_NAME = getenv("SUPABASE_DB_NAME", "postgres")
    SUPABASE_DB_USER = getenv("SUPABASE_DB_USER", "postgres")
    SUPABASE_DB_PASSWORD = getenv("SUPABASE_DB_PASSWORD")
