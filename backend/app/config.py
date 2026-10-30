import json
import logging
import os
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

# Load .env file from project root or backend root
env_paths = [
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent / ".env",
    Path(".env"),
]
for p in env_paths:
    if p.exists():
        load_dotenv(p)
        break


def _str_to_bool(value: Optional[str]) -> bool:
    if value is None:
        return False
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def load_aws_secrets_into_env():
    """
    Fetch configuration secrets from AWS Secrets Manager if USE_AWS_SECRETS is true.
    Falls back gracefully to environment variables if Secrets Manager is unavailable
    unless AWS_SECRETS_REQUIRED is set to true.
    """
    use_aws_secrets = _str_to_bool(os.getenv("USE_AWS_SECRETS", "false"))
    if not use_aws_secrets:
        return

    secret_name = os.getenv("AWS_SECRET_NAME", "prod/app/backend")
    region_name = os.getenv("AWS_REGION", "ap-southeast-1")
    secrets_required = _str_to_bool(os.getenv("AWS_SECRETS_REQUIRED", "false"))

    try:
        import boto3
        from botocore.exceptions import ClientError

        client = boto3.client("secretsmanager", region_name=region_name)
        response = client.get_secret_value(SecretId=secret_name)
        secret_string = response.get("SecretString", "{}")
        secret_data = json.loads(secret_string)

        for key, value in secret_data.items():
            os.environ[key] = str(value)
        logger.info(f"Loaded {len(secret_data)} secrets from AWS Secrets Manager ({secret_name})")
    except Exception as exc:
        msg = f"Failed to load AWS secrets from '{secret_name}': {exc}"
        if secrets_required:
            logger.error(msg)
            raise RuntimeError(msg)
        else:
            logger.warning(f"{msg}. Falling back to local environment variables.")


# Load secrets before initializing settings class
load_aws_secrets_into_env()


class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Hệ Thống Đăng Ký Môn Học - Course Registration")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Auth & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-me-in-production-123456789")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h
    
    # AWS Secrets Manager
    USE_AWS_SECRETS: bool = _str_to_bool(os.getenv("USE_AWS_SECRETS", "false"))
    AWS_SECRET_NAME: str = os.getenv("AWS_SECRET_NAME", "prod/app/backend")
    AWS_SECRETS_REQUIRED: bool = _str_to_bool(os.getenv("AWS_SECRETS_REQUIRED", "false"))
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-southeast-1")

    # DynamoDB
    DYNAMODB_REGION: str = os.getenv("DYNAMODB_REGION", os.getenv("AWS_REGION", "ap-southeast-1"))
    DYNAMODB_ENDPOINT_URL: Optional[str] = os.getenv("DYNAMODB_ENDPOINT_URL", None)
    DYNAMODB_TABLE_PREFIX: str = os.getenv("DYNAMODB_TABLE_PREFIX", "")
    USE_LOCAL_DYNAMODB: bool = _str_to_bool(os.getenv("USE_LOCAL_DYNAMODB", "false"))

    # Email Service
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "mock").lower()  # lambda | ses | smtp | console | mock
    EMAIL_LAMBDA_NAME: str = os.getenv("EMAIL_LAMBDA_NAME", "course-reg-email-worker")
    DEFAULT_FROM_EMAIL: str = os.getenv("DEFAULT_FROM_EMAIL", "noreply@course-reg.edu.vn")
    EMAIL_SUBJECT_PREFIX: str = os.getenv("EMAIL_SUBJECT_PREFIX", "Đăng Ký Học Phần")
    
    # SMTP (if EMAIL_PROVIDER == "smtp")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS: bool = _str_to_bool(os.getenv("SMTP_USE_TLS", "true"))

    # CORS
    CORS_ALLOWED_ORIGINS: str = os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://localhost:80,http://127.0.0.1:5173,*"
    )

    # Business Rules
    MIN_CREDITS: int = int(os.getenv("MIN_CREDITS", "10"))
    MAX_CREDITS: int = int(os.getenv("MAX_CREDITS", "24"))

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ALLOWED_ORIGINS:
            return ["*"]
        if "*" in self.CORS_ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
