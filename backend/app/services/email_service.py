from typing import Optional
import resend
from backend.app.config import settings

# Initialize resend API key
if settings.RESEND_API:
    resend.api_key = settings.RESEND_API

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str) -> bool:
        if not settings.RESEND_API:
            print(f"[Email Service] [Mock Send] To: {to_email} | Subject: {subject}")
            print(f"[Email Service] [Mock Content]: {html_content[:200]}...")
            return True

        try:
            params = {
                "from": "NexusAI Digest <newsletter@nexusdigest.pk>" if "nexusdigest.pk" in str(settings.RESEND_API) else "onboarding@resend.dev",
                "to": to_email,
                "subject": subject,
                "html": html_content
            }
            # For testing with sandbox/onboarding domain, we must send to the registered email or onboarding@resend.dev.
            # However, if using onboarding@resend.dev from-domain, we must only send to the owner's email address.
            # Let's check if the API key is sandbox or custom.
            if "onboarding@resend.dev" in params["from"] and not to_email.endswith("@resend.dev"):
                # If they are using a free tier sandbox key, we should try to send but catch errors.
                pass

            response = resend.Emails.send(params)
            print(f"[Email Service] Sent email to {to_email} successfully. ID: {response.get('id')}")
            return True
        except Exception as e:
            print(f"[Email Service] Failed to send email to {to_email}: {e}")
            # Fallback to local log/mock so the application flow doesn't break
            return False

    @classmethod
    def send_confirmation_email(cls, email: str, full_name: Optional[str], token: str) -> bool:
        # Create subscription confirmation HTML page
        confirm_url = f"http://localhost:{settings.PORT}/confirm?token={token}"
        subject = "Confirm your subscription to NexusAI Digest"
        
        name_greet = f" {full_name}" if full_name else ""
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Welcome to NexusAI Digest!</h2>
            <p style="color: #475569; line-height: 1.6;">Hello{name_greet},</p>
            <p style="color: #475569; line-height: 1.6;">Thank you for signing up for NexusAI Digest, Pakistan's premier newsletter for AI news, tools, and local spotlights.</p>
            <p style="color: #475569; line-height: 1.6;">Please confirm your subscription by clicking the button below:</p>
            <div style="margin: 24px 0;">
                <a href="{confirm_url}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirm Subscription</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser: <br/> {confirm_url}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">You received this email because you signed up on our website.</p>
        </div>
        """
        return cls.send_email(email, subject, html_content)

    @classmethod
    def send_newsletter_issue(cls, email: str, title: str, preview_text: str, html_content: str, unsubscribe_token: str) -> bool:
        unsub_url = f"http://localhost:{settings.PORT}/unsubscribe?token={unsubscribe_token}"
        
        # Append unsubscribe footer to newsletter html_content if not present
        footer = f"""
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p>You are receiving NexusAI Digest. </p>
            <p><a href="{unsub_url}" style="color: #059669; text-decoration: underline;">Unsubscribe</a> from these emails.</p>
        </div>
        """
        full_content = html_content + footer
        return cls.send_email(email, title, full_content)
