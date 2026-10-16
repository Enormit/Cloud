from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


# ─── AUTH / USER SCHEMAS ───────────────────────────────────────────────

class UserLogin(BaseModel):
    username_or_mssv: str = Field(..., description="Username, MSSV hoặc Email")
    password: str = Field(..., description="Mật khẩu tài khoản")


class UserOut(BaseModel):
    id: int
    username: str
    mssv: str
    email: str
    first_name: str
    last_name: str
    full_name: str
    major: Optional[str] = "Công nghệ Thông tin"
    is_staff: bool = False
    is_active: bool = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── COURSE SCHEMAS ───────────────────────────────────────────────────

class CourseBase(BaseModel):
    code: str = Field(..., description="Mã môn học, ví dụ: IT001")
    name: str = Field(..., description="Tên môn học")
    credits: int = Field(..., ge=1, le=10, description="Số tín chỉ")
    department: str = Field("Khoa CNTT", description="Khoa/Viện phụ trách")
    instructor: str = Field(..., description="Giảng viên phụ trách")
    schedule_day: str = Field(..., description="Thứ học (Thứ 2 - Thứ 7)")
    schedule_periods: str = Field(..., description="Tiết học, ví dụ: 1-3 hoặc 7-9")
    room: str = Field("P.A201", description="Phòng học")
    max_capacity: int = Field(50, ge=1, description="Sĩ số tối đa")
    prerequisites: Optional[str] = Field("", description="Môn tiên quyết nếu có")
    description: Optional[str] = Field("", description="Mô tả tóm tắt học phần")


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    credits: Optional[int] = None
    department: Optional[str] = None
    instructor: Optional[str] = None
    schedule_day: Optional[str] = None
    schedule_periods: Optional[str] = None
    room: Optional[str] = None
    max_capacity: Optional[int] = None
    prerequisites: Optional[str] = None
    description: Optional[str] = None


class CourseOut(CourseBase):
    id: int
    registered_count: int = 0
    remaining_slots: int = 0
    is_full: bool = False
    is_registered: Optional[bool] = False
    has_conflict: Optional[bool] = False
    conflict_reason: Optional[str] = None


# ─── REGISTRATION SCHEMAS ─────────────────────────────────────────────

class RegistrationCreate(BaseModel):
    course_id: int = Field(..., description="ID môn học cần đăng ký")


class RegistrationOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    course: Optional[CourseOut] = None
    created_at: str
    status: str = "CONFIRMED"


# ─── REGISTRATION WINDOW ──────────────────────────────────────────────

class RegistrationWindowOut(BaseModel):
    id: int
    name: str
    start_time: str
    end_time: str
    is_open: bool
    remaining_seconds: int = 0
    message: Optional[str] = ""


class RegistrationWindowUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_active: Optional[bool] = None


# ─── EMAIL LOG SCHEMAS ────────────────────────────────────────────────

class EmailLogOut(BaseModel):
    id: str
    recipient: str
    subject: str
    action: str  # REGISTRATION | CANCELLATION | TEST
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    sent_at: str
    provider: str
    status: str = "SENT"
    body_preview: str = ""


class TestEmailRequest(BaseModel):
    recipient: EmailStr
    subject: Optional[str] = "Thử nghiệm hệ thống gửi mail"
    content: Optional[str] = "Đây là email kiểm tra hệ thống từ trang quản trị."


# ─── DASHBOARD STATS ──────────────────────────────────────────────────

class StudentDashboardStats(BaseModel):
    total_registered_courses: int
    total_registered_credits: int
    min_credits: int
    max_credits: int
    window_open: bool
    window_info: Optional[RegistrationWindowOut] = None


class AdminStats(BaseModel):
    total_students: int
    total_courses: int
    total_registrations: int
    window_status: str
    email_provider: str
