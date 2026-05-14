from __future__ import annotations

from src.models import Classification, Email


def classify_email(email: Email, categories: list[str]) -> Classification:
    text = f"{email.subject} {email.body}".lower()

    if any(k in text for k in ["invoice", "payment", "charge"]):
        return Classification(category="billing", confidence=0.92, reasons=["billing keywords"])
    if any(k in text for k in ["quote", "budget", "proposal", "pricing"]):
        return Classification(category="sales_lead", confidence=0.9, reasons=["sales intent keywords"])
    if any(k in text for k in ["help", "issue", "broken", "error"]):
        return Classification(category="support", confidence=0.88, reasons=["support keywords"])
    if any(k in text for k in ["win big", "prize", "crypto", "guaranteed"]):
        return Classification(category="spam", confidence=0.95, reasons=["spam keywords"])

    fallback = "fyi" if "fyi" in categories else categories[-1]
    return Classification(category=fallback, confidence=0.6, reasons=["no strong signal"])
