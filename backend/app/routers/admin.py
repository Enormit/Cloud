import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_staff_user
from app.config import settings
from app.database import get_table, next_numeric_id, scan_all, to_dynamo, to_native
from app.routers.registrations import get_active_window
from app.schemas import (
    AdminStats,
    CourseCreate,
    CourseOut,
    CourseUpdate,
    RegistrationWindowOut,
    RegistrationWindowUpdate,
    UserOut,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats)
async def get_admin_dashboard_stats(
    current_user: Dict[str, Any] = Depends(get_current_staff_user),
):
    """Retrieve system overview metrics."""
    users_tbl = get_table("accounts_user")
    courses_tbl = get_table("courses_course")
    regs_tbl = get_table("courses_registration")

    users = scan_all(users_tbl)
    courses = scan_all(courses_tbl)
    regs = scan_all(regs_tbl)
    active_regs = [r for r in regs if r.get("status") != "CANCELLED"]

    win = get_active_window()
    status_str = "Đang mở đăng ký" if win.is_open else "Đang đóng"

    return AdminStats(
        total_students=len(users),
        total_courses=len(courses),
        total_registrations=len(active_regs),
        window_status=status_str,
        email_provider=settings.EMAIL_PROVIDER.upper(),
    )


@router.post("/courses", response_model=CourseOut)
async def create_course(
    payload: CourseCreate,
    current_user: Dict[str, Any] = Depends(get_current_staff_user),
):
    """Create a new course offering."""
    courses_tbl = get_table("courses_course")
    new_id = next_numeric_id("courses_course")

    new_course = payload.model_dump()
    new_course["id"] = new_id
    new_course["registered_count"] = 0

    courses_tbl.put_item(Item=to_dynamo(new_course))
    return CourseOut(
        **new_course,
        remaining_slots=new_course["max_capacity"],
        is_full=False,
        is_registered=False,
    )


@router.put("/courses/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: int,
    payload: CourseUpdate,
    current_user: Dict[str, Any] = Depends(get_current_staff_user),
):
    """Update existing course attributes."""
    courses_tbl = get_table("courses_course")
    res = courses_tbl.get_item(Key={"id": course_id})
    item = res.get("Item")
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy môn học",
        )

    course = to_native(item)
    update_data = payload.model_dump(exclude_unset=True)
    course.update(update_data)

    courses_tbl.put_item(Item=to_dynamo(course))

    reg_cnt = int(course.get("registered_count", 0))
    max_cap = int(course.get("max_capacity", 50))
    rem = max(0, max_cap - reg_cnt)

    return CourseOut(
        **course,
        remaining_slots=rem,
        is_full=(rem <= 0),
        is_registered=False,
    )


@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int,
    current_user: Dict[str, Any] = Depends(get_current_staff_user),
):
    """Delete a course offering."""
    courses_tbl = get_table("courses_course")
    courses_tbl.delete_item(Key={"id": course_id})
    return {"status": "success", "message": f"Đã xóa môn học có ID {course_id}"}


@router.get("/courses/{course_id}/students")
async def get_course_roster(
    course_id: int,
    current_user: Dict[str, Any] = Depends(get_current_staff_user),
):
    """List all students currently enrolled in the specified course."""
    regs_tbl = get_table("courses_registration")
    users_tbl = get_table("accounts_user")

    regs = scan_all(regs_tbl)
    course_regs = [
        r for r in regs
        if int(r.get("course_id", 0)) == course_id and r.get("status") != "CANCELLED"
    ]

    all_users = {int(u["id"]): u for u in scan_all(users_tbl)}

    students = []
    for r in course_regs:
        sid = int(r.get("student_id", 0))
        u = all_users.get(sid)
        if u:
            full_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip() or u.get("username", "")
            students.append({
                "student_id": sid,
                "username": u.get("username"),
                "mssv": u.get("mssv", u.get("username")),
                "full_name": full_name,
                "email": u.get("email"),
                "major": u.get("major", "CNTT"),
                "registered_at": r.get("created_at"),
            })

    students.sort(key=lambda s: s["mssv"])
    return {"course_id": course_id, "total_enrolled": len(students), "students": students}


@router.put("/window", response_model=RegistrationWindowOut)
async def update_registration_window(
    payload: RegistrationWindowUpdate,
    current_user: Dict[str, Any] = Depends(get_current_staff_user),
):
    """Update registration window dates and active status."""
    tbl = get_table("courses_registrationwindow")
    items = scan_all(tbl)
    wid = 1
    target = items[0] if items else {
        "id": 1,
        "name": "Đợt Đăng Ký Học Kỳ I",
        "start_time": "2026-01-01T00:00:00Z",
        "end_time": "2026-12-31T23:59:59Z",
        "is_active": True,
    }

    data = payload.model_dump(exclude_unset=True)
    target.update(data)
    tbl.put_item(Item=to_dynamo(target))

    return RegistrationWindowOut(
        id=int(target["id"]),
        name=target.get("name", "Đợt đăng ký"),
        start_time=target.get("start_time", ""),
        end_time=target.get("end_time", ""),
        is_open=bool(target.get("is_active", True)),
        remaining_seconds=86400,
        message="Cập nhật thành công",
    )
