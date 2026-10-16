import logging
import os
from decimal import Decimal
from functools import lru_cache
from typing import Any, Dict, List, Optional

import boto3
from botocore.exceptions import ClientError, EndpointConnectionError

from app.config import settings

logger = logging.getLogger(__name__)


def tbl(name: str) -> str:
    """Return table name with optional prefix."""
    return f"{settings.DYNAMODB_TABLE_PREFIX}{name}"


@lru_cache(maxsize=1)
def get_dynamodb_resource():
    """Create or return cached boto3 DynamoDB resource."""
    kwargs: Dict[str, Any] = {"region_name": settings.DYNAMODB_REGION}
    
    endpoint = settings.DYNAMODB_ENDPOINT_URL
    if settings.USE_LOCAL_DYNAMODB and not endpoint:
        endpoint = "http://localhost:8000"

    if endpoint:
        kwargs["endpoint_url"] = endpoint
        # For local testing, supply dummy credentials if not present
        if "aws_access_key_id" not in kwargs:
            kwargs["aws_access_key_id"] = os.getenv("AWS_ACCESS_KEY_ID", "mock_key")
            kwargs["aws_secret_access_key"] = os.getenv("AWS_SECRET_ACCESS_KEY", "mock_secret")
        logger.info(f"Connecting to DynamoDB at custom endpoint: {endpoint}")
    else:
        logger.info(f"Connecting to AWS DynamoDB in region: {settings.DYNAMODB_REGION}")

    return boto3.resource("dynamodb", **kwargs)


@lru_cache(maxsize=1)
def get_dynamodb_client():
    """Create or return cached boto3 DynamoDB client."""
    kwargs: Dict[str, Any] = {"region_name": settings.DYNAMODB_REGION}
    endpoint = settings.DYNAMODB_ENDPOINT_URL
    if settings.USE_LOCAL_DYNAMODB and not endpoint:
        endpoint = "http://localhost:8000"

    if endpoint:
        kwargs["endpoint_url"] = endpoint
        kwargs["aws_access_key_id"] = os.getenv("AWS_ACCESS_KEY_ID", "mock_key")
        kwargs["aws_secret_access_key"] = os.getenv("AWS_SECRET_ACCESS_KEY", "mock_secret")

    return boto3.client("dynamodb", **kwargs)


def get_table(name: str):
    """Retrieve Table object for given table name."""
    return get_dynamodb_resource().Table(tbl(name))


def to_native(value: Any) -> Any:
    """Recursively convert DynamoDB Decimal types to native int or float."""
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    if isinstance(value, list):
        return [to_native(v) for v in value]
    if isinstance(value, dict):
        return {k: to_native(v) for k, v in value.items()}
    return value


def to_dynamo(value: Any) -> Any:
    """Prepare native dict for DynamoDB insertion, converting floats to Decimal."""
    if isinstance(value, float):
        return Decimal(str(value))
    if isinstance(value, list):
        return [to_dynamo(v) for v in value]
    if isinstance(value, dict):
        return {k: to_dynamo(v) for k, v in value.items()}
    return value


def scan_all(table_obj, **kwargs) -> List[Dict[str, Any]]:
    """Scan entire DynamoDB table handling pagination."""
    items = []
    try:
        response = table_obj.scan(**kwargs)
        items.extend(response.get("Items", []))
        while "LastEvaluatedKey" in response:
            response = table_obj.scan(ExclusiveStartKey=response["LastEvaluatedKey"], **kwargs)
            items.extend(response.get("Items", []))
        return [to_native(item) for item in items]
    except Exception as exc:
        logger.error(f"Error scanning table {table_obj.name}: {exc}")
        return []


def query_all(table_obj, **kwargs) -> List[Dict[str, Any]]:
    """Query DynamoDB table handling pagination."""
    items = []
    try:
        response = table_obj.query(**kwargs)
        items.extend(response.get("Items", []))
        while "LastEvaluatedKey" in response:
            response = table_obj.query(ExclusiveStartKey=response["LastEvaluatedKey"], **kwargs)
            items.extend(response.get("Items", []))
        return [to_native(item) for item in items]
    except Exception as exc:
        logger.error(f"Error querying table {table_obj.name}: {exc}")
        return []


def next_numeric_id(table_name: str) -> int:
    """Generate next auto-increment integer ID for a DynamoDB table."""
    try:
        table_obj = get_table(table_name)
        items = scan_all(table_obj, ProjectionExpression="id")
        if not items:
            return 1
        ids = [int(item["id"]) for item in items if "id" in item and str(item["id"]).isdigit()]
        return max(ids, default=0) + 1
    except Exception as exc:
        logger.warning(f"Failed to generate next_numeric_id for {table_name}: {exc}")
        import time
        return int(time.time() * 1000) % 10000000
