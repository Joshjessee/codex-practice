# Inbox Triage Agent Template

A simple, safe-by-default inbox triage agent for small businesses.

## Goals
- Classify incoming emails into actionable categories.
- Draft suggested replies in business tone.
- Enforce strict guardrails and human approval.
- Keep customization in config, not code.

## Quickstart
1. Install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Run in dry-run mode with sample data:
   ```bash
   python -m src.main --input examples/sample_emails.jsonl --dry-run
   ```

## Safety model
- Default mode is **draft-only**.
- No send actions unless `allow_send=true` and policy checks pass.
- Low-confidence classifications are escalated for review.
- Logs redact obvious PII patterns.

## Customization
Edit `config/business_profile.json`:
- `business.name`, `tone`
- `categories` and routing
- escalation contacts
- confidence thresholds

## Project structure
- `src/main.py` - CLI entrypoint
- `src/agent.py` - core orchestration
- `src/policy.py` - guardrails and gating
- `src/models.py` - typed data models
- `src/classifier.py` - simple classifier interface + baseline implementation
- `src/drafter.py` - response draft generation
- `src/logging_utils.py` - redaction and structured logging
