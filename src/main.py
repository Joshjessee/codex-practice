from __future__ import annotations

import argparse
import json
from pathlib import Path

from src.agent import InboxTriageAgent
from src.logging_utils import redact
from src.models import Email


def load_jsonl(path: Path) -> list[Email]:
    emails: list[Email] = []
    for line in path.read_text().splitlines():
        if line.strip():
            emails.append(Email.from_dict(json.loads(line)))
    return emails


def main() -> None:
    parser = argparse.ArgumentParser(description="Inbox triage agent")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--profile", type=Path, default=Path("config/business_profile.json"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    profile = json.loads(args.profile.read_text())
    agent = InboxTriageAgent(profile)

    for email in load_jsonl(args.input):
        decision = agent.process(email, dry_run=args.dry_run)
        print(redact(decision.to_json()))


if __name__ == "__main__":
    main()
