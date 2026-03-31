# Meta Dashboard

Private internal business dashboard for supported Meta business and professional assets only:

- Facebook Page messages
- Instagram professional DMs
- Meta lead form submissions
- Meta ad account reporting
- CRM contact history
- Raw webhook and message archive preservation
- Portal command dispatch into websites, databases, internal tables, and Meta business assets

## Architecture Summary

- `app/`: Next.js App Router pages, route groups, and server route handlers
- `components/`: shared shell, feature workspaces, and `shadcn/ui`-style primitives
- `lib/`: auth, config, Meta integration boundaries, archive helpers, audit helpers, repositories, services, and portal orchestration scaffolding
- `types/`: domain, API, Meta, and database typing
- `supabase/migrations/`: paste-ready SQL schema, indexes, views, and helper functions

The UI still uses typed mock repositories for page rendering, but the webhook and outbound send routes now include a real server-side persistence path when `SUPABASE_SERVICE_ROLE_KEY` is configured. The portal layer is also scaffolded so command dispatch can later target Meta, client websites, databases, and internal operational tables from one admin surface.

## Message Copy System

Inbound copy path:

1. Receive raw Meta webhook
2. Persist `raw_webhook_events` before normalization
3. Verify signature and dedupe
4. Normalize supported messaging events into `conversations` and `messages`
5. Persist `message_archive` snapshot hashes
6. Write audit trail records

Outbound copy path:

1. Receive outbound send request
2. Persist outbound `messages` row before live transport dispatch
3. Persist archive snapshot for the outbound copy
4. Return queued transport placeholder for later Meta send hookup

## Portal Command System

The dashboard is being prepared as an operator portal that can dispatch controlled commands to:

- Connected Meta business assets
- Client websites and website APIs
- Client databases
- Internal operational tables in Supabase

Current scaffolded portal surfaces:

- Integration targets inventory
- Command templates
- Command execution history
- Dispatch placeholder API routes ready for live integration wiring

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_WEBHOOK_VERIFY_TOKEN`
- `META_WEBHOOK_APP_SECRET`
- `META_SYSTEM_USER_ACCESS_TOKEN`
- `ENCRYPTION_KEY`

## Local Setup

1. Install dependencies:

```powershell
cmd /c npm install
```

2. Start the app:

```powershell
cmd /c npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Build and Verification

```powershell
cmd /c npm run typecheck
cmd /c npm run lint
cmd /c npm run build
```

## Supabase

Apply the migration files in order:

- `supabase/migrations/0001_core_schema.sql`
- `supabase/migrations/0002_indexes_and_constraints.sql`
- `supabase/migrations/0003_views_and_helper_functions.sql`
- `supabase/migrations/0004_automation_and_lead_delivery.sql`
- `supabase/migrations/0005_message_copy_constraints.sql`
- `supabase/migrations/0006_portal_command_center.sql`

These migrations create the required operational, archive, sync, audit, auto-responder, website lead-delivery, message-copy dedupe, and portal command-center structures.

## Deployment

- GitHub repo root should contain the app
- Vercel root directory should be `/`
- Add the same environment variables in Vercel Project Settings
- Do not expose Meta or Supabase privileged keys to client code

## Remaining Integration Work

- Replace the mock page data adapters with live Supabase reads
- Hook outbound transport to the actual Meta business messaging send APIs
- Finalize target-specific adapters for website, database, and table command dispatch
- Expand webhook normalization for additional Meta event shapes beyond the current supported message path
- Add queue-backed retries and dead-letter handling for failed normalizations and failed command executions
- Activate real admin auth and MFA enforcement
