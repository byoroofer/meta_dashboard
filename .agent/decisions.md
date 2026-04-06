# Decisions

Purpose: record active architectural and workflow decisions. Keep entries newest first and append updates instead of rewriting history.

## DEC-2026-04-06-06 | Ship marketplace-deals with demo adapters first and keep live sources opt-in

- Status: active
- Date: 2026-04-06T10:55:13.2914491-05:00
- Decision: Implement `/marketplace-deals` with a modular source-adapter boundary, full Supabase persistence, and OpenAI-assisted pricing analysis, but keep the initial enabled adapters demo-only until each live marketplace source has a source-specific API or a robots-safe public-access path approved.
- Rationale: The product requirement explicitly forbids shady scraping and requires respect for robots.txt, rate limits, site terms, and legal boundaries. Shipping the full page, scan pipeline, scoring engine, storage model, and operator workflow now keeps delivery moving without falsely implying that protected/private sources are safe to crawl.
- Consequences: Operators can use the full UI, saved searches, scan history, status tracking, CSV export, and AI reasoning immediately in demo mode. Enabling live sources later should be an additive adapter task rather than a page rewrite, but current production use for real online pricing still depends on future source-by-source adapter work.

## DEC-2026-04-06-05 | Read Instagram history from the Page-backed conversations edge

- Status: active
- Date: 2026-04-06T08:18:27.6835584-05:00
- Decision: For Instagram history imports, call `/{page-id}/conversations` with `platform=instagram` and keep the Instagram asset external ID only for storage/thread attribution. Do not use the direct `/{ig-business-account-id}/conversations` edge in the importer.
- Rationale: The first live deployment of conversation-source diagnostics immediately exposed that direct `/{ig-business-account-id}/conversations` calls fail for this app in production with Meta capability error `(#3)`, while the Page-backed conversations edge is the path that actually yields accessible IG threads.
- Consequences: IG sync metadata now needs to track both `requestedNodeId` and `assetExternalId`, because the node used for the API request is the Page ID while the stored asset/thread identity remains the IG business account ID.

## DEC-2026-04-05-04 | Use scoped Meta sync as the operator path for newly assigned inbox assets

- Status: active
- Date: 2026-04-05T18:23:23.6479562-05:00
- Decision: Add and prefer a scoped Meta sync path for the currently selected business or selected Page/Instagram asset from Inbox and Leads, while keeping the heavier full importer available for broader refreshes.
- Rationale: Multi-page full imports now exceed Vercel runtime limits when inbox backfills run together. Operators still need a dependable way to populate newly assigned assets such as `brookevinson` without waiting for a full cross-business import.
- Consequences: Inbox and Leads can now populate a selected scope independently, but whole-account refreshes are still subject to the existing full-import timeout until that path is further split or moved off the current request runtime.

## DEC-2026-04-05-03 | Keep the social engagement bot as a standalone Python service

- Status: active
- Date: 2026-04-05T15:20:30.5104131-05:00
- Decision: Implement the Reddit/Facebook/OpenAI social engagement bot as a separate Python package under `automation/social_engagement_bot` instead of wiring it directly into the existing Next.js runtime.
- Rationale: The current dashboard is a TypeScript/Next.js app with unrelated in-progress work in the main worktree. A standalone Python service isolates platform polling, OpenAI SDK usage, and local runtime state without increasing coupling to the dashboard request lifecycle.
- Consequences: Bot credentials, dependencies, execution, and local state are managed separately from the dashboard. If the bot later needs operator controls, approval queues, or shared persistence, it can be integrated intentionally instead of leaking background-automation concerns into the web app by default.

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
