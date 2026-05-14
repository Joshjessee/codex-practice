from __future__ import annotations

from src.models import Classification, Email


def should_escalate(classification: Classification, threshold: float) -> bool:
    return classification.confidence < threshold


def allowed_to_send(allow_send: bool, recipient: str) -> bool:
    approved_domains = {"acme.example"}
    domain = recipient.split("@")[-1]
    return allow_send and domain in approved_domains


def contains_high_priority(email: Email, keywords: list[str]) -> bool:
    text = f"{email.subject} {email.body}".lower()
    return any(k.lower() in text for k in keywords)
