from __future__ import annotations

import re


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def redact(text: str) -> str:
    return EMAIL_RE.sub("[REDACTED_EMAIL]", text)
