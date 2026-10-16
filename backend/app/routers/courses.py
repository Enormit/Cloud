import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import get_current_user
from app.database import get_table, scan_all, to_native
from app.schemas import CourseOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/courses", tags=["Courses"])


def parse_periods(periods_str: str) -> Optional[Tuple[int, int]]:
    """Parse string period like '1-3' or '7' to tuple (start, end)."""
    if not periods_str:
        return None
    match = re.search(r"(\d+)\s*-\s*(\d+)", str(periods_str))
    if match:
        return int(match.group(1)), int(match.group(2))
    single = re.search(r"(\d+)", str(periods_str))
    if single:
        p = int(single.group(1))
        return p, p
    return None


def is_schedule_conflict(day_a: str, periods_a: str, day_b: str, periods_b: str) -> bool:
    """Check whether two courses have overlapping days and periods."""
    if not day_a or not day_b or day_a.strip().lower() != day_b.strip().lower():
        return False
    range_a = parse_periods(periods_a)
    range_b = parse_periods(periods_b)
    if not range_a or not range_b:
        return False
    return max(range_a[0], range_b[0]) <= min(range_a[1], range_b[1])


def get_student_registered_course_ids(student_id: int) -> List[int]:
    """Retrieve list of course IDs already registered by the student."""
    reg_table = get_table("courses_registration")
    all_regs = scan_all(reg_table)
    return [
        int(r["course_id"])
        for r in all_regs
        if int(r.get("student_id", 0)) == student_id and r.get("status", "CONFIRMED") != "CANCELLED"
    ]


@router.get("/", response_model=List[CourseOut])
async def list_courses(
    department: Optional[str] = Query(None, description="Lọc theo khoa"),
    search: Optional[str] = Query(None, description="Tìm theo mã hoặc tên môn học"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    List all available courses with real-time remaining slots,
    registration status for the logged-in student, and conflict warnings.
    """
    courses_table = get_table("courses_course")
    courses = scan_all(courses_table)

    student_id = int(current_user["id"])
    registered_ids = set(get_student_registered_course_ids(student_id))

    # Find full course objects for registered courses to perform conflict checks
    registered_courses = [c for c in courses if int(c.get("id", 0)) in registered_ids]

    results: List[CourseOut] = []
    for c in courses:
        cid = int(c.get("id", 0))
        c_code = c.get("code", "")
        c_name = c.get("name", "")
        c_dept = c.get("department", "Khoa CNTT")

        # Filters
        if department and department.lower() not in c_dept.lower():
            continue
        if search:
            query = search.strip().lower()
            if query not in c_code.lower() and query not in c_name.lower() and query not in c.get("instructor", "").lower():
                continue

        is_registered = cid in registered_ids
        registered_count = int(c.get("registered_count", 0))
        max_capacity = int(c.get("max_capacity", 50))
        remaining_slots = max(0, max_capacity - registered_count)
        is_full = (remaining_slots <= 0)

        # Check conflict with any already registered course
        has_conflict = False
        conflict_reason = None
        if not is_registered:
            for reg_c in registered_courses:
                if is_schedule_conflict(
                    c.get("schedule_day", ""),
                    c.get("schedule_periods", ""),
                    reg_c.get("schedule_day", ""),
                    reg_c.get("schedule_periods", ""),
                ):
                    has_conflict = True
                    conflict_reason = (
                        f"Trùng lịch với môn '{reg_c.get('name')}' ({reg_c.get('code')}) "
                        f"vào {reg_c.get('schedule_day')}, Tiết {reg_c.get('schedule_periods')}"
                    )
                    break

        results.append(
            CourseOut(
                id=cid,
                code=c_code,
                name=c_name,
                credits=int(c.get("credits", 3)),
                department=c_dept,
                instructor=c.get("instructor", ""),
                schedule_day=c.get("schedule_day", "Thứ 2"),
                schedule_periods=c.get("schedule_periods", "1-3"),
                room=c.get("room", "P.A101"),
                max_capacity=max_capacity,
                prerequisites=c.get("prerequisites", ""),
                description=c.get("description", ""),
                registered_count=registered_count,
                remaining_slots=remaining_slots,
                is_full=is_full,
                is_registered=is_registered,
                has_conflict=has_conflict,
                conflict_reason=conflict_reason,
            )
        )

    # Sort courses by code
    results.sort(key=lambda x: x.code)
    return results


@router.get("/{course_id}", response_model=CourseOut)
async def get_course_detail(
    course_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get single course details."""
    table = get_table("courses_course")
    res = table.get_item(Key={"id": course_id})
    item = res.get("Item")
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy môn học yêu cầu",
        )
    c = to_native(item)
    student_id = int(current_user["id"])
    registered_ids = set(get_student_registered_course_ids(student_id))
    
    registered_count = int(c.get("registered_count", 0))
    max_capacity = int(c.get("max_capacity", 50))
    remaining = max(0, max_capacity - registered_count)

    return CourseOut(
        id=int(c["id"]),
        code=c.get("code", ""),
        name=c.get("name", ""),
        credits=int(c.get("credits", 3)),
        department=c.get("department", "Khoa CNTT"),
        instructor=c.get("instructor", ""),
        schedule_day=c.get("schedule_day", "Thứ 2"),
        schedule_periods=c.get("schedule_periods", "1-3"),
        room=c.get("room", "P.A101"),
        max_capacity=max_capacity,
        prerequisites=c.get("prerequisites", ""),
        description=c.get("description", ""),
        registered_count=registered_count,
        remaining_slots=remaining,
        is_full=(remaining <= 0),
        is_registered=(int(c["id"]) in registered_ids),
        has_conflict=False,
    )
