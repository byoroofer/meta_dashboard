# Architecture Notes

- Last updated: 2026-04-01T11:39:33-05:00

## High-Level Shape

This is a Next.js App Router application with server routes under `app/api`. Feature surfaces are split between:

- route entry points in `app/(dashboard)` and `app/(auth)`
- feature UI workspaces in `components/*`
- orchestration in `lib/services/*`
- shared repository/data access in `lib/repositories/*`
- infrastructure helpers in `lib/db`, `lib/meta`, `lib/archive`, `lib/audit`, and related modules

## Data and Integration Boundaries

- `lib/db/supabase/admin.ts`, `server.ts`, and `client.ts` separate privileged, server, and client Supabase concerns.
- `lib/meta/*` contains external Meta integration logic and message-preservation helpers.
- `lib/archive/*` and `lib/audit/*` support retention and traceability expectations for webhook/message flows.
- `types/*` centralize domain and persistence contracts; prefer updating shared types before widening feature-specific assumptions.

## Operational Flows Already Described in README

Inbound message copy flow:

1. Receive raw Meta webhook
2. Persist raw event before normalization
3. Verify signature and dedupe
4. Normalize into conversations and messages
5. Persist archive snapshot hashes
6. Write audit trail records

Outbound message copy flow:

1. Receive outbound send request
2. Persist outbound message before live transport dispatch
3. Persist archive snapshot
4. Return queued transport placeholder until live Meta send hookup exists

Portal command system:

- Inventory targets
- Define command templates
- Track execution history
- Dispatch through placeholder API routes pending real adapters

## Current Architectural Realities

- UI pages are ahead of backend integration in several areas; mock repositories still stand in for live reads.
- API handlers exist for ads, archive, audit, connected accounts, inbox, leads, messages, Meta webhooks, portal commands, settings, and tracking.
- Supabase migrations in the repo currently extend to `0009_first_party_customer_data_views.sql`, while `README.md` only documents application through `0006`. Treat the migration directory as canonical until docs are corrected.

## Conventions for New Work

- Put new page routes in `app/` and keep feature UI in `components/`.
- Keep API route handlers thin; move logic into `lib/services` or lower-level helpers.
- Keep external service calls and privileged DB actions server-side only.
- When replacing mock data with live reads, update both the repository/service boundary and the corresponding project memory so later agents know the surface is no longer mocked.
- If schema changes land, update both the migration list and any impacted type definitions.
