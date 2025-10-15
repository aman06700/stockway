from os import getenv
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = getenv("SECRET_KEY")
    DEBUG = getenv("DEBUG", "False").lower() in ("true", "1", "t")
