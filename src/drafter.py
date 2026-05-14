from __future__ import annotations

from src.models import Draft, Email


def draft_reply(email: Email, category: str, business_name: str, tone: str) -> Draft:
    subject = f"Re: {email.subject}"
    if category == "billing":
        body = (
            f"Hi,\n\nThanks for reaching out to {business_name}. "
            "We received your billing question and will review the invoice details shortly.\n\n"
            "Best,\nTeam"
        )
    elif category == "sales_lead":
        body = (
            f"Hi,\n\nThanks for your interest in {business_name}. "
            "We'd be happy to prepare a quote. Could you share your timeline and service priorities?\n\n"
            "Best,\nTeam"
        )
    elif category == "support":
        body = (
            f"Hi,\n\nThanks for contacting {business_name} support. "
            "We're looking into this now and will follow up with next steps.\n\n"
            "Best,\nTeam"
        )
    else:
        body = f"Hi,\n\nThanks for your email. We'll route this to the right team.\n\nBest,\n{business_name}"

    return Draft(subject=subject, body=f"[Tone: {tone}]\n\n{body}")
