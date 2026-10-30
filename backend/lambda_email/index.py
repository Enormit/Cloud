import json
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger()
logger.setLevel(logging.INFO)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
DEFAULT_FROM = os.getenv("DEFAULT_FROM_EMAIL", SMTP_USER)


def handler(event, context):
    """
    AWS Lambda handler for sending email via Google SMTP.
    This Lambda runs serverless (outside the VPC private subnet),
    allowing direct outbound connections to smtp.gmail.com without a NAT Gateway.
    """
    logger.info("Received email event: %s", json.dumps(event, ensure_ascii=False))

    # Parse payload if passed as string
    if isinstance(event, str):
        try:
            event = json.loads(event)
        except Exception:
            pass

    to_email = event.get("to_email") or event.get("recipient")
    subject = event.get("subject", "Thông báo Đăng ký học phần")
    plain_text = event.get("plain_text", "")
    html_content = event.get("html_content", "")

    if not to_email:
        logger.error("Missing recipient 'to_email' in event payload.")
        return {"status": "error", "message": "Missing recipient"}

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Cổng Đào Tạo Đại Học <{DEFAULT_FROM}>"
    msg["To"] = to_email

    if plain_text:
        msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    if html_content:
        msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        logger.info("Connecting to SMTP server %s:%d...", SMTP_HOST, SMTP_PORT)
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.starttls()
            if SMTP_USER and SMTP_PASSWORD:
                logger.info("Authenticating as %s...", SMTP_USER)
                server.login(SMTP_USER, SMTP_PASSWORD)
            logger.info("Delivering email to %s...", to_email)
            server.sendmail(DEFAULT_FROM, [to_email], msg.as_string())

        logger.info("Email successfully delivered to %s", to_email)
        return {
            "status": "success",
            "message": f"Email delivered to {to_email}",
            "recipient": to_email,
        }
    except Exception as exc:
        logger.error("Failed to send email via SMTP %s: %s", SMTP_HOST, exc)
        raise exc
