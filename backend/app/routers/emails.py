import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_staff_user, get_current_user
from app.config import settings
from app.email_service import _send_lambda, _send_ses, _send_smtp, get_email_logs
from app.schemas import EmailLogOut, TestEmailRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/emails", tags=["Emails"])


@router.get("/my-inbox", response_model=List[EmailLogOut])
async def get_my_email_inbox(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieve notification emails delivered to the current student.
    Enables instant verification and viewing of emails sent upon registration/cancellation.
    """
    user_email = current_user.get("email", "")
    logs = get_email_logs(recipient=user_email)
    return logs


@router.get("/logs", response_model=List[EmailLogOut])
async def list_all_email_logs(current_user: Dict[str, Any] = Depends(get_current_staff_user)):
    """Staff only: list all system email delivery logs."""
    return get_email_logs()


@router.post("/send-test")
async def send_test_email(
    payload: TestEmailRequest,
    current_user: Dict[str, Any] = Depends(get_current_staff_user),
):
    """Staff only: test SES or SMTP email delivery with custom address."""
    provider = settings.EMAIL_PROVIDER.lower()
    subject = f"[{settings.EMAIL_SUBJECT_PREFIX}] {payload.subject}"
    body = payload.content

    try:
        if provider == "lambda":
            _send_lambda(payload.recipient, subject, body, f"<p>{body}</p>")
        elif provider == "ses":
            _send_ses(payload.recipient, subject, body, f"<p>{body}</p>")
        elif provider == "smtp":
            _send_smtp(payload.recipient, subject, body, f"<p>{body}</p>")
        return {
            "status": "success",
            "message": f"Email kiểm tra đã được gửi thành công đến {payload.recipient} qua {provider.upper()}!",
            "provider": provider,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gửi email qua {provider.upper()} thất bại: {str(exc)}",
        )
