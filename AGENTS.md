# AGENTS.md

This repository uses `README.md` for human-facing product/setup documentation and `.agent/` for durable agent memory. Read both before making non-trivial changes.

## Startup Checklist

1. Read `README.md`, `.agent/project_overview.md`, and `.agent/session_handoff.md`.
2. Check `.agent/open_issues.md` and `.agent/decisions.md` for active constraints.
3. Confirm branch, HEAD, and worktree state before editing.
4. Do not store secrets, tokens, webhook payloads with sensitive data, or `.env` contents in repo memory files.

## Repository Layout

- `app/`: Next.js App Router pages, layouts, and server route handlers under `app/api/...`.
- `components/`: feature workspaces, shared shell, and `components/ui` primitives.
- `lib/`: core implementation boundaries.
  - `lib/db/supabase`: server/client/admin Supabase access.
  - `lib/meta`: Meta client, webhook normalization, and message preservation logic.
  - `lib/services`: feature-level orchestration for dashboard surfaces.
  - `lib/repositories`: current repository adapters, including mock-backed data.
  - `lib/archive`, `lib/audit`, `lib/auth`, `lib/config`, `lib/privacy`, `lib/tracking`: supporting infrastructure.
- `types/`: shared domain, API, Meta, and database typings.
- `supabase/migrations/`: ordered SQL migrations. Verify the latest migration set before changing docs or deploy steps.
- `.agent/`: persistent project memory, work logs, decisions, rollback notes, open issues, and handoff state.

## Run, Build, and Verification

- Install dependencies: `cmd /c npm install`
- Start local dev server: `cmd /c npm run dev`
- Production start: `cmd /c npm run start`
- Lint: `cmd /c npm run lint`
- Typecheck: `cmd /c npm run typecheck`
- Build: `cmd /c npm run build`

There is currently no dedicated automated test suite in `package.json`. Baseline verification is `typecheck`, `lint`, and `build`. If you add behavior with meaningful logic branches, add targeted tests and document how to run them here and in `.agent/project_overview.md`.

## Working Conventions

- Keep privileged Supabase and Meta access on the server side only.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY`, Meta secrets, or other privileged credentials to client code.
- Preserve the separation between route handlers, service orchestration, repository/data access, and shared types.
- Be explicit about whether a feature still uses mock-backed repositories or live persistence.
- When touching messaging, archive, audit, or webhook code, preserve raw-event retention and traceability expectations described in `README.md`.
- Keep docs synchronized with the real repo state. If commands, migrations, env vars, or architecture drift, update the relevant docs in the same task or log the gap in `.agent/open_issues.md`.

## Memory Update Rules

After every meaningful technical task, update the relevant `.agent/` files before ending the session.

- `.agent/work_log.md`: required for every meaningful task.
- `.agent/rollback_log.md`: required whenever files change or commands mutate project state.
- `.agent/decisions.md`: update when an architectural, operational, or workflow decision is made.
- `.agent/open_issues.md`: add unresolved bugs, debt, doc drift, or follow-up work.
- `.agent/session_handoff.md`: leave the repo state, what changed, what was verified, and what should happen next.

Use ISO 8601 timestamps with offset. Keep entries newest first. Summarize noisy terminal output instead of pasting long logs. Never remove history unless it is incorrect; append a correction instead.

## Required Work Log Fields

Each meaningful work item should capture:

- timestamp
- task
- context
- files changed
- commands run
- errors encountered
- fix or decision
- rationale
- rollback plan
- next steps

## Handoff Standard

Before ending a session, leave `.agent/session_handoff.md` clean and current:

- current branch and HEAD
- whether the worktree is dirty and why
- what changed in this session
- verification performed or intentionally skipped
- active risks or unresolved questions
- recommended next action for the next agent

If a task is partial, state the stopping point clearly so the next agent can resume without re-discovery.
