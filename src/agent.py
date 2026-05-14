from __future__ import annotations

from src.classifier import classify_email
from src.drafter import draft_reply
from src.models import Decision, Email
from src.policy import allowed_to_send, contains_high_priority, should_escalate


class InboxTriageAgent:
    def __init__(self, profile: dict):
        self.profile = profile

    def process(self, email: Email, dry_run: bool = True) -> Decision:
        settings = self.profile["settings"]
        business = self.profile["business"]
        classification = classify_email(email, self.profile["categories"])

        route = self.profile["routing"].get(classification.category, self.profile["escalation"]["review_queue"])
        notes: list[str] = []

        if contains_high_priority(email, settings.get("high_priority_keywords", [])):
            notes.append("high-priority keyword detected")

        if should_escalate(classification, settings["low_confidence_threshold"]):
            action = "escalate_review"
            route = self.profile["escalation"]["review_queue"]
            notes.append("low-confidence classification")
            draft = None
        else:
            draft = draft_reply(email, classification.category, business["name"], business["tone"])
            can_send = allowed_to_send(settings["allow_send"], route)
            action = "send" if (can_send and not dry_run) else "draft_only"
            if action != "send":
                notes.append("human approval required")

        return Decision(
            email_id=email.id,
            category=classification.category,
            confidence=classification.confidence,
            route_to=route,
            action=action,
            draft=draft,
            notes=notes,
        )
