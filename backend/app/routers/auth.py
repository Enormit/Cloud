import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import (
    create_access_token,
    find_user_by_identifier,
    get_current_user,
    verify_password,
)
from app.schemas import TokenResponse, UserLogin, UserOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Authenticate user by username, student ID (MSSV), or email.
    Returns JWT access token with user details.
    """
    user = find_user_by_identifier(credentials.username_or_mssv)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập, MSSV hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stored_password = user.get("password", "")
    if not verify_password(credentials.password, stored_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập, MSSV hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.",
        )

    token = create_access_token(data={"sub": str(user["id"])})
    
    full_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or user.get("username", "")

    user_out = UserOut(
        id=int(user["id"]),
        username=user.get("username", ""),
        mssv=user.get("mssv", user.get("username", "")),
        email=user.get("email", ""),
        first_name=user.get("first_name", ""),
        last_name=user.get("last_name", ""),
        full_name=full_name,
        major=user.get("major", "Công nghệ Thông tin"),
        is_staff=bool(user.get("is_staff") or user.get("is_superuser")),
        is_active=bool(user.get("is_active", True)),
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_out)


@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve current authenticated user profile."""
    full_name = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip() or current_user.get("username", "")
    return UserOut(
        id=int(current_user["id"]),
        username=current_user.get("username", ""),
        mssv=current_user.get("mssv", current_user.get("username", "")),
        email=current_user.get("email", ""),
        first_name=current_user.get("first_name", ""),
        last_name=current_user.get("last_name", ""),
        full_name=full_name,
        major=current_user.get("major", "Công nghệ Thông tin"),
        is_staff=bool(current_user.get("is_staff") or current_user.get("is_superuser")),
        is_active=bool(current_user.get("is_active", True)),
    )
