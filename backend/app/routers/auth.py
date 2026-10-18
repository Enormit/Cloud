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
        phone=user.get("phone", ""),
        address=user.get("address", ""),
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
        phone=current_user.get("phone", ""),
        address=current_user.get("address", ""),
        is_staff=bool(current_user.get("is_staff") or current_user.get("is_superuser")),
        is_active=bool(current_user.get("is_active", True)),
    )


@router.put("/profile", response_model=UserOut)
async def update_my_profile(
    payload: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Cập nhật thông tin cá nhân của người dùng hiện tại (Email, họ tên, số điện thoại, địa chỉ).
    Bảo vệ các thông tin quan trọng không được phép tự sửa: ID, MSSV, Username, Quyền hạn (is_staff/is_superuser/is_active), Chuyên ngành/Major.
    """
    from app.database import get_table, to_dynamo
    table = get_table("accounts_user")
    user_id = int(current_user["id"])

    # Kiểm tra nếu đổi email thì email mới không được trùng với người dùng khác
    new_email = payload.email.strip().lower() if payload.email else None
    if new_email and new_email != current_user.get("email", "").lower():
        existing_user = find_user_by_identifier(new_email)
        if existing_user and int(existing_user["id"]) != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{new_email}' đã được sử dụng bởi tài khoản khác trong hệ thống.",
            )

    # Chuẩn bị các trường cho phép cập nhật
    update_data = {}
    if payload.email is not None:
        update_data["email"] = new_email
    if payload.first_name is not None:
        update_data["first_name"] = payload.first_name.strip()
    if payload.last_name is not None:
        update_data["last_name"] = payload.last_name.strip()
    if payload.phone is not None:
        update_data["phone"] = payload.phone.strip()
    if payload.address is not None:
        update_data["address"] = payload.address.strip()

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không có thông tin nào được cung cấp để cập nhật.",
        )

    # Cập nhật vào DynamoDB
    update_expr_parts = []
    expr_attr_values = {}
    expr_attr_names = {}

    for k, v in update_data.items():
        placeholder = f":{k}"
        name_placeholder = f"#{k}"
        update_expr_parts.append(f"{name_placeholder} = {placeholder}")
        expr_attr_values[placeholder] = to_dynamo(v)
        expr_attr_names[name_placeholder] = k

    update_expression = "SET " + ", ".join(update_expr_parts)

    try:
        response = table.update_item(
            Key={"id": user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expr_attr_names,
            ExpressionAttributeValues=expr_attr_values,
            ReturnValues="ALL_NEW",
        )
        updated_item = response.get("Attributes", {})
        # Gộp với current_user để có dữ liệu đầy đủ
        merged_user = {**current_user, **to_native(updated_item)}
    except Exception as exc:
        logger.error(f"Error updating user profile {user_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể cập nhật hồ sơ cá nhân: {str(exc)}",
        )

    full_name = f"{merged_user.get('first_name', '')} {merged_user.get('last_name', '')}".strip() or merged_user.get("username", "")
    return UserOut(
        id=int(merged_user["id"]),
        username=merged_user.get("username", ""),
        mssv=merged_user.get("mssv", merged_user.get("username", "")),
        email=merged_user.get("email", ""),
        first_name=merged_user.get("first_name", ""),
        last_name=merged_user.get("last_name", ""),
        full_name=full_name,
        major=merged_user.get("major", "Công nghệ Thông tin"),
        phone=merged_user.get("phone", ""),
        address=merged_user.get("address", ""),
        is_staff=bool(merged_user.get("is_staff") or merged_user.get("is_superuser")),
        is_active=bool(merged_user.get("is_active", True)),
    )
