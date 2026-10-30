import html
import logging
import smtplib
import uuid
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional

import boto3
from botocore.exceptions import ClientError

from app.config import settings
from app.database import get_table, scan_all, to_dynamo, to_native

logger = logging.getLogger(__name__)

# In-memory storage cache for fast retrieval in UI
_recent_emails: List[Dict[str, Any]] = []


def _format_datetime_vn(dt: Optional[datetime] = None) -> str:
    if dt is None:
        dt = datetime.now(timezone.utc)
    return dt.strftime("%H:%M:%S ngày %d/%m/%Y (UTC)")


def build_email_content(
    user: Dict[str, Any],
    course: Dict[str, Any],
    action: str  # "REGISTER" or "CANCEL"
) -> Dict[str, str]:
    """Generate both Plain Text and Responsive HTML email templates."""
    display_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or user.get("username", "Sinh viên")
    mssv = user.get("mssv", "N/A")
    email = user.get("email", "")
    
    course_code = course.get("code", "")
    course_name = course.get("name", "")
    credits = course.get("credits", 0)
    instructor = course.get("instructor", "Chưa phân công")
    schedule_day = course.get("schedule_day", "")
    schedule_periods = course.get("schedule_periods", "")
    room = course.get("room", "")

    timestamp = _format_datetime_vn()

    is_register = (action.upper() == "REGISTER")
    action_vn = "ĐĂNG KÝ HỌC PHẦN THÀNH CÔNG" if is_register else "HỦY HỌC PHẦN THÀNH CÔNG"
    badge_bg = "#10b981" if is_register else "#ef4444"
    status_text = "Đã đăng ký thành công" if is_register else "Đã hủy đăng ký"

    subject = f"[{settings.EMAIL_SUBJECT_PREFIX}] {action_vn} - {course_code}: {course_name}"

    plain_text = f"""
Xin chào {display_name} (MSSV: {mssv}),

Bạn vừa thực hiện {action_vn.lower()} trên Cổng thông tin Đăng ký học phần.

THÔNG TIN CHI TIẾT HỌC PHẦN:
- Mã học phần: {course_code}
- Tên học phần: {course_name}
- Số tín chỉ: {credits} tín chỉ
- Giảng viên: {instructor}
- Thời khóa biểu: {schedule_day}, Tiết {schedule_periods}
- Phòng học: {room}
- Thời điểm thực hiện: {timestamp}

Trạng thái hiện tại: {status_text}

Mọi thắc mắc vui lòng liên hệ Phòng Đào tạo hoặc phản hồi trực tiếp qua email này.
Trân trọng,
Hệ thống Quản lý Đào tạo Đại học
""".strip()

    html_content = f"""
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 32px 16px; background-color: #0f172a;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 32px 28px; text-align: left;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 6px 12px; background: rgba(255, 255, 255, 0.2); border-radius: 20px; font-size: 12px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                      {html.escape(settings.PROJECT_NAME)}
                    </span>
                    <h1 style="margin: 12px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3;">
                      {html.escape(action_vn)}
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 14px;">
                      Thông báo chính thức từ Hệ thống Đăng ký Tín chỉ
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px; color: #e2e8f0;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">
                Kính gửi sinh viên <strong style="color: #ffffff;">{html.escape(display_name)}</strong> (MSSV: <code style="background: #334155; padding: 2px 6px; border-radius: 4px; color: #38bdf8;">{html.escape(mssv)}</code>),
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Hệ thống xác nhận bạn vừa thực hiện thao tác <strong style="color: {'#34d399' if is_register else '#f87171'};">{html.escape(action_vn.lower())}</strong>. Dưới đây là thông tin chi tiết:
              </p>

              <!-- Course Details Table Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 14px; width: 38%;">Mã học phần:</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-weight: 700; color: #38bdf8; font-size: 15px; font-family: monospace;">{html.escape(str(course_code))}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 14px;">Tên học phần:</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-weight: 700; color: #ffffff; font-size: 15px;">{html.escape(str(course_name))}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 14px;">Số tín chỉ:</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-weight: 600; color: #facc15; font-size: 14px;">{html.escape(str(credits))} tín chỉ</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 14px;">Giảng viên:</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 14px;">{html.escape(str(instructor))}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 14px;">Thời khóa biểu:</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 14px;">
                    <strong style="color: #67e8f9;">{html.escape(str(schedule_day))}</strong> (Tiết {html.escape(str(schedule_periods))})
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 14px;">Phòng học:</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 14px;">{html.escape(str(room))}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; color: #94a3b8; font-size: 14px;">Thời gian xử lý:</td>
                  <td style="padding: 14px 18px; color: #94a3b8; font-size: 13px;">{html.escape(timestamp)}</td>
                </tr>
              </table>

              <!-- Status Banner -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: {badge_bg}1a; border-left: 4px solid {badge_bg}; border-radius: 4px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px; color: #e2e8f0; font-size: 14px; line-height: 1.5;">
                    Trạng thái kết quả: <strong style="color: {badge_bg};">{html.escape(status_text)}</strong>.
                    {' Hãy kiểm tra Thời khóa biểu của bạn để cập nhật lịch học chính xác.' if is_register else ' Học phần này đã được gỡ khỏi danh sách lớp học và thời khóa biểu của bạn.'}
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                Đây là thư tự động từ Cổng Thông Tin Đào Tạo. Nếu bạn không thực hiện giao dịch này, vui lòng liên hệ ngay với Ban Đào tạo để bảo vệ tài khoản.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b1329; padding: 20px 28px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 6px 0;">Cổng Đăng Ký Môn Học - Trường Đại Học ABC</p>
              <p style="margin: 0;">Cloud Architecture &bull; Powered by AWS (ECS, DynamoDB, SES, Secrets Manager)</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""".strip()

    return {
        "subject": subject,
        "plain_text": plain_text,
        "html_content": html_content
    }


def _send_ses(to_email: str, subject: str, plain_text: str, html_content: str):
    """Deliver email via AWS Simple Email Service (SES)."""
    ses_client = boto3.client("ses", region_name=settings.AWS_REGION)
    body = {
        "Text": {"Data": plain_text, "Charset": "UTF-8"},
        "Html": {"Data": html_content, "Charset": "UTF-8"},
    }
    logger.info(f"Sending SES email from {settings.DEFAULT_FROM_EMAIL} to {to_email}")
    return ses_client.send_email(
        Source=settings.DEFAULT_FROM_EMAIL,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": subject, "Charset": "UTF-8"},
            "Body": body,
        },
    )


def _send_smtp(to_email: str, subject: str, plain_text: str, html_content: str):
    """Deliver email via standard SMTP server."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.DEFAULT_FROM_EMAIL
    msg["To"] = to_email

    part1 = MIMEText(plain_text, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)

    logger.info(f"Sending SMTP email via {settings.SMTP_HOST}:{settings.SMTP_PORT} to {to_email}")
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.DEFAULT_FROM_EMAIL, [to_email], msg.as_string())


def _send_lambda(to_email: str, subject: str, plain_text: str, html_content: str):
    """
    Trigger AWS Lambda function to send email via Google SMTP.
    Works seamlessly from ECS in Private Subnet via Lambda VPC Interface Endpoint.
    Falls back to direct SMTP during local docker testing if AWS credentials are not set.
    """
    import json
    payload = {
        "to_email": to_email,
        "subject": subject,
        "plain_text": plain_text,
        "html_content": html_content,
    }

    try:
        lambda_client = boto3.client("lambda", region_name=settings.AWS_REGION)
        logger.info(f"Triggering Lambda '{settings.EMAIL_LAMBDA_NAME}' for {to_email}...")
        response = lambda_client.invoke(
            FunctionName=settings.EMAIL_LAMBDA_NAME,
            InvocationType="Event",
            Payload=json.dumps(payload),
        )
        logger.info(f"Lambda triggered successfully (HTTP {response.get('StatusCode')})")
        return response
    except Exception as exc:
        logger.warning(f"AWS Lambda invoke failed ({exc}). Falling back to SMTP.")
        return _send_smtp(to_email, subject, plain_text, html_content)


def _record_email_log(
    recipient: str,
    subject: str,
    action: str,
    provider: str,
    status: str,
    course_code: str = "",
    course_name: str = "",
    body_preview: str = ""
):
    """Store sent email log for inspection in Admin UI or Student Inbox."""
    log_item = {
        "id": str(uuid.uuid4()),
        "recipient": recipient,
        "subject": subject,
        "action": action,
        "course_code": course_code,
        "course_name": course_name,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "provider": provider,
        "status": status,
        "body_preview": body_preview[:300]
    }
    
    # Prepend to memory cache
    _recent_emails.insert(0, log_item)
    if len(_recent_emails) > 100:
        _recent_emails.pop()

    # Attempt to persist in DynamoDB table 'email_logs' if table exists
    try:
        table = get_table("email_logs")
        table.put_item(Item=to_dynamo(log_item))
    except Exception:
        pass


def send_course_notification(
    user: Dict[str, Any],
    course: Dict[str, Any],
    action: str  # "REGISTER" or "CANCEL"
):
    """
    Asynchronous / background email sender for student course registration/cancellation.
    Dispatches according to configured EMAIL_PROVIDER (ses, smtp, console, mock).
    Always records log so students/evaluators can view sent emails directly in UI.
    """
    to_email = user.get("email")
    if not to_email:
        logger.warning(f"User {user.get('username')} has no email address. Skipping email.")
        return

    content = build_email_content(user, course, action)
    subject = content["subject"]
    plain_text = content["plain_text"]
    html_content = content["html_content"]

    provider = settings.EMAIL_PROVIDER.lower()
    email_status = "SENT"

    try:
        if provider == "lambda":
            _send_lambda(to_email, subject, plain_text, html_content)
            logger.info(f"Lambda email dispatched successfully to {to_email}")
        elif provider == "ses":
            _send_ses(to_email, subject, plain_text, html_content)
            logger.info(f"SES email sent successfully to {to_email}")
        elif provider == "smtp":
            _send_smtp(to_email, subject, plain_text, html_content)
            logger.info(f"SMTP email sent successfully to {to_email}")
        elif provider == "console":
            logger.info(f"\n======== [CONSOLE EMAIL TO: {to_email}] ========\nSubject: {subject}\n\n{plain_text}\n================================================")
        else:
            # "mock" or any other mode
            logger.info(f"[MOCK EMAIL] Recorded email to {to_email}: {subject}")

    except Exception as exc:
        email_status = f"FAILED: {str(exc)[:100]}"
        logger.warning(f"Failed to send email to {to_email} via {provider}: {exc}")

    _record_email_log(
        recipient=to_email,
        subject=subject,
        action=action,
        provider=provider,
        status=email_status,
        course_code=course.get("code", ""),
        course_name=course.get("name", ""),
        body_preview=plain_text
    )


def get_email_logs(recipient: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve logged emails filtered optionally by recipient."""
    # First try DynamoDB
    try:
        table = get_table("email_logs")
        items = scan_all(table)
        if items:
            items.sort(key=lambda x: x.get("sent_at", ""), reverse=True)
            if recipient:
                return [i for i in items if i.get("recipient") == recipient]
            return items
    except Exception:
        pass

    # Fallback to memory
    if recipient:
        return [i for i in _recent_emails if i.get("recipient") == recipient]
    return list(_recent_emails)
