from __future__ import annotations

from dataclasses import asdict, dataclass, field
import json


@dataclass
class Email:
    id: str
    from_address: str
    subject: str
    body: str

    @staticmethod
    def from_dict(data: dict) -> "Email":
        return Email(
            id=str(data["id"]),
            from_address=str(data["from_address"]),
            subject=str(data["subject"]),
            body=str(data["body"]),
        )


@dataclass
class Classification:
    category: str
    confidence: float
    reasons: list[str] = field(default_factory=list)


@dataclass
class Draft:
    subject: str
    body: str


@dataclass
class Decision:
    email_id: str
    category: str
    confidence: float
    route_to: str
    action: str
    draft: Draft | None = None
    notes: list[str] = field(default_factory=list)

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False)
