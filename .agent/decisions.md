# Decisions

Purpose: record active architectural and workflow decisions. Keep entries newest first and append updates instead of rewriting history.

## DEC-2026-04-01-02 | Use README for product/setup docs and .agent for agent memory

- Status: active
- Date: 2026-04-01T11:39:33-05:00
- Decision: Treat `README.md` as the human-facing product/setup reference and `.agent/` as the canonical location for agent operational memory, work history, rollback notes, and session handoff.
- Rationale: The repo already has a useful README. Splitting responsibilities avoids bloating product docs with session history while keeping agent memory durable and versioned.
- Consequences: When commands, architecture, or migration state change, update the appropriate place rather than duplicating conflicting copies.

## DEC-2026-04-01-01 | Keep agent memory in tracked Markdown files under .agent

- Status: active
- Date: 2026-04-01T11:39:33-05:00
- Decision: Store persistent project memory in tracked Markdown files under `.agent/`, with newest-first structured entries and ISO 8601 timestamps.
- Rationale: Markdown is inspectable in git history, easy for future agents to edit, and does not depend on local tooling or external services.
- Consequences: Every meaningful task must update `work_log`, `session_handoff`, and `rollback_log`, plus `decisions` or `open_issues` when applicable.
