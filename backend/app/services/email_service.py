import logging
from typing import Optional
import resend
from backend.app.config import settings

logger = logging.getLogger(__name__)

if settings.RESEND_API:
    resend.api_key = settings.RESEND_API

# Sender address — uses custom domain when available, sandbox otherwise
_FROM_ADDRESS = (
    "NexusAI Digest <newsletter@nexusdigest.pk>"
    if settings.is_production
    else "NexusAI Digest <onboarding@resend.dev>"
)


class EmailService:

    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str) -> bool:
        """Send a transactional email via Resend. Falls back to log-only if no API key."""
        if not settings.RESEND_API:
            logger.info(
                "[EMAIL MOCK] To: %s | Subject: %s | Content preview: %.100s...",
                to_email,
                subject,
                html_content,
            )
            return True

        try:
            params = {
                "from": _FROM_ADDRESS,
                "to": to_email,
                "subject": subject,
                "html": html_content,
            }
            response = resend.Emails.send(params)
            logger.info(
                "Email sent to %s | ID: %s",
                to_email,
                response.get("id", "unknown"),
            )
            return True
        except Exception:
            logger.error("Failed to send email to %s", to_email, exc_info=True)
            return False

    @classmethod
    def send_confirmation_email(
        cls, email: str, full_name: Optional[str], token: str
    ) -> bool:
        frontend_url = settings.FRONTEND_URL.rstrip("/")
        confirm_url = f"{frontend_url}/confirm?token={token}"
        greeting = f" {full_name}" if full_name else ""
        subject = "Confirm your subscription to NexusAI Digest"

        html_content = f"""
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;
                    border:1px solid #e2e8f0;border-radius:8px;">
            <h2 style="color:#0f172a;margin-bottom:16px;">Welcome to NexusAI Digest!</h2>
            <p style="color:#475569;line-height:1.6;">Hello{greeting},</p>
            <p style="color:#475569;line-height:1.6;">
                Thank you for signing up for NexusAI Digest, Pakistan's premier newsletter
                for AI news, tools, and local spotlights.
            </p>
            <p style="color:#475569;line-height:1.6;">
                Please confirm your subscription by clicking the button below:
            </p>
            <div style="margin:24px 0;">
                <a href="{confirm_url}"
                   style="background-color:#059669;color:white;padding:12px 24px;
                          text-decoration:none;border-radius:6px;font-weight:bold;
                          display:inline-block;">
                    Confirm Subscription
                </a>
            </div>
            <p style="color:#64748b;font-size:14px;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                {confirm_url}
            </p>
            <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;" />
            <p style="color:#94a3b8;font-size:12px;">
                You received this email because you signed up on our website.
            </p>
        </div>
        """
        return cls.send_email(email, subject, html_content)

    @classmethod
    def send_newsletter_issue(
        cls,
        email: str,
        title: str,
        preview_text: str,
        html_content: str,
        unsubscribe_token: str,
    ) -> bool:
        frontend_url = settings.FRONTEND_URL.rstrip("/")
        unsub_url = f"{frontend_url}/unsubscribe?token={unsubscribe_token}"

        footer = f"""
        <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;
                    font-size:12px;color:#94a3b8;text-align:center;">
            <p>You are receiving NexusAI Digest.</p>
            <p>
                <a href="{unsub_url}" style="color:#059669;text-decoration:underline;">
                    Unsubscribe
                </a>
                from these emails.
            </p>
        </div>
        """
        return cls.send_email(email, title, html_content + footer)

    @classmethod
    def send_password_reset_email(
        cls, email: str, name: Optional[str], token: str
    ) -> bool:
        frontend_url = settings.FRONTEND_URL.rstrip("/")
        reset_url = f"{frontend_url}/reset-password?token={token}"
        greeting = f" {name}" if name else ""
        subject = "Reset your NexusAI Digest Account Password"

        html_content = f"""
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;
                    border:1px solid #e2e8f0;border-radius:8px;">
            <h2 style="color:#0f172a;margin-bottom:16px;">Password Reset Request</h2>
            <p style="color:#475569;line-height:1.6;">Hello{greeting},</p>
            <p style="color:#475569;line-height:1.6;">
                We received a request to reset your password for your NexusAI Digest account.
            </p>
            <p style="color:#475569;line-height:1.6;">
                Click the button below to set a new password. This link is valid for 1 hour:
            </p>
            <div style="margin:24px 0;">
                <a href="{reset_url}"
                   style="background-color:#f43f5e;color:white;padding:12px 24px;
                          text-decoration:none;border-radius:6px;font-weight:bold;
                          display:inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="color:#64748b;font-size:14px;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                {reset_url}
            </p>
            <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;" />
            <p style="color:#94a3b8;font-size:12px;">
                If you did not request a password reset, please ignore this email.
            </p>
        </div>
        """
        return cls.send_email(email, subject, html_content)
