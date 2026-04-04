# Project Overview

- Last updated: 2026-04-02T18:44:50-05:00
- Source docs: `README.md`, `package.json`, repository layout audit

## Mission

Meta Dashboard is a private internal business dashboard for supported Meta business and professional assets. It is intended to cover Facebook Page messages, Instagram professional DMs, Meta lead forms, ad reporting, CRM contact history, raw webhook preservation, and portal-style command dispatch into websites, databases, internal tables, and Meta assets.

## Current Product State

- Frontend is a Next.js App Router application using TypeScript.
- Shared UI primitives live under `components/ui` with feature workspaces under `components/*`.
- Primary dashboard pages now read only from live Supabase-backed sources; when admin config or live rows are missing, the UI shows empty results instead of sample data.
- Server-side persistence paths exist for webhook and outbound messaging flows when privileged Supabase configuration is present.
- Operators can switch the active dashboard scope by connected business and ad account from the shared header.
- Ad accounts can now map to multiple connected Facebook/Instagram assets through a dedicated join table and UI surfaces reflect those shared links.
- A server-side Meta import route now exists at `app/api/meta/import/route.ts`, backed by `lib/meta/sync-service.ts`.
- The dashboard now uses a simple password gate with cookie-backed admin sessions instead of the previous unrestricted scaffold session.
- Portal command dispatch is scaffolded but not fully wired to live targets.
- Real admin auth and MFA are not finalized yet.

## Important Directories

- `app/`: page routes, layouts, and API handlers.
- `components/`: dashboard workspaces and reusable UI.
- `lib/services/`: feature orchestration and surface-level business logic.
- `lib/repositories/`: repository adapters, including current mock-backed implementations.
- `lib/db/supabase/`: Supabase client/server/admin entry points.
- `lib/meta/`: Meta API integration and webhook processing helpers.
- `supabase/migrations/`: SQL migrations currently present from `0001` through `0009`.
- `.agent/`: durable memory for cross-session work.

## Local Commands

- Install: `cmd /c npm install`
- Dev: `cmd /c npm run dev`
- Lint: `cmd /c npm run lint`
- Typecheck: `cmd /c npm run typecheck`
- Build: `cmd /c npm run build`
- Start: `cmd /c npm run start`

## Verification Baseline

- No dedicated test runner is configured in `package.json`.
- Default verification for most tasks is `typecheck`, `lint`, and `build`.
- For documentation-only changes, verify file creation, links, and repository status; note skipped code verification in the handoff.

## Environment and Safety

- Use `.env.example` as the public contract for required variables.
- Never record real secrets, tokens, or sensitive payload contents in `.agent/` files.
- Treat `SUPABASE_SERVICE_ROLE_KEY`, Meta app secrets, system-user tokens, and encryption keys as server-only.

## Known Delivery Gaps

- Live dashboard reads still depend on Supabase table population and incomplete upstream sync jobs.
- The deployed Meta importer is still blocked in production until `SUPABASE_SERVICE_ROLE_KEY`, `META_APP_ID`, `META_APP_SECRET`, and `META_SYSTEM_USER_ACCESS_TOKEN` are configured.
- Outbound Meta transport is not fully connected.
- Portal target-specific adapters remain incomplete.
- Documentation drift exists between `README.md` and the actual migration set.
