import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.auth import get_current_user
from app.config import settings
from app.database import get_table, next_numeric_id, scan_all, to_dynamo, to_native
from app.email_service import send_course_notification
from app.routers.courses import is_schedule_conflict
from app.schemas import (
    CourseOut,
    RegistrationCreate,
    RegistrationOut,
    RegistrationWindowOut,
    StudentDashboardStats,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/registrations", tags=["Registrations"])


class Tuple_Window:
    def __init__(self, is_open: bool, window_info: Optional[Dict[str, Any]], message: str):
        self.is_open = is_open
        self.window_info = window_info
        self.message = message


def check_registration_window() -> Tuple_Window:
    """Check if course registration window is currently open."""
    return get_active_window()


def get_active_window() -> Tuple_Window:
    """Retrieve and evaluate active registration window."""
    try:
        window_table = get_table("courses_registrationwindow")
        windows = scan_all(window_table)
        if not windows:
            # Default fallback: window is open for current semester
            return Tuple_Window(
                is_open=True,
                window_info={
                    "id": 1,
                    "name": "Đợt Đăng Ký Học Kỳ Hiện Tại",
                    "start_time": "2026-01-01T00:00:00Z",
                    "end_time": "2026-12-31T23:59:59Z",
                    "is_active": True,
                },
                message="Đợt đăng ký đang mở.",
            )

        now = datetime.now(timezone.utc)
        for w in windows:
            if not w.get("is_active", True):
                continue
            start_str = w.get("start_time", "")
            end_str = w.get("end_time", "")
            try:
                # Basic ISO parse
                start_dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
                end_dt = datetime.fromisoformat(end_str.replace("Z", "+00:00"))
                if start_dt <= now <= end_dt:
                    rem_secs = int((end_dt - now).total_seconds())
                    w["remaining_seconds"] = max(0, rem_secs)
                    return Tuple_Window(is_open=True, window_info=w, message="Đợt đăng ký đang mở")
                elif now < start_dt:
                    return Tuple_Window(
                        is_open=False,
                        window_info=w,
                        message=f"Đợt đăng ký chưa bắt đầu (Mở lúc {start_str})"
                    )
                else:
                    return Tuple_Window(
                        is_open=False,
                        window_info=w,
                        message="Đợt đăng ký đã kết thúc"
                    )
            except Exception:
                # If date format is non-standard, treat active flag as true
                return Tuple_Window(is_open=True, window_info=w, message="Đang trong đợt đăng ký")

        return Tuple_Window(is_open=False, window_info=None, message="Hiện không có đợt đăng ký nào được mở.")
    except Exception as exc:
        logger.warning(f"Error checking registration window: {exc}")
        return Tuple_Window(is_open=True, window_info=None, message="Đợt đăng ký mặc định đang mở")


@router.get("/window", response_model=RegistrationWindowOut)
async def get_registration_window():
    """Retrieve registration window status and countdown timer."""
    res = get_active_window()
    w = res.window_info or {
        "id": 1,
        "name": "Đợt Đăng Ký Học Phần Chính Thức",
        "start_time": datetime.now(timezone.utc).isoformat(),
        "end_time": datetime.now(timezone.utc).isoformat(),
        "remaining_seconds": 86400,
    }
    return RegistrationWindowOut(
        id=int(w.get("id", 1)),
        name=w.get("name", "Đợt đăng ký học phần"),
        start_time=w.get("start_time", ""),
        end_time=w.get("end_time", ""),
        is_open=res.is_open,
        remaining_seconds=w.get("remaining_seconds", 0),
        message=res.message,
    )


@router.get("/", response_model=List[RegistrationOut])
async def list_my_registrations(current_user: Dict[str, Any] = Depends(get_current_user)):
    """List all enrolled courses for the logged-in student."""
    student_id = int(current_user["id"])
    reg_table = get_table("courses_registration")
    all_regs = scan_all(reg_table)
    my_regs = [r for r in all_regs if int(r.get("student_id", 0)) == student_id and r.get("status") != "CANCELLED"]

    courses_table = get_table("courses_course")
    all_courses = {int(c["id"]): c for c in scan_all(courses_table)}

    results = []
    for r in my_regs:
        cid = int(r.get("course_id", 0))
        c_item = all_courses.get(cid)
        c_out = None
        if c_item:
            reg_cnt = int(c_item.get("registered_count", 0))
            max_cap = int(c_item.get("max_capacity", 50))
            c_out = CourseOut(
                id=cid,
                code=c_item.get("code", ""),
                name=c_item.get("name", ""),
                credits=int(c_item.get("credits", 3)),
                department=c_item.get("department", "Khoa CNTT"),
                instructor=c_item.get("instructor", ""),
                schedule_day=c_item.get("schedule_day", "Thứ 2"),
                schedule_periods=c_item.get("schedule_periods", "1-3"),
                room=c_item.get("room", "P.A101"),
                max_capacity=max_cap,
                prerequisites=c_item.get("prerequisites", ""),
                description=c_item.get("description", ""),
                registered_count=reg_cnt,
                remaining_slots=max(0, max_cap - reg_cnt),
                is_full=(reg_cnt >= max_cap),
                is_registered=True,
                has_conflict=False,
            )
        results.append(
            RegistrationOut(
                id=int(r.get("id", 0)),
                student_id=student_id,
                course_id=cid,
                course=c_out,
                created_at=r.get("created_at", ""),
                status=r.get("status", "CONFIRMED"),
            )
        )

    results.sort(key=lambda x: x.created_at, reverse=True)
    return results


@router.get("/stats", response_model=StudentDashboardStats)
async def get_student_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Summary statistics for the student dashboard."""
    student_id = int(current_user["id"])
    reg_table = get_table("courses_registration")
    all_regs = scan_all(reg_table)
    my_regs = [r for r in all_regs if int(r.get("student_id", 0)) == student_id and r.get("status") != "CANCELLED"]

    courses_table = get_table("courses_course")
    all_courses = {int(c["id"]): c for c in scan_all(courses_table)}

    total_credits = 0
    for r in my_regs:
        cid = int(r.get("course_id", 0))
        c = all_courses.get(cid)
        if c:
            total_credits += int(c.get("credits", 0))

    window_res = get_active_window()
    w_info = None
    if window_res.window_info:
        w_info = RegistrationWindowOut(
            id=int(window_res.window_info.get("id", 1)),
            name=window_res.window_info.get("name", "Đợt đăng ký"),
            start_time=window_res.window_info.get("start_time", ""),
            end_time=window_res.window_info.get("end_time", ""),
            is_open=window_res.is_open,
            remaining_seconds=window_res.window_info.get("remaining_seconds", 0),
            message=window_res.message,
        )

    return StudentDashboardStats(
        total_registered_courses=len(my_regs),
        total_registered_credits=total_credits,
        min_credits=settings.MIN_CREDITS,
        max_credits=settings.MAX_CREDITS,
        window_open=window_res.is_open,
        window_info=w_info,
    )


@router.post("/register")
async def register_course(
    payload: RegistrationCreate,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Register a course for student:
    - Validates registration window is open
    - Validates course exists
    - Validates not already registered
    - Validates capacity (remaining slots > 0)
    - Validates schedule conflicts
    - Validates maximum credits limit
    - Dispatches confirmation email to student via SES/SMTP/Mock in background!
    """
    student_id = int(current_user["id"])
    course_id = payload.course_id

    # 1. Window validation
    win = get_active_window()
    if not win.is_open and not (current_user.get("is_staff") or current_user.get("is_superuser")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cổng đăng ký đang đóng: {win.message}",
        )

    # 2. Course validation
    courses_table = get_table("courses_course")
    res = courses_table.get_item(Key={"id": course_id})
    course_item = res.get("Item")
    if not course_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy môn học yêu cầu",
        )
    course = to_native(course_item)

    # 3. Check already registered
    reg_table = get_table("courses_registration")
    all_regs = scan_all(reg_table)
    my_active_regs = [
        r for r in all_regs
        if int(r.get("student_id", 0)) == student_id and r.get("status") != "CANCELLED"
    ]
    if any(int(r.get("course_id", 0)) == course_id for r in my_active_regs):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bạn đã đăng ký môn học '{course.get('name')}' ({course.get('code')}) rồi!",
        )

    # 4. Check capacity
    registered_count = int(course.get("registered_count", 0))
    max_capacity = int(course.get("max_capacity", 50))
    if registered_count >= max_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lớp học phần '{course.get('name')}' đã hết chỗ (Sĩ số: {registered_count}/{max_capacity})!",
        )

    # 5. Check schedule conflict & credit limits
    all_courses_map = {int(c["id"]): c for c in scan_all(courses_table)}
    current_credits = 0
    for r in my_active_regs:
        c_exist = all_courses_map.get(int(r.get("course_id", 0)))
        if c_exist:
            current_credits += int(c_exist.get("credits", 0))
            if is_schedule_conflict(
                course.get("schedule_day", ""),
                course.get("schedule_periods", ""),
                c_exist.get("schedule_day", ""),
                c_exist.get("schedule_periods", ""),
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Trùng lịch học: Môn '{course.get('name')}' trùng với môn "
                        f"'{c_exist.get('name')}' vào {course.get('schedule_day')}, "
                        f"Tiết {course.get('schedule_periods')}!"
                    ),
                )

    new_credits = current_credits + int(course.get("credits", 0))
    if new_credits > settings.MAX_CREDITS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Vượt quá giới hạn tín chỉ: Tổng số tín chỉ sau khi đăng ký là {new_credits} "
                f"(Giới hạn tối đa là {settings.MAX_CREDITS} tín chỉ/học kỳ)!"
            ),
        )

    # 6. Save registration
    reg_id = next_numeric_id("courses_registration")
    now_iso = datetime.now(timezone.utc).isoformat()
    new_reg = {
        "id": reg_id,
        "student_id": student_id,
        "course_id": course_id,
        "created_at": now_iso,
        "status": "CONFIRMED",
    }
    reg_table.put_item(Item=to_dynamo(new_reg))

    # 7. Increment course registered count
    new_count = registered_count + 1
    course["registered_count"] = new_count
    courses_table.update_item(
        Key={"id": course_id},
        UpdateExpression="SET registered_count = :cnt",
        ExpressionAttributeValues={":cnt": new_count},
    )

    # 8. Send notification email asynchronously
    background_tasks.add_task(
        send_course_notification,
        user=current_user,
        course=course,
        action="REGISTER",
    )

    return {
        "status": "success",
        "message": f"Đăng ký môn học '{course.get('name')}' thành công! Email xác nhận đã được gửi tới {current_user.get('email')}.",
        "registration_id": reg_id,
        "course": course,
    }


@router.delete("/{course_id}/cancel")
async def cancel_course(
    course_id: int,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Cancel / Drop a registered course:
    - Validates registration window
    - Validates student is enrolled in the course
    - Removes registration record
    - Decrements course registered count
    - Dispatches cancellation notification email in background!
    """
    student_id = int(current_user["id"])

    # 1. Window validation
    win = get_active_window()
    if not win.is_open and not (current_user.get("is_staff") or current_user.get("is_superuser")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cổng đăng ký đang đóng: Không thể hủy môn trong thời gian này ({win.message})",
        )

    # 2. Check registration exists
    reg_table = get_table("courses_registration")
    all_regs = scan_all(reg_table)
    target_reg = next(
        (r for r in all_regs if int(r.get("student_id", 0)) == student_id and int(r.get("course_id", 0)) == course_id and r.get("status") != "CANCELLED"),
        None,
    )
    if not target_reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bạn chưa đăng ký môn học này hoặc môn học đã được hủy trước đó",
        )

    # 3. Retrieve course item
    courses_table = get_table("courses_course")
    res = courses_table.get_item(Key={"id": course_id})
    course_item = res.get("Item")
    course = to_native(course_item) if course_item else {"id": course_id, "code": f"ID-{course_id}", "name": "Môn học"}

    # 4. Remove / Delete registration
    reg_table.delete_item(Key={"id": int(target_reg["id"])})

    # 5. Decrement course registered count
    curr_count = int(course.get("registered_count", 1))
    new_count = max(0, curr_count - 1)
    course["registered_count"] = new_count
    courses_table.update_item(
        Key={"id": course_id},
        UpdateExpression="SET registered_count = :cnt",
        ExpressionAttributeValues={":cnt": new_count},
    )

    # 6. Send cancellation email asynchronously
    background_tasks.add_task(
        send_course_notification,
        user=current_user,
        course=course,
        action="CANCEL",
    )

    return {
        "status": "success",
        "message": f"Hủy đăng ký môn học '{course.get('name')}' thành công! Email thông báo hủy môn đã được gửi tới {current_user.get('email')}.",
        "course_id": course_id,
    }
