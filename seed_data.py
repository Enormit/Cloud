#!/usr/bin/env python3
"""
Seed Data & DynamoDB Table Initializer for Course Registration Application.
Supports both Local DynamoDB (docker / localstack) and AWS DynamoDB.
Usage:
    python seed_data.py
"""

import os
import sys
import time
from decimal import Decimal
from typing import Any, Dict

import boto3
from botocore.exceptions import ClientError
from passlib.context import CryptContext

# Configuration
REGION = os.getenv("DYNAMODB_REGION", os.getenv("AWS_REGION", "ap-southeast-1"))
USE_LOCAL = os.getenv("USE_LOCAL_DYNAMODB", "true").lower() in ("true", "1", "yes")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT_URL", "http://localhost:8000" if USE_LOCAL else None)
PREFIX = os.getenv("DYNAMODB_TABLE_PREFIX", "")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def tbl(name: str) -> str:
    return f"{PREFIX}{name}"


def get_dynamo_resource():
    kwargs: Dict[str, Any] = {"region_name": REGION}
    if ENDPOINT:
        kwargs["endpoint_url"] = ENDPOINT
        kwargs["aws_access_key_id"] = "dummy"
        kwargs["aws_secret_access_key"] = "dummy"
        print(f"Connecting to DynamoDB at {ENDPOINT}")
    else:
        print(f"Connecting to AWS DynamoDB in region {REGION}")
    return boto3.resource("dynamodb", **kwargs)


def get_dynamo_client():
    kwargs: Dict[str, Any] = {"region_name": REGION}
    if ENDPOINT:
        kwargs["endpoint_url"] = ENDPOINT
        kwargs["aws_access_key_id"] = "dummy"
        kwargs["aws_secret_access_key"] = "dummy"
    return boto3.client("dynamodb", **kwargs)


def create_tables(dynamodb, client):
    """Create all required DynamoDB tables if they do not already exist."""
    existing_tables = client.list_tables().get("TableNames", [])
    print(f"Existing tables in DynamoDB: {existing_tables}")

    definitions = [
        # 1. accounts_user
        {
            "TableName": tbl("accounts_user"),
            "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "AttributeDefinitions": [
                {"AttributeName": "id", "AttributeType": "N"},
                {"AttributeName": "username", "AttributeType": "S"},
                {"AttributeName": "mssv", "AttributeType": "S"},
                {"AttributeName": "email", "AttributeType": "S"},
            ],
            "GlobalSecondaryIndexes": [
                {
                    "IndexName": "username-index",
                    "KeySchema": [{"AttributeName": "username", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"},
                },
                {
                    "IndexName": "mssv-index",
                    "KeySchema": [{"AttributeName": "mssv", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"},
                },
                {
                    "IndexName": "email-index",
                    "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"},
                },
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },
        # 2. courses_course
        {
            "TableName": tbl("courses_course"),
            "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "AttributeDefinitions": [
                {"AttributeName": "id", "AttributeType": "N"},
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },
        # 3. courses_registration
        {
            "TableName": tbl("courses_registration"),
            "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "AttributeDefinitions": [
                {"AttributeName": "id", "AttributeType": "N"},
                {"AttributeName": "student_id", "AttributeType": "N"},
                {"AttributeName": "course_id", "AttributeType": "N"},
            ],
            "GlobalSecondaryIndexes": [
                {
                    "IndexName": "student_course-index",
                    "KeySchema": [
                        {"AttributeName": "student_id", "KeyType": "HASH"},
                        {"AttributeName": "course_id", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                },
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },
        # 4. courses_registrationwindow
        {
            "TableName": tbl("courses_registrationwindow"),
            "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "AttributeDefinitions": [
                {"AttributeName": "id", "AttributeType": "N"},
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },
        # 5. authtoken_token
        {
            "TableName": tbl("authtoken_token"),
            "KeySchema": [{"AttributeName": "key", "KeyType": "HASH"}],
            "AttributeDefinitions": [
                {"AttributeName": "key", "AttributeType": "S"},
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },
        # 6. email_logs
        {
            "TableName": tbl("email_logs"),
            "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "AttributeDefinitions": [
                {"AttributeName": "id", "AttributeType": "S"},
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },
    ]

    for defn in definitions:
        tname = defn["TableName"]
        if tname in existing_tables:
            print(f"Table '{tname}' already exists.")
            continue
        print(f"Creating table '{tname}'...")
        try:
            client.create_table(**defn)
            print(f"Table '{tname}' creation requested.")
        except Exception as exc:
            print(f"Could not create table '{tname}': {exc}")


def seed_data(dynamodb):
    """Seed initial users, courses, and registration windows."""
    print("Seeding initial application data...")

    # 1. Users
    user_tbl = dynamodb.Table(tbl("accounts_user"))
    users = [
        {
            "id": 1,
            "username": "admin",
            "mssv": "ADMIN01",
            "email": "admin@course-reg.edu.vn",
            "password": pwd_context.hash("admin123"),
            "first_name": "Quản Trị",
            "last_name": "Hệ Thống",
            "major": "Ban Đào Tạo",
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        },
        {
            "id": 2,
            "username": "sv001",
            "mssv": "21000101",
            "email": "sv001@student.edu.vn",
            "password": pwd_context.hash("student123"),
            "first_name": "Nguyễn Văn",
            "last_name": "An",
            "major": "Kỹ thuật Phần mềm",
            "is_staff": False,
            "is_superuser": False,
            "is_active": True,
        },
        {
            "id": 3,
            "username": "sv002",
            "mssv": "21000102",
            "email": "sv002@student.edu.vn",
            "password": pwd_context.hash("student123"),
            "first_name": "Trần Thị",
            "last_name": "Bình",
            "major": "Khoa học Máy tính",
            "is_staff": False,
            "is_superuser": False,
            "is_active": True,
        },
        {
            "id": 4,
            "username": "sv003",
            "mssv": "21000103",
            "email": "sv003@student.edu.vn",
            "password": pwd_context.hash("student123"),
            "first_name": "Lê Hoàng",
            "last_name": "Cường",
            "major": "Hệ thống Thông tin",
            "is_staff": False,
            "is_superuser": False,
            "is_active": True,
        },
    ]

    for u in users:
        try:
            user_tbl.put_item(Item=u)
            print(f"Seeded user: {u['username']} (MSSV: {u['mssv']})")
        except Exception as exc:
            print(f"Error seeding user {u['username']}: {exc}")

    # 2. Courses
    courses_tbl = dynamodb.Table(tbl("courses_course"))
    courses = [
        {
            "id": 1,
            "code": "IT001",
            "name": "Nhập môn Lập trình",
            "credits": 3,
            "department": "Khoa CNTT",
            "instructor": "TS. Nguyễn Văn Toàn",
            "schedule_day": "Thứ 2",
            "schedule_periods": "1-3",
            "room": "P.A101",
            "max_capacity": 45,
            "registered_count": 0,
            "prerequisites": "Không",
            "description": "Cung cấp kiến thức nền tảng về thuật toán, tư duy giải quyết vấn đề và ngôn ngữ C/C++.",
        },
        {
            "id": 2,
            "code": "IT002",
            "name": "Cấu trúc Dữ liệu và Giải thuật",
            "credits": 4,
            "department": "Khoa CNTT",
            "instructor": "PGS.TS. Lê Hoàng Mai",
            "schedule_day": "Thứ 3",
            "schedule_periods": "4-6",
            "room": "P.A102",
            "max_capacity": 40,
            "registered_count": 0,
            "prerequisites": "IT001",
            "description": "Nghiên cứu danh sách liên kết, cây nhị phân, đồ thị, thuật toán tìm kiếm và sắp xếp nâng cao.",
        },
        {
            "id": 3,
            "code": "IT003",
            "name": "Cơ sở Dữ liệu & Hệ Quản Trị CSDL",
            "credits": 3,
            "department": "Hệ thống Thông tin",
            "instructor": "ThS. Phạm Thu Trang",
            "schedule_day": "Thứ 4",
            "schedule_periods": "1-3",
            "room": "P.B201",
            "max_capacity": 50,
            "registered_count": 0,
            "prerequisites": "IT001",
            "description": "Mô hình thực thể kết hợp (ERD), đại số quan hệ, chuẩn hóa dữ liệu và truy vấn SQL/NoSQL.",
        },
        {
            "id": 4,
            "code": "IT004",
            "name": "Mạng Máy tính & Truyền thông",
            "credits": 3,
            "department": "Mạng máy tính",
            "instructor": "TS. Vũ Hải Nam",
            "schedule_day": "Thứ 5",
            "schedule_periods": "7-9",
            "room": "P.B202",
            "max_capacity": 50,
            "registered_count": 0,
            "prerequisites": "Không",
            "description": "Mô hình OSI và TCP/IP, định tuyến IP, giao thức tầng mạng, transport layer và bảo mật mạng cơ bản.",
        },
        {
            "id": 5,
            "code": "IT005",
            "name": "Kiến trúc Điện toán Đám mây AWS",
            "credits": 3,
            "department": "Khoa CNTT",
            "instructor": "ThS. Trần Đức Minh (AWS Certified)",
            "schedule_day": "Thứ 6",
            "schedule_periods": "1-3",
            "room": "P.C301",
            "max_capacity": 35,
            "registered_count": 0,
            "prerequisites": "IT004",
            "description": "Thiết kế hệ thống phân tán chịu lỗi cao trên AWS: VPC, ECS Fargate, DynamoDB, SES, CloudFront, ALB và Terraform IaC.",
        },
        {
            "id": 6,
            "code": "IT006",
            "name": "Phát triển Ứng dụng Web Toàn diện",
            "credits": 3,
            "department": "Kỹ thuật Phần mềm",
            "instructor": "ThS. Đặng Quốc Huy",
            "schedule_day": "Thứ 7",
            "schedule_periods": "4-6",
            "room": "P.C302",
            "max_capacity": 40,
            "registered_count": 0,
            "prerequisites": "IT001, IT003",
            "description": "Phát triển ứng dụng Full-stack với React 18, FastAPI REST API, Nginx Reverse Proxy và Docker Containerization.",
        },
        {
            "id": 7,
            "code": "IT007",
            "name": "Trí tuệ Nhân tạo & Học máy",
            "credits": 3,
            "department": "Khoa học Dữ liệu",
            "instructor": "TS. Bùi Minh Quân",
            "schedule_day": "Thứ 2",
            "schedule_periods": "7-9",
            "room": "P.A203",
            "max_capacity": 35,
            "registered_count": 0,
            "prerequisites": "IT002",
            "description": "Học có giám sát, hồi quy tuyến tính, mạng nơ-ron nhân tạo và xử lý ngôn ngữ tự nhiên.",
        },
        {
            "id": 8,
            "code": "IT008",
            "name": "An toàn & Bảo mật Thông tin",
            "credits": 3,
            "department": "An toàn Thông tin",
            "instructor": "TS. Hoàng Quốc Bảo",
            "schedule_day": "Thứ 4",
            "schedule_periods": "4-6",
            "room": "P.B104",
            "max_capacity": 45,
            "registered_count": 0,
            "prerequisites": "IT004",
            "description": "Mã hóa công khai RSA/AES, chữ ký số, phòng chống lỗ hổng Web OWASP Top 10 và WAF.",
        },
    ]

    for c in courses:
        try:
            courses_tbl.put_item(Item=c)
            print(f"Seeded course: {c['code']} - {c['name']}")
        except Exception as exc:
            print(f"Error seeding course {c['code']}: {exc}")

    # 3. Registration Window
    win_tbl = dynamodb.Table(tbl("courses_registrationwindow"))
    window = {
        "id": 1,
        "name": "Đợt Đăng Ký Học Phần - Học Kỳ I (2026-2027)",
        "start_time": "2026-01-01T00:00:00Z",
        "end_time": "2026-12-31T23:59:59Z",
        "is_active": True,
    }
    try:
        win_tbl.put_item(Item=window)
        print("Seeded active registration window.")
    except Exception as exc:
        print(f"Error seeding registration window: {exc}")

    print("\nDatabase initialization and seeding completed successfully!")


if __name__ == "__main__":
    resource = get_dynamo_resource()
    client = get_dynamo_client()
    
    # Wait for DynamoDB to be ready
    max_retries = 30
    for i in range(max_retries):
        try:
            client.list_tables()
            print("Successfully connected to DynamoDB.")
            break
        except Exception as e:
            if i == max_retries - 1:
                print(f"Failed to connect to DynamoDB after {max_retries} attempts: {e}")
                raise
            print(f"Waiting for DynamoDB to be ready... ({i+1}/{max_retries})")
            time.sleep(1)

    create_tables(resource, client)
    time.sleep(1)
    seed_data(resource)
